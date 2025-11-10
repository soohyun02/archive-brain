
import React from 'react';
import type { Article } from '../types';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, onSelectArticle }) => {
  if (articles.length === 0) {
    return <div className="text-center py-10 text-text-secondary">아티클이 없습니다. 새 아티클을 추가해보세요.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} onSelectArticle={onSelectArticle} />
      ))}
    </div>
  );
};

export default ArticleList;
