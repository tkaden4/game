import { writeFileSync } from "fs";
import glob from "glob";
import path from "path";

let sfx = [];
for (const font of glob.sync("./assets/sfx/fonts/*")) {
  sfx.push({
    path: font.replaceAll("\\", "/"),
    name: path.basename(font, path.extname(font))
  });
}

let gfx = [];
for (const image of glob.sync("./assets/gfx/*")) {
  gfx.push({
    path: image.replaceAll("\\", "/"),
    name: path.basename(image, path.extname(image))
  });
}

writeFileSync("./assets/meta/sfx.json", JSON.stringify(sfx, null, 2));
writeFileSync("./assets/meta/gfx.json", JSON.stringify(gfx, null, 2));