
export interface Page {
  title: string;
  content: string[]; // Array of verses
}

export interface Chapter {
  title: string;
  pages: Page[];
}

export interface Section {
  title: string;
  chapters: Chapter[];
}

export type Book = Section[];
