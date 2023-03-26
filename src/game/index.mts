import * as pixi from "pixi.js";

import matter from "matter-js";
import { basicEntity } from "./entity.mjs";
import { Player } from "./player.mjs";

export async function main() {
  const app = new pixi.Application({
    resizeTo: window,
    autoDensity: true,
    antialias: false,
  });

  const gfx = new pixi.Graphics();

  document.body.appendChild(app.view as any);

  app.renderer.plugins.interaction.cursorStyles.default = "crosshair";

  const world = matter.World.create({});
  const engine = matter.Engine.create({ world });

  const box = basicEntity(pixi.Sprite.from("assets/sprite.png"), {
    x: 100,
    y: 100,
    w: 40,
    h: 40,
  });

  const player = new Player(box);

  app.stage.addChild(box.sprite);
  app.stage.addChild(gfx);

  const wallSize = 500;
  const walls = matter.Composite.create({
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

  matter.Composite.add(engine.world, [walls, box.body]);

  const mousePosition = matter.Vector.create();

  window.addEventListener("mousemove", (ev) => {
    mousePosition.x = ev.x;
    mousePosition.y = ev.y;
  });

  window.addEventListener("keydown", (ev) => {
    if (ev.key === " ") {
      player.jump();
    }
  });

  window.addEventListener("touchstart", (ev) => {
    const touch = ev.touches[0];
    const x = touch.pageX;
    const y = touch.pageY;
    player.slice(matter.Vector.create(x, y));
  });
  window.addEventListener("click", (ev) => {
    player.slice(matter.Vector.create(ev.x, ev.y));
  });

  app.ticker.add(() => {
    matter.Engine.update(engine, Math.floor(app.ticker.deltaMS));
    player.update();
  });
}
// Start the game on page load
window.onload = () => {
  main();
};
