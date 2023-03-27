import * as pixi from "pixi.js";

import axios from "axios";
import _ from "lodash";
import matter from "matter-js";
import { basicEntity } from "./entity.mjs";
import { note } from "./notes.mjs";
import { Player } from "./player.mjs";
import { FontNotePlayer, NotePlayer, NoteSequence, PatternNoteSequence, PatternType } from "./sfx.mjs";

function changeFavicon(path: string) {
  let link = document.querySelector("link[rel~='icon']") as any;
  if (!link) {
    link = document.createElement("link")! as any;
    link!.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = path;
}

export async function main() {
  // Load asset metadata
  const [gfx_meta, sfx_meta] = await Promise.all([
    axios.get("assets/meta/gfx.json").then((x) => x.data),
    axios.get("assets/meta/sfx.json").then((x) => x.data),
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
    instruments[instrument.name] = await FontNotePlayer.load(instrument.path, 2000, C2, C8);
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

  const instrument = instruments.glass;

  const modelist = [locrian, phrygian, aeolian, dorian, mixolydian, ionian, lydian];
  let currentMode = _.random(0, modelist.length - 1);

  // Set up the sfx player
  const defaultSequence = note.parseSeq("C5", "E5", "G5", "B5", "Db6", "Eb6");
  let sfx: NoteSequence = new PatternNoteSequence(instrument, defaultSequence, PatternType.Alternating);

  const onPlayerChange = () => {
    const cur = modelist[currentMode];
    changeFavicon(cur.sprite.path);
    player.entity.sprite.texture = cur.sprite.sprite.texture;
    sfx = new PatternNoteSequence(instrument, cur.notes, PatternType.Alternating);
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
      y: 0.0005,
    },
  });

  const box = basicEntity(sprites.grey.sprite, {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    w: 45,
    h: 45,
  });

  const player = new Player(box);

  app.stage.addChild(box.sprite);

  function createWalls(wallSize: number, width: number, height: number) {
    return matter.Composite.create({
      bodies: [
        // Top
        matter.Bodies.rectangle(width / 2, -wallSize / 2, width, wallSize, {
          isStatic: true,
        }),
        // Bottom
        matter.Bodies.rectangle(width / 2, height + wallSize / 2, width, wallSize, {
          isStatic: true,
        }),
        // Left
        matter.Bodies.rectangle(-wallSize / 2, height / 2, wallSize, height, {
          isStatic: true,
        }),
        // Right
        matter.Bodies.rectangle(width + wallSize / 2, height / 2, wallSize, height, {
          isStatic: true,
        }),
      ],
    });
  }

  const wallSize = 1000;
  let walls = createWalls(wallSize, app.view.width, app.view.height);
  matter.Composite.add(engine.world, [walls, box.body]);

  const mousePosition = matter.Vector.create();

  let maxSize = matter.Vector.magnitude(matter.Vector.create(app.view.width, app.view.height));

  const onWindowSizeChange = () => {
    const x = window.innerWidth;
    const y = window.innerHeight;
    matter.Composite.remove(engine.world, walls);
    walls = createWalls(wallSize, x, y);
    matter.Composite.add(engine.world, walls);
    maxSize = matter.Vector.magnitude(matter.Vector.create(x, y));
  };

  window.addEventListener("resize", (ev) => {
    onWindowSizeChange();
  });

  window.addEventListener("mousemove", (ev) => {
    mousePosition.x = ev.x;
    mousePosition.y = ev.y;
  });

  window.addEventListener("keydown", (ev) => {
    if (ev.key === " ") {
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
    sfx.playNote();
    player.slice(matter.Vector.create(x, y), maxSize);
  };

  window.addEventListener("touchstart", (ev) => {
    const touch = ev.touches[0];
    const x = touch.pageX;
    const y = touch.pageY;
    onSelect(x, y);
  });
  window.addEventListener("click", (ev) => {
    onSelect(ev.x, ev.y);
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
  });

  onPlayerChange();
}

window.addEventListener("load", () => {
  main();
});
