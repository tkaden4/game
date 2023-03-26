export namespace note {
  const notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  export type Note = {
    chroma: string;
    octave: number;
  };

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
