
import React from 'react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onSelectArticle: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelectArticle }) => {
  return (
    <div
      onClick={() => onSelectArticle(article)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-5 flex flex-col h-full animate-fade-in"
    >
      <div className="flex-grow">
        <span className="text-sm bg-brand-light text-brand-dark font-semibold py-1 px-2 rounded-full">{article.category}</span>
        <h3 className="text-lg font-bold mt-3 mb-2 text-text-main">{article.title}</h3>
      </div>
      <div className="mt-4 flex-shrink-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {article.keywords.slice(0, 3).map(kw => (
            <span key={kw} className="text-xs bg-bg-secondary text-text-secondary px-2 py-1 rounded">
              #{kw}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          {new Date(article.createdAt).toLocaleDateString('ko-KR')}
        </p>
      </div>
    </div>
  );
};

export default ArticleCard;
