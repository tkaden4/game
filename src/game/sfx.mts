import { Howl } from "howler";
import _ from "lodash";
import { note } from "./notes.mjs";

export interface NoteSequence {
  playNote(): void;
}

export interface NotePlayer {
  playNote(chroma: string, octave: number): void;
}

export class FontNotePlayer implements NotePlayer {
  private howl: Howl;

  static async load(fontPath: string, length: number, startNote: note.Note, endNote: note.Note) {
    const sprites: Array<[string, [start: number, end: number]]> = [];
    let n = startNote;
    const goalPost = note.inc(endNote);
    for (let i = 0; !note.eq(n, goalPost); ++i) {
      sprites.push([note.toString(n), [i * length, length]]);
      n = note.inc(n);
    }
    const sprite = Object.fromEntries(sprites);

    const howl = new Howl({
      src: fontPath,
      sprite,
    });

    return new Promise<FontNotePlayer>((resolve, reject) => {
      howl.on("load", () => {
        resolve(new FontNotePlayer(howl));
      });

      howl.on("loaderror", () => {
        reject("unable to load");
      });

      howl.load();
    });
  }

  private constructor(howl: Howl) {
    this.howl = howl;
  }

  playNote(chroma: string, octave: number): void {
    this.howl.play(`${chroma}${octave}`);
  }
}

export class RandomNoteSequence {
  constructor(private notePlayer: NotePlayer) {}

  playNote() {
    let chroma = _.sample(["C", "E", "G", "B", "C"])!;
    let octave = _.sample([3, 4, 5, 6])!;
    this.notePlayer.playNote(chroma, octave);
  }
}

export enum PatternType {
  Ascending,
  Descending,
  Alternating,
}

export class PatternNoteSequence {
  idx = 0;
  direction = 1;

  constructor(private notePlayer: NotePlayer, private pattern: note.Note[], private type: PatternType) {
    switch (type) {
      case PatternType.Alternating:
      case PatternType.Ascending:
        this.idx = 0;
        this.direction = 1;
        break;
      case PatternType.Descending:
        this.idx = pattern.length - 1;
        this.direction = -1;
        break;
    }
  }

  playNote(): void {
    this.notePlayer.playNote(this.pattern[this.idx].chroma, this.pattern[this.idx].octave);

    this.idx = (this.idx + 1) % this.pattern.length;
  }
}
