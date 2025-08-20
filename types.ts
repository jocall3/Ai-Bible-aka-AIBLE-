
export interface Page {
  title: string;
  content: string; // Changed from string[] to string for narrative content
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