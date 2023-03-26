import * as pixi from "pixi.js";

import matter from "matter-js";
import { basicEntity } from "./entity.mjs";
import { note } from "./notes.mjs";
import { Player } from "./player.mjs";
import { FontNotePlayer, PatternNoteSequence, PatternType } from "./sfx.mjs";

export async function main() {
  const gravity = matter.Vector.create(0, 0.5);

  const C2 = note.create("C", 2);
  const C8 = note.create("C", 8);

  const [glass, pipe] = await Promise.all([
    FontNotePlayer.load("assets/sfx/fonts/glass.wav", 2000, C2, C8),
    await FontNotePlayer.load("assets/sfx/fonts/pipe.wav", 2000, C2, C8),
  ]);

  const instruments = {
    glass,
    pipe,
  };

  const sfx = new PatternNoteSequence(
    instruments.glass,
    [note.create("C", 4), note.create("G", 4), note.create("D", 5)],
    PatternType.Ascending
  );

  const app = new pixi.Application({
    resizeTo: window,
    autoDensity: true,
    antialias: false,
  });

  document.body.appendChild(app.view as any);

  app.renderer.events.cursorStyles.default = "crosshair";

  const world = matter.World.create({
    gravity: {
      x: gravity.x,
      y: gravity.y,
      scale: 1,
    },
  });
  const engine = matter.Engine.create({ world });

  const box = basicEntity(pixi.Sprite.from("assets/gfx/sprite.png"), {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    w: 40,
    h: 40,
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

  const onLaunch = (x: number, y: number) => {
    sfx.playNote();
    player.slice(matter.Vector.create(x, y));
  };

  window.addEventListener("touchstart", (ev) => {
    const touch = ev.touches[0];
    const x = touch.pageX;
    const y = touch.pageY;
    onLaunch(x, y);
  });
  window.addEventListener("click", (ev) => {
    onLaunch(ev.x, ev.y);
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
}

window.addEventListener("load", () => {
  main();
});
