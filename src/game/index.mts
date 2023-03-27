import * as pixi from "pixi.js";

import axios from "axios";
import _ from "lodash";
import matter from "matter-js";
import { FontNotePlayer, NotePlayer } from "../audio.mjs";
import { note } from "../music.mjs";
import { changeFavicon, createHollowBox } from "../util.mjs";
import { GFXMeta, SFXMeta } from "./assets.mjs";
import { basicEntity } from "./entity.mjs";
import { Player } from "./player.mjs";

export async function main() {
  const [gfx_meta, sfx_meta] = await Promise.all([
    axios.get("assets/meta/gfx.json").then((x) => x.data as GFXMeta),
    axios.get("assets/meta/sfx.json").then((x) => x.data as SFXMeta),
  ]);

  // Load all sprites
  const sprites: Record<string, { sprite: pixi.Sprite; path: string }> = {};
  for (const sprite of gfx_meta) {
    sprites[sprite.name] = {
      sprite: pixi.Sprite.from(sprite.path),
      path: sprite.path,
    };
  }

  // Load the instruments
  const C2 = note.create("C", 2);
  const C8 = note.create("C", 8);
  const instruments: Record<string, NotePlayer> = {};
  for (const instrument of sfx_meta) {
    instruments[instrument.name] = await FontNotePlayer.load(instrument.path, 2000, 200, C2, C8);
  }

  // Player modes
  const locrian = {
    notes: note.parseSeq("C5", "Db5", "Eb5", "F5", "Gb5", "Ab5", "Bb5", "C6"),
    sprite: sprites.purple,
  };
  const phrygian = {
    notes: note.parseSeq("C5", "Db5", "Eb5", "F5", "G5", "Ab5", "Bb5", "C6"),
    sprite: sprites.blue,
  };
  const aeolian = {
    notes: note.parseSeq("C5", "D5", "Eb5", "F5", "G5", "Ab5", "Bb5", "C6"),
    sprite: sprites.green,
  };
  const dorian = {
    notes: note.parseSeq("C5", "D5", "Eb5", "F5", "G5", "A5", "Bb5", "C6"),
    sprite: sprites.yellow,
  };
  const mixolydian = {
    notes: note.parseSeq("C5", "D5", "E5", "F5", "G5", "A5", "Bb5", "C6"),
    sprite: sprites.orange,
  };
  const ionian = {
    notes: note.parseSeq("C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6"),
    sprite: sprites.red,
  };
  const lydian = {
    notes: note.parseSeq("C5", "D5", "E5", "Gb5", "G5", "A5", "B5", "C6"),
    sprite: sprites.pink,
  };

  const instrument = instruments.wurli;

  const modelist = [locrian, phrygian, aeolian, dorian, mixolydian, ionian, lydian];
  let currentMode = _.random(0, modelist.length - 1);

  const onPlayerChange = () => {
    const cur = modelist[currentMode];
    changeFavicon(cur.sprite.path);
    player.entity.sprite.texture = cur.sprite.sprite.texture;
    currentMode = (currentMode + 1) % modelist.length;
  };

  const app = new pixi.Application({
    resizeTo: window,
    autoDensity: true,
    antialias: true,
  });

  document.body.appendChild(app.view as any);

  app.renderer.events.cursorStyles.default = "crosshair";

  const world = matter.World.create({});
  const engine = matter.Engine.create({
    world,
    gravity: {
      scale: 1,
      x: 0,
      y: -0.0,
    },
  });

  const tinyDots = _.range(0, 200).map((x) =>
    basicEntity(new pixi.Sprite(sprites.grey.sprite.texture), {
      x: Math.random() * app.view.width + 20,
      y: Math.random() * app.view.height + 20,
      w: 3,
      h: 3,
      r: 1,
    })
  );

  for (const dot of tinyDots) {
    app.stage.addChild(dot.sprite);
    dot.sprite.alpha = 0.3;
    matter.Composite.add(engine.world, [dot.body]);
  }

  const box = basicEntity(sprites.grey.sprite, {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    w: 45,
    h: 45,
    r: 1,
  });

  const player = new Player(box);

  app.stage.addChild(box.sprite);

  const restitution = 1;
  const wallSize = 1000;
  let walls = createHollowBox(wallSize, app.view.width, app.view.height, restitution);
  matter.Composite.add(engine.world, [walls, box.body]);

  const mousePosition = matter.Vector.create();

  let maxSize = matter.Vector.magnitude(matter.Vector.create(app.view.width, app.view.height));

  const onWindowSizeChange = () => {
    const x = window.innerWidth;
    const y = window.innerHeight;
    matter.Composite.remove(engine.world, walls);
    walls = createHollowBox(wallSize, x, y, restitution);
    matter.Composite.add(engine.world, walls);
    maxSize = matter.Vector.magnitude(matter.Vector.create(x, y));
  };

  window.addEventListener("resize", () => {
    onWindowSizeChange();
  });

  window.addEventListener("mousemove", (event) => {
    mousePosition.x = event.x;
    mousePosition.y = event.y;
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      player.jump();
    }
  });

  const onSelect = (x: number, y: number) => {
    const pos = matter.Vector.create(x, y);
    if (matter.Bounds.contains(box.body.bounds, pos)) {
      onPlayerChange();
    } else {
      onLaunch(x, y);
    }
  };

  const onLaunch = (x: number, y: number) => {
    const toVector = matter.Vector.create(x, y);
    const distanceVector = matter.Vector.create(
      toVector.x - player.entity.body.position.x,
      toVector.y - player.entity.body.position.y
    );
    const forceVector = Player.forceVector(player.entity.body.position, toVector, maxSize);
    const forceBucket = Math.floor(
      (matter.Vector.magnitude(distanceVector) / maxSize) * modelist[currentMode].notes.length
    );

    const note = modelist[currentMode].notes[forceBucket];
    instrument.playNote(note.chroma, note.octave);
    matter.Body.applyForce(player.entity.body, player.entity.body.position, forceVector);
  };

  window.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    const x = touch.pageX;
    const y = touch.pageY;
    onSelect(x, y);
  });

  window.addEventListener("dragstart", (e) => {});

  window.addEventListener("click", (event) => {
    onSelect(event.x, event.y);
  });

  app.ticker.add(() => {
    matter.Engine.update(engine, Math.floor(app.ticker.deltaMS));
    // move the player back into the screen if we glitched outside of it
    const playerPos = player.entity.body.position;
    if (playerPos.x < 0 || playerPos.x > app.view.width) {
      matter.Body.set(player.entity.body, "position", {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      matter.Body.setVelocity(player.entity.body, { x: 0, y: 0 });
      onWindowSizeChange();
    }
    if (playerPos.y < 0 || playerPos.y > app.view.height) {
      matter.Body.set(player.entity.body, "position", {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      matter.Body.setVelocity(player.entity.body, { x: 0, y: 0 });
      onWindowSizeChange();
    }
    player.update();

    for (const dot of tinyDots) {
      dot.update();
    }
  });

  onPlayerChange();

  matter.Body.setAngularVelocity(player.entity.body, Math.sign(Math.random() - 0.5) * Math.random() * 0.2 + 0.05);
}

window.addEventListener("load", () => {
  main();
});
