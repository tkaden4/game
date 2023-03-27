import { writeFileSync } from "fs";
import glob from "glob";
import path from "path";
import fs from "node:fs"

function createMetadata() {
  let sfx = [];
  for (const font of glob.sync("./assets/sfx/instruments/*")) {
    sfx.push({
      path: font.replaceAll("\\", "/"),
      name: path.basename(font, path.extname(font))
    });
  }

  console.log(sfx.length, "sound files");

  let gfx = [];
  for (const image of glob.sync("./assets/gfx/*")) {
    gfx.push({
      path: image.replaceAll("\\", "/"),
      name: path.basename(image, path.extname(image))
    });
  }

  console.log(gfx.length, "graphics files");

  writeFileSync("./assets/meta/sfx.json", JSON.stringify(sfx, null, 2));
  writeFileSync("./assets/meta/gfx.json", JSON.stringify(gfx, null, 2));
}


if (process.argv.includes("--watch")) {
  createMetadata();
  const gfxWatch = fs.watch("assets/gfx", { recursive: true });
  const sfxwatch = fs.watch("assets/sfx", { recursive: true });


  gfxWatch.on("change", (e, s) => {
    console.log(e, s);
    createMetadata();
  })
  sfxwatch.on("change", (e, s) => {
    console.log(e, s);
    createMetadata();
  })
} else {
  createMetadata();
}