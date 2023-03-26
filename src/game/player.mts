import matter, { Vector } from "matter-js";
import { Entity } from "./entity.mjs";

export class Player {
  hasJumped = false;
  color = 0xff0000;
  alpha = 1;
  jumpStrength = 1;

  constructor(public entity: Entity) {}

  static forceVector(from: Vector, to: Vector) {
    const rawVector = matter.Vector.create(to.x - from.x, to.y - from.y);
    const distance = matter.Vector.magnitude(rawVector);
    const normalized = matter.Vector.div(matter.Vector.normalise(rawVector), 10);
    return matter.Vector.mult(normalized, distance / 400);
  }

  slice(to: Vector) {
    matter.Body.applyForce(
      this.entity.body,
      this.entity.body.position,
      Player.forceVector(this.entity.body.position, to)
    );
  }

  jump() {
    if (!this.hasJumped) {
      const upVec = matter.Vector.create(0, -0.1 * this.jumpStrength);
      matter.Body.applyForce(this.entity.body, this.entity.body.position, upVec);
      this.hasJumped = true;
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
