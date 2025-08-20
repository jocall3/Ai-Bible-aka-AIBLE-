import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { CodexOutline } from './components/CodexOutline';
import { LoadingOverlay } from './components/LoadingOverlay';
import { INITIAL_BOOK_DATA } from './constants';
import { generateSectionPageTitles, generateChapterContent } from './services/geminiService';
import { downloadBookAsHtml } from './utils/downloadHelper';
import type { Book, Section, Chapter, Page } from './types';

const LOCAL_STORAGE_KEY = 'aletheia-engine-codex-v1';

const App: React.FC = () => {
  const [bookData, setBookData] = useState<Book>(() => {
    try {
      const savedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Basic check for new data structure
        if (Array.isArray(parsedData) && parsedData[0]?.title === 'The Primal Query') {
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
  const [error, setError] = useState<string | null>(null);
  const [isScaffolding, setIsScaffolding] = useState<boolean>(false);
  const [scaffoldingMessage, setScaffoldingMessage] = useState<string>('');
  const [chapterGenStatus, setChapterGenStatus] = useState({ active: false, message: '' });


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
        setScaffoldingMessage('Querying the Primal Axiom...');
        let newBook = JSON.parse(JSON.stringify(INITIAL_BOOK_DATA));

        for (const [sIdx, section] of newBook.entries()) {
          try {
            setScaffoldingMessage(`Synthesizing Section: ${section.title}`);
            const chapterTitles = section.chapters.map(c => c.title);
            if (chapterTitles.length === 0) continue;

            const sectionPagesData = await generateSectionPageTitles(section.title, chapterTitles);
            
            const pageDataMap = new Map(sectionPagesData.map(item => [item.chapterTitle, item.titles]));

            newBook[sIdx].chapters.forEach((chapter: Chapter) => {
              const pageTitles = pageDataMap.get(chapter.title);
              if (pageTitles) {
                chapter.pages = pageTitles.map(title => ({ title, content: '' }));
              }
            });

            setBookData(JSON.parse(JSON.stringify(newBook))); // Update state after each section
            await new Promise(res => setTimeout(res, 1000)); // Safer rate limiting between sections
          } catch (err) {
            console.error(`Failed to scaffold section ${section.title}:`, err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Failed to synthesize section "${section.title}". A system reset (page refresh) may be required. Error: ${errorMessage}`);
            // Stop scaffolding if one section fails.
            setIsScaffolding(false);
            return;
          }
        }
        setScaffoldingMessage('Initial Synthesis Complete.');
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

  const handlePageContentChange = useCallback((newContent: string) => {
    if (isNaN(pageIndex)) return;
    setBookData(prevBook => {
      const newBook = JSON.parse(JSON.stringify(prevBook));
      newBook[sectionIndex].chapters[chapterIndex].pages[pageIndex].content = newContent;
      return newBook;
    });
  }, [sectionIndex, chapterIndex, pageIndex]);

  const handleAutoGenerateChapter = useCallback(async () => {
    if (!selectedChapter || !selectedSection) return;

    setChapterGenStatus({ active: true, message: 'Contacting the Engine core for chapter synthesis...' });
    setError(null);

    try {
      const pageTitles = selectedChapter.pages.map(p => p.title);
      const generatedLogs = await generateChapterContent(
        selectedSection.title,
        selectedChapter.title,
        pageTitles
      );

      const contentMap = new Map(generatedLogs.map(log => [log.title, log.content]));

      setBookData(prevBook => {
        const newBook = JSON.parse(JSON.stringify(prevBook));
        const chapterToUpdate = newBook[sectionIndex].chapters[chapterIndex];
        
        chapterToUpdate.pages.forEach((page: Page) => {
          if (contentMap.has(page.title)) {
            page.content = contentMap.get(page.title) || '';
          }
        });

        return newBook;
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during chapter synthesis.';
      setError(`Chapter synthesis failed: ${errorMessage}`);
    } finally {
      setChapterGenStatus({ active: false, message: 'Chapter synthesis received.' });
      setTimeout(() => setChapterGenStatus({ active: false, message: '' }), 2500);
    }
  }, [sectionIndex, chapterIndex, selectedChapter, selectedSection]);


  if (isScaffolding) {
    return <LoadingOverlay message={scaffoldingMessage} />;
  }

  return (
    <div className="bg-gray-900 text-slate-300 min-h-screen flex selection:bg-amber-500 selection:text-gray-900">
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
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeView === 'editor' ? 'border-b-2 border-amber-500 text-amber-300' : 'text-slate-400 hover:text-white'}`}
                >
                    Codex Editor
                </button>
                <button
                    onClick={() => setActiveView('outline')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeView === 'outline' ? 'border-b-2 border-amber-500 text-amber-300' : 'text-slate-400 hover:text-white'}`}
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
                    sectionNumber={sectionIndex + 1}
                    chapterNumber={chapterIndex + 1}
                    pageNumber={!isNaN(pageIndex) ? pageIndex + 1 : undefined}
                    error={error}
                    onPageContentChange={handlePageContentChange}
                    onSelectPage={(index) => handleSelectPath(`${sectionIndex}-${chapterIndex}-${index}`)}
                    onAutoGenerateChapter={handleAutoGenerateChapter}
                    chapterGenerationStatus={chapterGenStatus}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    <p>Select a fragment to begin analysis.</p>
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
