import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { CodexOutline } from './components/CodexOutline';
import { LoadingOverlay } from './components/LoadingOverlay';
import { INITIAL_BOOK_DATA } from './constants';
import { generatePageTitles, generatePageContent } from './services/geminiService';
import { downloadBookAsHtml } from './utils/downloadHelper';
import type { Book, Section, Chapter, Page } from './types';

const LOCAL_STORAGE_KEY = 'aible-codex-data-v3';

const App: React.FC = () => {
  const [bookData, setBookData] = useState<Book>(() => {
    try {
      const savedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // V3 check for scaffolded data
        if (Array.isArray(parsedData) && parsedData[0]?.chapters[0]?.hasOwnProperty('pages')) {
          return parsedData;
        }
      }
      return INITIAL_BOOK_DATA;
    } catch (error) {
      console.error("Failed to parse book data from local storage", error);
      return INITIAL_BOOK_DATA;
    }
  });

  const [selectedPath, setSelectedPath] = useState<string>('0-0');
  const [activeView, setActiveView] = useState<'editor' | 'outline'>('editor');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isScaffolding, setIsScaffolding] = useState<boolean>(false);
  const [scaffoldingMessage, setScaffoldingMessage] = useState<string>('');

  // Auto-save book data
  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookData));
    } catch (error) {
      console.error("Failed to save book data to local storage", error);
    }
  }, [bookData]);

  // Auto-scaffold book on first load
  useEffect(() => {
    const isScaffolded = bookData.some(s => s.chapters.some(c => c.pages.length > 0));
    if (!isScaffolded) {
      const scaffoldBook = async () => {
        setIsScaffolding(true);
        setScaffoldingMessage('Initiating the codex forge...');
        let newBook = JSON.parse(JSON.stringify(INITIAL_BOOK_DATA));

        for (const [sIdx, section] of newBook.entries()) {
          for (const [cIdx, chapter] of section.chapters.entries()) {
            try {
              setScaffoldingMessage(`Outlining: ${section.title} - Chapter ${cIdx + 1}`);
              const pageTitles = await generatePageTitles(section.title, chapter.title);
              const newPages: Page[] = pageTitles.map(title => ({ title, content: [] }));
              newBook[sIdx].chapters[cIdx].pages = newPages;
              setBookData(JSON.parse(JSON.stringify(newBook))); // Update state progressively
              await new Promise(res => setTimeout(res, 200)); // Rate limiting
            } catch (err) {
              console.error(`Failed to scaffold ${section.title} - ${chapter.title}:`, err);
              setError(`Failed to outline a chapter. You may need to refresh. Error: ${err instanceof Error ? err.message : 'Unknown'}`);
            }
          }
        }
        setScaffoldingMessage('Codex forged successfully.');
        setTimeout(() => setIsScaffolding(false), 1500);
      };
      scaffoldBook();
    }
  }, []); // Run only on initial mount

  const { sectionIndex, chapterIndex, pageIndex } = useMemo(() => {
    const [sec, chap, page] = selectedPath.split('-').map(Number);
    return { sectionIndex: sec, chapterIndex: chap, pageIndex: page };
  }, [selectedPath]);

  const selectedSection: Section | undefined = bookData[sectionIndex];
  const selectedChapter: Chapter | undefined = selectedSection?.chapters[chapterIndex];
  const selectedPage: Page | undefined = !isNaN(pageIndex) ? selectedChapter?.pages[pageIndex] : undefined;

  const handleSelectPath = useCallback((path: string) => {
    setSelectedPath(path);
    const hasPage = path.split('-').length === 3;
    if (hasPage) {
      setActiveView('editor');
    }
  }, []);
  
  const handleDownload = useCallback(() => {
    downloadBookAsHtml(bookData);
  }, [bookData]);

  const handlePageContentChange = useCallback((newContent: string[]) => {
    if (isNaN(pageIndex)) return;
    setBookData(prevBook => {
      const newBook = JSON.parse(JSON.stringify(prevBook));
      newBook[sectionIndex].chapters[chapterIndex].pages[pageIndex].content = newContent;
      return newBook;
    });
  }, [sectionIndex, chapterIndex, pageIndex]);

  const handleGeneratePageContent = useCallback(async () => {
    if (!selectedSection || !selectedChapter || !selectedPage) return;

    setIsLoading(true);
    setError(null);
    try {
      const previousPageTitles = selectedChapter.pages
        .slice(0, pageIndex)
        .map(p => p.title);
      
      const content = await generatePageContent(
        selectedSection.title,
        selectedChapter.title,
        selectedPage.title,
        previousPageTitles
      );
      handlePageContentChange(content);
    } catch (err) {
      console.error('Failed to generate content:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSection, selectedChapter, selectedPage, pageIndex, handlePageContentChange]);

  if (isScaffolding) {
    return <LoadingOverlay message={scaffoldingMessage} />;
  }

  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen flex selection:bg-teal-400 selection:text-slate-900">
      <Sidebar
        book={bookData}
        selectedPath={selectedPath}
        onSelectPath={handleSelectPath}
        onDownload={handleDownload}
      />
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
         <div className="flex-shrink-0 mb-4">
            <div className="flex border-b border-slate-700">
                <button 
                    onClick={() => setActiveView('editor')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeView === 'editor' ? 'border-b-2 border-teal-400 text-teal-300' : 'text-slate-400 hover:text-white'}`}
                >
                    Editor
                </button>
                <button
                    onClick={() => setActiveView('outline')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeView === 'outline' ? 'border-b-2 border-teal-400 text-teal-300' : 'text-slate-400 hover:text-white'}`}
                >
                    Codex Outline
                </button>
            </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
           {activeView === 'editor' ? (
                selectedChapter ? (
                  <Editor
                    section={selectedSection}
                    chapter={selectedChapter}
                    page={selectedPage}
                    chapterNumber={chapterIndex + 1}
                    pageNumber={!isNaN(pageIndex) ? pageIndex + 1 : undefined}
                    isLoading={isLoading}
                    error={error}
                    onGeneratePageContent={handleGeneratePageContent}
                    onPageContentChange={handlePageContentChange}
                    onSelectPage={(index) => handleSelectPath(`${sectionIndex}-${chapterIndex}-${index}`)}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    <p>Select a chapter to begin.</p>
                  </div>
                )
           ) : (
                <CodexOutline 
                    book={bookData}
                    selectedPath={selectedPath}
                    onSelectPath={handleSelectPath}
                />
           )}
        </div>
      </main>
    </div>
  );
};

export default App;