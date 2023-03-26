import { Howl } from "howler";
import _ from "lodash";

type NOTE_KEY = `${string}${number}`;
const DEFAULT_SFX: Record<NOTE_KEY, Howl> = {
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

export interface SFX {
  playNote(): void;
}

export class RandomSFX {
  playNote() {
    let sound = _.sample(_.values(DEFAULT_SFX));
    sound?.play();
  }
}

export class PatternSFX {
  octave = 0;
  note = 0;
  octaves = [4, 5, 6];
  pattern = ["C", "E", "G", "B"];

  playNote(): void {
    const note = `${this.pattern[this.note]}${this.octaves[this.octave]}` as const;
    const sfx = DEFAULT_SFX[note];
    sfx?.play();

    this.note = (this.note + 1) % this.pattern.length;
    this.octave = this.note === 0 ? (this.octave + 1) % this.octaves.length : this.octave;
  }
}
