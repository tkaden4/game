import matter, { Vector } from "matter-js";
import { Entity } from "./entity.mjs";

export class Player {
  hasJumped = false;
  color = 0xff0000;
  alpha = 1;
  jumpStrength = 1;

  constructor(public entity: Entity) {}

  static forceVector(from: Vector, to: Vector, max: number) {
    const rawVector = matter.Vector.create(to.x - from.x, to.y - from.y);
    const rawLength = matter.Vector.magnitude(rawVector);
    const normalized = matter.Vector.normalise(rawVector);

    const scalingFactor = 0.4;
    const actualMagnitude = scalingFactor * (Math.min(rawLength, max) / max);
    return matter.Vector.mult(normalized, actualMagnitude);
  }

  slice(to: Vector, maxMagnitude: number) {
    matter.Body.applyForce(
      this.entity.body,
      this.entity.body.position,
      Player.forceVector(this.entity.body.position, to, maxMagnitude)
    );
  }

  jump() {
    if (!this.hasJumped) {
      const upVec = matter.Vector.create(0, -0.1 * this.jumpStrength);
      matter.Body.applyForce(this.entity.body, this.entity.body.position, upVec);
      this.hasJumped = true;
      setTimeout(() => {
        this.hasJumped = false;
      }, 500);
    }
  }

  update() {
    this.entity.sprite.x = this.entity.body.position.x;
    this.entity.sprite.y = this.entity.body.position.y;
    this.entity.sprite.rotation = this.entity.body.angle;

    if (this.entity.body.position.y)
      if (this.hasJumped) {
        this.entity.sprite.alpha = 0.5;
      } else {
        this.entity.sprite.alpha = 1;
      }
  }
}
