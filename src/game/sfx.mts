import _ from "lodash";

export const DEFAULT_SFX = {
  C4: new Audio("assets/sfx/C4.wav"),
  C5: new Audio("assets/sfx/C5.wav"),
  C6: new Audio("assets/sfx/C6.wav"),
  B4: new Audio("assets/sfx/B4.wav"),
  B5: new Audio("assets/sfx/B5.wav"),
  B6: new Audio("assets/sfx/B6.wav"),
  G4: new Audio("assets/sfx/G4.wav"),
  G5: new Audio("assets/sfx/G5.wav"),
  G6: new Audio("assets/sfx/G6.wav"),
};

export function playRandomNote() {
  let sound = _.sample(_.values(DEFAULT_SFX));
  ((sound as any as HTMLAudioElement).cloneNode(true) as HTMLAudioElement).play();
}
