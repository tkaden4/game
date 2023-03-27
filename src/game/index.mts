import * as pixi from "pixi.js";

import axios from "axios";
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

  // Set up the sfx player
  const sequence = note.parseSeq("C5", "E5", "G5", "B5", "Db6");
  const sfx: NoteSequence = new PatternNoteSequence(instruments.pipe, sequence, PatternType.Alternating);

  const app = new pixi.Application({
    resizeTo: window,
    autoDensity: true,
    antialias: true,
  });

  document.body.appendChild(app.view as any);

  app.renderer.events.cursorStyles.default = "crosshair";

  const world = matter.World.create({});
  const engine = matter.Engine.create({ world });

  const spriteList = Object.values(sprites);
  let currentSprite = 0;

  const onPlayerChange = () => {
    const cur = spriteList[currentSprite];
    changeFavicon(cur.path);
    player.entity.sprite.texture = cur.sprite.texture;
    currentSprite = (currentSprite + 1) % spriteList.length;
  };

  const box = basicEntity(sprites.grey.sprite, {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    w: 45,
    h: 45,
  });

  const player = new Player(box);

  app.stage.addChild(box.sprite);

  function createWalls(wallSize: number) {
    return matter.Composite.create({
      bodies: [
        // Top
        matter.Bodies.rectangle(app.view.width / 2, -wallSize / 2, app.view.width, wallSize, {
          isStatic: true,
        }),
        // Bottom
        matter.Bodies.rectangle(app.view.width / 2, app.view.height + wallSize / 2, app.view.width, wallSize, {
          isStatic: true,
        }),
        // Left
        matter.Bodies.rectangle(-wallSize / 2, app.view.height / 2, wallSize, app.view.height, {
          isStatic: true,
        }),
        // Right
        matter.Bodies.rectangle(app.view.width + wallSize / 2, app.view.height / 2, wallSize, app.view.height, {
          isStatic: true,
        }),
      ],
    });
  }

  const wallSize = 1000;
  let walls = createWalls(wallSize);
  matter.Composite.add(engine.world, [walls, box.body]);

  const mousePosition = matter.Vector.create();

  window.addEventListener("resize", (ev) => {
    matter.Composite.remove(engine.world, walls);
    walls = createWalls(wallSize);
    matter.Composite.add(engine.world, walls);
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
    player.slice(matter.Vector.create(x, y));
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
    }
    if (playerPos.y < 0 || playerPos.y > app.view.height) {
      matter.Body.set(player.entity.body, "position", {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      matter.Body.setVelocity(player.entity.body, { x: 0, y: 0 });
    }
    player.update();
  });

  onPlayerChange();
}

window.addEventListener("load", () => {
  main();
});
