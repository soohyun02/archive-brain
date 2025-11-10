import React, { useState, useRef } from 'react';
import type { Article, Memo } from '../types';
import { ArrowLeftIcon, EditIcon, SparklesIcon, TrashIcon, PaperClipIcon } from './icons';
import MemoList from './MemoList';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onEdit: (article: Article) => void;
  onDelete: (articleId: string) => void;
  onAddMemo: (articleId: string, memo: Omit<Memo, 'id' | 'createdAt'>) => void;
  onDeleteMemo: (articleId: string, memoId: string) => void;
  onUpdateMemo: (articleId: string, memoId: string, newContent: string) => void;
  summarizeText: (text: string) => Promise<string>;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  onBack,
  onEdit,
  onDelete,
  onAddMemo,
  onDeleteMemo,
  onUpdateMemo,
  summarizeText,
}) => {
  const [selection, setSelection] = useState<{ text: string; rect: DOMRect } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = () => {
    const currentSelection = window.getSelection();
    if (currentSelection && currentSelection.toString().trim().length > 10) {
      const selectedText = currentSelection.toString();
      const range = currentSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({ text: selectedText, rect });
    } else {
      setSelection(null);
    }
  };

  const handleSummarize = async () => {
    if (!selection) return;
    setIsSummarizing(true);
    setSelection(null); // Hide button after click

    const summary = await summarizeText(selection.text);
    
    onAddMemo(article.id, {
      content: summary,
      isSummary: true,
    });
    setIsSummarizing(false);
  };
  
  return (
    <div className="animate-fade-in">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <button onClick={onBack} className="flex items-center text-brand-secondary hover:text-brand-dark mb-6 font-semibold">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    목록으로 돌아가기
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-sm bg-brand-light text-brand-dark font-semibold py-1 px-2 rounded-full">{article.category}</span>
                        <h1 className="text-4xl font-bold text-text-main mt-3">{article.title}</h1>
                        <p className="text-text-secondary mt-2">
                          출처: <a href={article.source} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline">{article.source}</a>
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {new Date(article.createdAt).toLocaleString('ko-KR')}
                        </p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                        <button onClick={() => onEdit(article)} className="p-2 text-text-secondary hover:text-brand-primary transition-colors rounded-full hover:bg-gray-100">
                           <EditIcon className="w-6 h-6" />
                        </button>
                         <button onClick={() => onDelete(article.id)} className="p-2 text-text-secondary hover:text-red-500 transition-colors rounded-full hover:bg-red-50">
                           <TrashIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                    {article.keywords.map(kw => (
                        <span key={kw} className="text-xs bg-bg-secondary text-text-secondary px-2 py-1 rounded">
                            #{kw}
                        </span>
                    ))}
                </div>
            </header>

            {article.attachments && article.attachments.length > 0 && (
                <div className="mb-8 p-4 bg-bg-secondary rounded-lg border border-border-color">
                    <h3 className="font-semibold text-text-main mb-3 text-lg">첨부 파일</h3>
                    <div className="space-y-3">
                        {article.attachments.map((attachment, index) => (
                            <div key={index}>
                                {attachment.type.startsWith('image/') ? (
                                    <div>
                                        <p className="text-text-main font-medium truncate mb-2" title={attachment.name}>{attachment.name}</p>
                                        <img src={attachment.dataUrl} alt={attachment.name} className="max-w-full h-auto rounded-md border border-border-color shadow-sm" />
                                    </div>
                                ) : (
                                    <div className="flex items-center bg-white p-3 rounded-md border border-border-color">
                                        <PaperClipIcon className="w-6 h-6 text-text-secondary mr-3 flex-shrink-0" />
                                        <p className="text-text-main font-medium truncate mr-4" title={attachment.name}>{attachment.name}</p>
                                        <a
                                            href={attachment.dataUrl}
                                            download={attachment.name}
                                            className="ml-auto px-4 py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-dark transition text-sm whitespace-nowrap"
                                        >
                                            다운로드
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="prose prose-lg max-w-none bg-white p-6 rounded-lg shadow-sm border border-border-color relative">
                <div ref={bodyRef} onMouseUp={handleMouseUp} className="text-text-main leading-relaxed whitespace-pre-wrap">
                    {article.body}
                </div>
                 {selection && (
                    <button
                        onClick={handleSummarize}
                        className="absolute flex items-center bg-brand-primary text-white px-3 py-1 rounded-full shadow-lg hover:bg-brand-dark transition"
                        style={{
                            left: `${selection.rect.left - (bodyRef.current?.getBoundingClientRect().left || 0) + selection.rect.width / 2}px`,
                            top: `${selection.rect.top - (bodyRef.current?.getBoundingClientRect().top || 0) - 40}px`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                       <SparklesIcon className="w-4 h-4 mr-1"/> AI 요약
                    </button>
                )}
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">메모</h2>
                 {isSummarizing && (
                    <div className="flex items-center justify-center p-4 mb-4 bg-yellow-100 text-yellow-800 rounded-md">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-800 mr-3"></div>
                        AI가 요약 중입니다...
                    </div>
                )}
                <MemoList
                    articleId={article.id}
                    memos={article.memos}
                    onAddMemo={onAddMemo}
                    onDeleteMemo={onDeleteMemo}
                    onUpdateMemo={onUpdateMemo}
                />
            </div>
        </div>
    </div>
  );
};

export default ArticleDetail;