import { Howl } from "howler";
import _ from "lodash";
import { note } from "./notes.mjs";

export interface NoteSequence {
  playNote(): void;
}

export interface NotePlayer {
  playNote(chroma: string, octave: number): void;
}

export class BasicNotePlayer implements NotePlayer {
  private howl: Howl;

  constructor(instrumentPath: string, notes: number, length: number, startNote: note.Note) {
    const sprites: Array<[string, [start: number, end: number]]> = [];
    let n = startNote;
    for (let i = 0; i < notes; ++i) {
      sprites.push([note.toString(n), [i * length, length]]);
      n = note.inc(n);
    }
    const sprite = Object.fromEntries(sprites);

    this.howl = new Howl({
      src: instrumentPath,
      sprite,
      preload: true,
    });
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

export class PatternNoteSequence {
  octave = 0;
  note = 0;
  octaves = [3, 4, 5, 6];
  pattern = ["C", "D", "E", "G", "A"];

  constructor(private notePlayer: NotePlayer) {}

  playNote(): void {
    this.notePlayer.playNote(this.pattern[this.note], this.octaves[this.octave]);
    this.note = (this.note + 1) % this.pattern.length;
    this.octave = this.note === 0 ? (this.octave + 1) % this.octaves.length : this.octave;
  }
}
