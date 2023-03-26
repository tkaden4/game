import { Howl } from "howler";
import _ from "lodash";

export const DEFAULT_SFX = {
  C4: new Howl({ src: ["assets/sfx/C4.wav"] }),
  C5: new Howl({ src: ["assets/sfx/C5.wav"] }),
  C6: new Howl({ src: ["assets/sfx/C6.wav"] }),
  B4: new Howl({ src: ["assets/sfx/B4.wav"] }),
  B5: new Howl({ src: ["assets/sfx/B5.wav"] }),
  B6: new Howl({ src: ["assets/sfx/B6.wav"] }),
  G4: new Howl({ src: ["assets/sfx/G4.wav"] }),
  G5: new Howl({ src: ["assets/sfx/G5.wav"] }),
  G6: new Howl({ src: ["assets/sfx/G6.wav"] }),
  E4: new Howl({ src: ["assets/sfx/E4.wav"] }),
  E5: new Howl({ src: ["assets/sfx/E5.wav"] }),
  E6: new Howl({ src: ["assets/sfx/E6.wav"] }),
};

export function playRandomNote() {
  let sound = _.sample(_.values(DEFAULT_SFX));
  sound?.play();
}
