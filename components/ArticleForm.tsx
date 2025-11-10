import React, { useState, useEffect, useRef } from 'react';
import type { Article } from '../types';
import { ArrowTopRightOnSquareIcon, SparklesIcon } from './icons';
import { processFileContent, summarizeText } from '../services/geminiService';

interface ArticleFormProps {
  onSave: (article: Omit<Article, 'createdAt' | 'memos' | 'id'> & { id?: string }) => void;
  onCancel: () => void;
  existingArticle?: Article | null;
  allCategories: string[];
}

const ArticleForm: React.FC<ArticleFormProps> = ({ onSave, onCancel, existingArticle, allCategories }) => {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [format, setFormat] = useState<'뉴스' | '블로그' | '책' | '논문' | '유튜브' | 'pdf' | '기타'>('뉴스');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<NonNullable<Article['attachments']>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [isSummarizingBody, setIsSummarizingBody] = useState(false);
  
  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setSource(existingArticle.source);
      setFormat(existingArticle.format);
      setCategory(existingArticle.category);
      setKeywords(existingArticle.keywords.join(', '));
      setBody(existingArticle.body);
      setAttachments(existingArticle.attachments || []);
    }
  }, [existingArticle]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`'${file.name}' 파일의 크기가 5MB를 초과하여 첨부할 수 없습니다.`);
        continue;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise<void>(resolve => {
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          
          setAttachments(prev => [...prev, { name: file.name, type: file.type, dataUrl }]);

          if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            const isImage = file.type.startsWith('image/');
            setProcessingMessage(isImage ? `'${file.name}'에서 텍스트 추출 중...` : `'${file.name}' 문서 요약 중...`);
            setIsProcessing(true);
            try {
              const content = await processFileContent({ dataUrl, mimeType: file.type });
              if (content) {
                setBody(prev => (prev ? prev + '\n\n' : '') + content.trim());
              }
            } catch (error) {
              console.error("File processing error:", error);
              alert("파일 처리 중 오류가 발생했습니다.");
            } finally {
              setIsProcessing(false);
              setProcessingMessage('');
            }
          }
          resolve();
        };
      });
    }

    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSummarizeBody = async () => {
    if (!body.trim()) return;
    setIsSummarizingBody(true);
    try {
        const summary = await summarizeText(body);
        setBody(prev => `${prev}\n\n-- AI 요약 내용 --\n${summary}`);
    } catch (error) {
        console.error("Body summarization error:", error);
        alert("본문 요약 중 오류가 발생했습니다.");
    } finally {
        setIsSummarizingBody(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim()) {
      alert('제목과 카테고리는 필수입니다.');
      return;
    }
    const keywordsArray = keywords.split(',').map(kw => kw.trim()).filter(Boolean);
    onSave({ id: existingArticle?.id, title, source, format, category, keywords: keywordsArray, body, attachments });
  };

  const isYouTubeUrl = source.includes('youtube.com/') || source.includes('youtu.be/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 animate-fade-in">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{existingArticle ? '아티클 수정' : '새 아티클 추가'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary">제목</label>
            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full border border-border-color rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-text-secondary">출처</label>
                <input id="source" type="text" value={source} onChange={e => setSource(e.target.value)} className="mt-1 block w-full border border-border-color rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
              </div>
              <div>
                <label htmlFor="format" className="block text-sm font-medium text-text-secondary">자료 형식</label>
                <select id="format" value={format} onChange={e => setFormat(e.target.value as any)} className="mt-1 block w-full border border-border-color rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary">
                  <option>뉴스</option>
                  <option>블로그</option>
                  <option>책</option>
                  <option>논문</option>
                  <option>유튜브</option>
                  <option>pdf</option>
                  <option>기타</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="attachment" className="block text-sm font-medium text-text-secondary">파일 첨부 (이미지: 텍스트 추출, PDF: 요약)</label>
              <div className="mt-1">
                <input
                  id="attachment-input"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                  multiple
                  accept="image/png, image/jpeg, application/pdf"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-white border border-border-color rounded-md text-sm font-medium text-text-secondary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                파일 추가
                </button>
                {isProcessing && <p className="text-sm text-brand-primary mt-2 animate-pulse">{processingMessage}</p>}
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-bg-secondary rounded-md border border-border-color">
                        <span className="text-sm text-text-main truncate" title={attachment.name}>{attachment.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg"
                          aria-label={`${attachment.name} 첨부 파일 삭제`}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary">카테고리</label>
                <input id="category" type="text" value={category} onChange={e => setCategory(e.target.value)} required list="category-suggestions" className="mt-1 block w-full border border-border-color rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
                 <datalist id="category-suggestions">
                    {allCategories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
            </div>

            <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-text-secondary">키워드 (쉼표로 구분)</label>
                <input id="keywords" type="text" value={keywords} onChange={e => setKeywords(e.target.value)} className="mt-1 block w-full border border-border-color rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="body" className="block text-sm font-medium text-text-secondary">본문</label>
                    <div className="flex items-center space-x-2">
                        {format === '유튜브' && isYouTubeUrl && (
                            <a
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm"
                            >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-1" />
                                YouTube에서 열기
                            </a>
                        )}
                         {body.trim().length > 100 && (
                            <button
                                type="button"
                                onClick={handleSummarizeBody}
                                disabled={isSummarizingBody}
                                className="flex items-center px-3 py-1 bg-brand-primary text-white rounded-md hover:bg-brand-dark transition text-sm disabled:opacity-50"
                            >
                                {isSummarizingBody ? (
                                    <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                     요약 중...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-4 h-4 mr-1" />
                                        AI 요약 보기
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
                <textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={10} className="w-full border border-border-color rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"/>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-bg-secondary hover:bg-border-color text-text-main font-semibold rounded-md transition">취소</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold rounded-md transition" disabled={isProcessing}>저장</button>
            </div>
        </form>
        </div>
    </div>
  );
};

export default ArticleForm;