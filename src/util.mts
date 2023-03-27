import matter from "matter-js";

export function changeFavicon(path: string) {
  let link = document.querySelector("link[rel~='icon']") as any;
  if (!link) {
    link = document.createElement("link")! as any;
    link!.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = path;
}

export function createHollowBox(wallSize: number, width: number, height: number, restitution: number) {
  return matter.Composite.create({
    bodies: [
      // Top
      matter.Bodies.rectangle(width / 2, -wallSize / 2, width, wallSize, {
        isStatic: true,
        restitution,
      }),
      // Bottom
      matter.Bodies.rectangle(width / 2, height + wallSize / 2, width, wallSize, {
        isStatic: true,
        restitution,
      }),
      // Left
      matter.Bodies.rectangle(-wallSize / 2, height / 2, wallSize, height, {
        isStatic: true,
        restitution,
      }),
      // Right
      matter.Bodies.rectangle(width + wallSize / 2, height / 2, wallSize, height, {
        isStatic: true,
        restitution,
      }),
    ],
  });
}
