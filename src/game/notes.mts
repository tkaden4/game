import _ from "lodash";

export namespace note {
  const notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  export type Note = {
    chroma: string;
    octave: number;
  };

  export function parse(candidate: string): note.Note {
    const note = notes.find((x) => candidate.includes(x));
    if (note === undefined) {
      throw new Error(`${candidate} does not contain a valid note`);
    }
    const octave = candidate.substring(note.length, candidate.length);
    if (!/(\d+)/g.test(octave)) {
      throw new Error(`${candidate} does not contain a valid octave number`);
    }
    return {
      chroma: note,
      octave: _.parseInt(octave),
    };
  }

  export function parseSeq(...notes: string[]): note.Note[] {
    return notes.map((x) => parse(x));
  }

  export function create(chroma: string, octave: number): Note {
    return {
      chroma,
      octave,
    };
  }

  export function eq(a: Note, b: Note) {
    return a.chroma === b.chroma && a.octave === b.octave;
  }

  export function inc(note: Note): Note {
    const chroma = chromaIndex(note.chroma);
    const newChroma = (chroma + 1) % 12;
    const newOctave = note.octave + Math.floor((chroma + 1) / 12);
    return {
      chroma: indexToChroma(newChroma),
      octave: newOctave,
    };
  }

  export function indexToChroma(index: number) {
    if (index > 11) {
      throw new Error(`${index} is not a valid chroma index. Must be >=0 and < 12`);
    }
    return notes[index];
  }

  export function chromaIndex(chroma: string) {
    return notes.indexOf(chroma);
  }

  export function toString(n: Note) {
    return `${n.chroma}${n.octave}`;
  }
}
