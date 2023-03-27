import Matter, { Body } from "matter-js";
import { Sprite } from "pixi.js";

export interface Entity {
  sprite: Sprite;
  body: Body;
}

export function basicEntity(sprite: Sprite, opts: { x: number; y: number; w: number; h: number; r: number }) {
  sprite.anchor.set(0.5);
  sprite.width = opts.w;
  sprite.height = opts.h;
  return {
    sprite,
    body: Matter.Bodies.rectangle(opts.x, opts.y, opts.w, opts.h, { restitution: opts.r }),
    update() {
      this.sprite.x = this.body.position.x;
      this.sprite.y = this.body.position.y;
      this.sprite.rotation = this.body.angle;
    },
  };
}
