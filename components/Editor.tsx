import React from 'react';
import { SparklesIcon, BookOpenIcon } from './IconComponents';
import type { Section, Chapter, Page } from '../types';

interface EditorProps {
  section?: Section;
  chapter?: Chapter;
  page?: Page;
  sectionNumber?: number;
  chapterNumber?: number;
  pageNumber?: number;
  error: string | null;
  onPageContentChange: (newContent: string) => void;
  onSelectPage: (pageIndex: number) => void;
  onAutoGenerateChapter: () => void;
  chapterGenerationStatus: { active: boolean; message: string };
}

export const Editor: React.FC<EditorProps> = ({
  section,
  chapter,
  page,
  sectionNumber,
  chapterNumber,
  pageNumber,
  error,
  onPageContentChange,
  onSelectPage,
  onAutoGenerateChapter,
  chapterGenerationStatus
}) => {

  const handleContentChange = (newText: string) => {
    if (page && page.content !== newText) {
      onPageContentChange(newText);
    }
  };

  const renderPageView = () => {
    if (!page || !sectionNumber || !pageNumber || !chapterNumber) return null;
    
    if (page.content) {
      return (
        <div className="prose prose-invert max-w-none">
          <div
            contentEditable
            onBlur={(e) => handleContentChange(e.currentTarget.innerText)}
            suppressContentEditableWarning={true}
            className="text-slate-300 leading-relaxed focus:outline-none focus:bg-amber-500/10 rounded px-2 py-1 -mx-2 -my-1 whitespace-pre-wrap"
            aria-label={`Fragment content for ${page.title}`}
          >
            {page.content}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-violet-400 opacity-30">
        <BookOpenIcon className="w-16 h-16 mb-4" />
        <p className="text-lg font-mono-tech">This fragment is unsynthesized.</p>
        <p className="text-sm">Synthesize the narrative from the chapter view.</p>
      </div>
    );
  };
  
  const renderChapterView = () => {
    if (!chapter || !sectionNumber || !chapterNumber) return null;
    const canGenerateChapter = chapter.pages.some(p => !p.content);

    return (
        <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                <h2 className="text-xl text-amber-400 font-mono-tech">Chapter Fragments</h2>
                {canGenerateChapter && (
                     <button
                        onClick={onAutoGenerateChapter}
                        disabled={chapterGenerationStatus.active}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-violet-600/20 border border-violet-500/30 text-violet-300 font-bold rounded-md hover:bg-violet-500/30 hover:text-white transition-all duration-200 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        Synthesize Chapter
                    </button>
                )}
            </div>
             {chapterGenerationStatus.active && (
                <div className="mb-4 p-3 bg-slate-700/50 rounded-lg text-center">
                     <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-violet-400 font-mono-tech">{chapterGenerationStatus.message}</p>
                    </div>
                </div>
            )}
            <ul className="space-y-2">
                {chapter.pages.map((p, index) => (
                    <li key={index}>
                        <button onClick={() => onSelectPage(index)} className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-amber-500/10 transition-colors duration-200 border border-transparent hover:border-amber-500/20">
                            <p className="font-semibold text-amber-300 font-mono-tech">{sectionNumber}.{chapterNumber}.{index + 1}. {p.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{p.content.length > 0 ? `${p.content.trim().split(/\s+/).length} words synthesized` : 'No data'}</p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
  }

  const renderHeader = () => {
    if (!section || !chapter || !sectionNumber || !chapterNumber) return null;
    return (
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-700">
            <div>
                <p className="text-sm text-violet-400 uppercase tracking-widest font-mono-tech">{section.title}</p>
                <h1 className="text-3xl font-bold text-amber-300 font-mono-tech">{`Chapter ${sectionNumber}.${chapterNumber}: ${chapter.title}`}</h1>
                {page && pageNumber && <h2 className="text-xl text-amber-400 mt-1">{`Fragment ${sectionNumber}.${chapterNumber}.${pageNumber}: ${page.title}`}</h2>}
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-gray-800/30 rounded-lg border border-slate-700 p-6 overflow-hidden relative">
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