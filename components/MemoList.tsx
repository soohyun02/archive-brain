import React, { useState } from 'react';
import type { Memo } from '../types';
import MemoItem from './MemoItem';

interface MemoListProps {
  articleId: string;
  memos: Memo[];
  onAddMemo: (articleId: string, memo: Omit<Memo, 'id' | 'createdAt'>) => void;
  onDeleteMemo: (articleId: string, memoId: string) => void;
  onUpdateMemo: (articleId: string, memoId: string, newContent: string) => void;
}

const MemoList: React.FC<MemoListProps> = ({ articleId, memos, onAddMemo, onDeleteMemo, onUpdateMemo }) => {
  const [newMemoContent, setNewMemoContent] = useState('');

  const handleAddMemo = () => {
    if (newMemoContent.trim()) {
      onAddMemo(articleId, { content: newMemoContent, isSummary: false });
      setNewMemoContent('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-border-color">
        <textarea
          value={newMemoContent}
          onChange={(e) => setNewMemoContent(e.target.value)}
          placeholder="새 메모를 추가하세요..."
          className="w-full p-2 border border-border-color rounded-md focus:ring-brand-secondary focus:border-brand-secondary"
          rows={3}
        />
        <div className="text-right mt-2">
          <button
            onClick={handleAddMemo}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold rounded-md transition"
          >
            메모 추가
          </button>
        </div>
      </div>

      {memos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((memo) => (
        <MemoItem
          key={memo.id}
          memo={memo}
          onDelete={() => onDeleteMemo(articleId, memo.id)}
          onUpdate={(newContent) => onUpdateMemo(articleId, memo.id, newContent)}
        />
      ))}
    </div>
  );
};

// FIX: Corrected the default export from MemoItem to MemoList.
export default MemoList;
