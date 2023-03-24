import * as pixi from "pixi.js";

export async function gameMain() {
  const app = new pixi.Application({
    height: 1039,
    width: window.innerWidth,
    autoDensity: true,
  });

  document.body.appendChild(app.view as any);

  const sprite = pixi.Sprite.from("assets/sprite.png");
  app.stage.addChild(sprite);

  app.ticker.add((delta) => {});
}

window.onload = (e) => {
  gameMain();
};
