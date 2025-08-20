import React from 'react';
import type { Book } from '../types';

interface CodexOutlineProps {
    book: Book;
    selectedPath: string;
    onSelectPath: (path: string) => void;
}

export const CodexOutline: React.FC<CodexOutlineProps> = ({ book, selectedPath, onSelectPath }) => {
    return (
        <div className="flex flex-col h-full bg-gray-800/30 rounded-lg border border-slate-700 p-6 overflow-hidden">
            <h1 className="text-2xl font-bold text-amber-300 mb-4 pb-4 border-b border-slate-700 font-mono-tech">Codex Outline</h1>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
                {book.map((section, sIdx) => (
                    <div key={sIdx} className="mb-6">
                        <h2 className="text-lg text-violet-400 font-bold mb-2 font-mono-tech">{sIdx + 1}. {section.title}</h2>
                        <div className="space-y-3 pl-4 border-l-2 border-slate-700">
                            {section.chapters.map((chapter, cIdx) => (
                                <div key={cIdx}>
                                    <h3 className="text-md text-amber-300 font-semibold font-mono-tech">{sIdx + 1}.{cIdx + 1}. {chapter.title}</h3>
                                    <ul className="pl-4 mt-1 space-y-1">
                                        {chapter.pages.map((page, pIdx) => {
                                            const pagePath = `${sIdx}-${cIdx}-${pIdx}`;
                                            const isSelected = selectedPath === pagePath;
                                            return (
                                                <li key={pIdx}>
                                                    <button 
                                                        onClick={() => onSelectPath(pagePath)}
                                                        className={`w-full text-left text-sm p-1.5 rounded transition-colors duration-150 flex justify-between items-center ${isSelected ? 'bg-amber-500/10 text-amber-200' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                                                    >
                                                        <span>{sIdx + 1}.{cIdx + 1}.{pIdx + 1} {page.title}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${page.content.length > 0 ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-600 text-slate-300'}`}>
                                                            {page.content.length > 0 ? `${page.content.length} chars` : 'No Data'}
                                                        </span>
                                                    </button>
                                                </li>
                                            )
                                        })}
                                        {chapter.pages.length === 0 && (
                                            <li className="text-sm text-slate-500 italic p-1.5">
                                                This chapter has not been synthesized.
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};