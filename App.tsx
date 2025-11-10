
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Article, Memo } from './types';
import Sidebar from './components/Sidebar';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import ArticleForm from './components/ArticleForm';
import { PlusIcon } from './components/icons';
import { summarizeText } from './services/geminiService';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [filter, setFilter] = useState<{ type: 'category' | 'keyword' | null; value: string | null }>({ type: null, value: null });

  useEffect(() => {
    try {
      const storedArticles = localStorage.getItem('archive-brain-articles');
      if (storedArticles) {
        setArticles(JSON.parse(storedArticles));
      } else {
        // Add some initial data if local storage is empty
        const initialArticles: Article[] = [
          {
            id: '1',
            title: 'React Hooks에 대한 심층 분석',
            body: 'React Hooks는 함수형 컴포넌트에서 상태 관리와 생명주기 기능을 사용할 수 있게 해주는 기능입니다. useState, useEffect, useContext 등 다양한 훅이 제공되어 코드의 재사용성과 가독성을 높여줍니다. 특히 useEffect는 컴포넌트가 렌더링될 때마다 특정 작업을 수행하도록 설정할 수 있어, API 호출이나 구독(subscription) 설정 및 해제와 같은 부수 효과(side effect)를 처리하는 데 유용합니다. 하지만 의존성 배열을 잘못 관리하면 무한 루프나 예상치 못한 동작을 유발할 수 있으므로 주의가 필요합니다.',
            source: 'https://reactjs.org/docs/hooks-intro.html',
            createdAt: new Date().toISOString(),
            format: '블로그',
            category: '기술',
            keywords: ['React', 'Frontend', 'JavaScript'],
            memos: [],
          }
        ];
        setArticles(initialArticles);
      }
    } catch (error) {
      console.error("Failed to load articles from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('archive-brain-articles', JSON.stringify(articles));
    } catch (error) {
      console.error("Failed to save articles to localStorage", error);
    }
  }, [articles]);

  const handleSelectArticle = useCallback((article: Article) => {
    setActiveArticle(article);
    setView('detail');
  }, []);

  const handleBackToList = useCallback(() => {
    setActiveArticle(null);
    setEditingArticle(null);
    setView('list');
  }, []);

  const handleSaveArticle = useCallback((articleToSave: Omit<Article, 'id' | 'createdAt' | 'memos'> & { id?: string }) => {
    if (articleToSave.id) { // Editing existing article
      setArticles(prev => prev.map(a => a.id === articleToSave.id ? { ...a, ...articleToSave, keywords: articleToSave.keywords } as Article : a));
    } else { // Creating new article
      const newArticle: Article = {
        ...articleToSave,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        memos: [],
      };
      setArticles(prev => [newArticle, ...prev]);
    }
    handleBackToList();
  }, [handleBackToList]);

  const handleDeleteArticle = useCallback((articleId: string) => {
    if (window.confirm('정말 이 아티클을 삭제하시겠습니까?')) {
        setArticles(prev => prev.filter(a => a.id !== articleId));
        handleBackToList();
    }
  }, [handleBackToList]);

  const handleAddMemo = useCallback((articleId: string, memo: Omit<Memo, 'id' | 'createdAt'>) => {
    const newMemo: Memo = { ...memo, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setArticles(prev => prev.map(a => a.id === articleId ? { ...a, memos: [...a.memos, newMemo] } : a));
    setActiveArticle(prev => prev && prev.id === articleId ? { ...prev, memos: [...prev.memos, newMemo] } : prev);
  }, []);

  const handleDeleteMemo = useCallback((articleId: string, memoId: string) => {
    setArticles(prev => prev.map(a => a.id === articleId ? { ...a, memos: a.memos.filter(m => m.id !== memoId) } : a));
    setActiveArticle(prev => prev && prev.id === articleId ? { ...prev, memos: prev.memos.filter(m => m.id !== memoId) } : prev);
  }, []);

  const handleUpdateMemo = useCallback((articleId: string, memoId: string, newContent: string) => {
      setArticles(prev => prev.map(a => a.id === articleId ? { ...a, memos: a.memos.map(m => m.id === memoId ? {...m, content: newContent} : m) } : a));
      setActiveArticle(prev => prev && prev.id === articleId ? { ...prev, memos: prev.memos.map(m => m.id === memoId ? {...m, content: newContent} : m) } : prev);
  }, []);

  const handleShowForm = useCallback((article?: Article) => {
    setEditingArticle(article || null);
    setView('form');
  }, []);
  
  const filteredArticles = useMemo(() => {
    if (!filter.type || !filter.value) {
      return articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return articles.filter(article => {
      if (filter.type === 'category') {
        return article.category === filter.value;
      }
      if (filter.type === 'keyword') {
        return article.keywords.includes(filter.value!);
      }
      return false;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [articles, filter]);
  
  const categories = useMemo(() => {
    const categoryMap = new Map<string, Set<string>>();
    articles.forEach(article => {
        if (!categoryMap.has(article.category)) {
            categoryMap.set(article.category, new Set());
        }
        article.keywords.forEach(kw => categoryMap.get(article.category)!.add(kw));
    });
    return Array.from(categoryMap.entries()).map(([category, keywords]) => ({
        name: category,
        keywords: Array.from(keywords)
    }));
  }, [articles]);

  const renderContent = () => {
    switch (view) {
      case 'detail':
        return activeArticle && <ArticleDetail 
          article={activeArticle} 
          onBack={handleBackToList}
          onEdit={() => handleShowForm(activeArticle)}
          onDelete={handleDeleteArticle}
          onAddMemo={handleAddMemo}
          onDeleteMemo={handleDeleteMemo}
          onUpdateMemo={handleUpdateMemo}
          summarizeText={summarizeText}
        />;
      case 'form':
        return <ArticleForm 
          onSave={handleSaveArticle} 
          onCancel={handleBackToList} 
          existingArticle={editingArticle}
          allCategories={[...new Set(articles.map(a => a.category))]}
        />;
      case 'list':
      default:
        return (
          <div className="flex h-screen bg-bg-main">
            <Sidebar categories={categories} onFilterChange={setFilter} activeFilter={filter} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              <h1 className="text-3xl font-bold text-text-main mb-6">아카이브 브레인</h1>
              <ArticleList articles={filteredArticles} onSelectArticle={handleSelectArticle} />
            </main>
             <button
                onClick={() => handleShowForm()}
                className="fixed bottom-8 right-8 bg-brand-primary hover:bg-brand-dark text-white rounded-full p-4 shadow-lg transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 z-20"
                aria-label="새 아티클 추가"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
          </div>
        );
    }
  };

  return <div className="min-h-screen font-sans">{renderContent()}</div>;
};

export default App;
