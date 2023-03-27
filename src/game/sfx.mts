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

  static async load(fontPath: string, offsets: number, length: number, startNote: note.Note, endNote: note.Note) {
    const sprites: Array<[string, [start: number, end: number]]> = [];
    let n = startNote;
    const goalPost = note.inc(endNote);
    for (let i = 0; !note.eq(n, goalPost); ++i) {
      sprites.push([note.toString(n), [i * offsets, length]]);
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

export class RandomNoteSequence implements NoteSequence {
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

export class IterativeNoteSequence implements NoteSequence {
  idx = 0;
  direction = 1;

  constructor(
    private player: NotePlayer,
    private length: number,
    private type: PatternType,
    private nextNote: (i: number) => note.Note
  ) {
    switch (type) {
      case PatternType.Alternating:
      case PatternType.Ascending:
        this.idx = 0;
        this.direction = 1;
        break;
      case PatternType.Descending:
        this.idx = length - 1;
        this.direction = -1;
        break;
    }
  }

  playNote() {
    const note = this.nextNote(this.idx);
    this.player.playNote(note.chroma, note.octave);
    switch (this.type) {
      case PatternType.Ascending:
        this.idx++;
        break;
      case PatternType.Descending:
        this.idx--;
        break;
      case PatternType.Alternating:
        this.idx = this.idx + this.direction;
        if (this.idx >= this.length) {
          this.idx = this.length - 2;
          this.direction = -1;
        } else if (this.idx < 0) {
          this.idx = 1;
          this.direction = 1;
        }
        break;
    }
    this.idx = (this.idx + this.length) % this.length;
  }
}

export class PatternNoteSequence extends IterativeNoteSequence {
  idx = 0;
  direction = 1;

  constructor(notePlayer: NotePlayer, pattern: note.Note[], type: PatternType) {
    super(notePlayer, pattern.length, type, (i) => pattern[i]);
  }
}
