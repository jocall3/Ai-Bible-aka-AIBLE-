import React from 'react';
import { SparklesIcon, BookOpenIcon, LayoutIcon } from './IconComponents';
import type { Section, Chapter, Page } from '../types';

interface EditorProps {
  section?: Section;
  chapter?: Chapter;
  page?: Page;
  chapterNumber?: number;
  pageNumber?: number;
  isLoading: boolean;
  error: string | null;
  onGeneratePageContent: () => void;
  onPageContentChange: (newContent: string[]) => void;
  onSelectPage: (pageIndex: number) => void;
}

export const Editor: React.FC<EditorProps> = ({
  section,
  chapter,
  page,
  chapterNumber,
  pageNumber,
  isLoading,
  error,
  onGeneratePageContent,
  onPageContentChange,
  onSelectPage,
}) => {

  const handleVerseChange = (verseIndex: number, newText: string) => {
    if (page && page.content[verseIndex] !== newText) {
      const newContent = [...page.content];
      newContent[verseIndex] = newText;
      onPageContentChange(newContent);
    }
  };

  const renderLoadingState = (message: string, subMessage: string) => (
    <div className="flex flex-col items-center justify-center h-full text-teal-400">
      <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-lg font-mono-tech">{message}</p>
      <p className="text-sm opacity-70">{subMessage}</p>
    </div>
  );

  const renderPageView = () => {
    if (!page) return null;

    if (isLoading && page.content.length === 0) {
      return renderLoadingState('Accessing the digital oracle...', 'Please wait while the genesis block is mined.');
    }
    
    if (page.content.length > 0) {
      return (
        <div className="prose prose-invert max-w-none">
          {page.content.map((verse, index) => (
            <div key={`${chapterNumber}-${pageNumber}-${index}`} className="flex gap-4 items-start group relative">
              <p className="text-teal-500 font-mono-tech select-none w-16 text-right flex-shrink-0 pt-1" aria-hidden="true">
                {chapterNumber}:{index + 1}
              </p>
              <p
                contentEditable
                onBlur={(e) => handleVerseChange(index, e.currentTarget.innerText)}
                suppressContentEditableWarning={true}
                className="flex-1 text-slate-300 leading-relaxed focus:outline-none focus:bg-teal-500/10 rounded px-2 py-1 -mx-2 -my-1 group-hover:bg-slate-800/50 transition-colors"
                aria-label={`Verse ${chapterNumber}:${index + 1}`}
              >
                {verse}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-teal-400 opacity-30">
        <BookOpenIcon className="w-16 h-16 mb-4" />
        <p className="text-lg font-mono-tech">This page is unwritten.</p>
        <p className="text-sm">Use the 'Generate' button to inscribe the first verses.</p>
      </div>
    );
  };
  
  const renderChapterView = () => {
    if (!chapter) return null;

    return (
        <div>
            <h2 className="text-xl text-teal-400 mb-4 border-b border-slate-700 pb-2 font-mono-tech">Pages of this Chapter</h2>
            <ul className="space-y-2">
                {chapter.pages.map((p, index) => (
                    <li key={index}>
                        <button onClick={() => onSelectPage(index)} className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-teal-500/10 transition-colors duration-200 border border-transparent hover:border-teal-500/20">
                            <p className="font-semibold text-teal-300 font-mono-tech">{index + 1}. {p.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{p.content.length > 0 ? `${p.content.length} verses written` : 'Unwritten'}</p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
  }

  const renderHeader = () => {
    if (!section || !chapter) return null;
    return (
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-700">
            <div>
                <p className="text-sm text-teal-500 uppercase tracking-widest font-mono-tech">{section.title}</p>
                <h1 className="text-3xl font-bold text-teal-300 font-mono-tech">{`Chapter ${chapterNumber}: ${chapter.title}`}</h1>
                {page && <h2 className="text-xl text-teal-400 mt-1">{`Page ${pageNumber}: ${page.title}`}</h2>}
            </div>
            {page && (
                <button
                    onClick={onGeneratePageContent}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-slate-900 font-bold rounded-md hover:bg-teal-400 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {isLoading ? 'Generating...' : 'Generate Verses'}
                </button>
            )}
        </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-800/30 rounded-lg border border-slate-700 p-6 overflow-hidden relative">
      {renderHeader()}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
        {page ? renderPageView() : renderChapterView()}
      </div>
    </div>
  );
};