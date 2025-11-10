
import React, { useState } from 'react';
import type { Memo } from '../types';
import { EditIcon, SparklesIcon, TrashIcon } from './icons';

interface MemoItemProps {
  memo: Memo;
  onDelete: () => void;
  onUpdate: (newContent: string) => void;
}

const MemoItem: React.FC<MemoItemProps> = ({ memo, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(memo.content);

  const handleUpdate = () => {
    if (editedContent.trim()) {
      onUpdate(editedContent);
      setIsEditing(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm border ${memo.isSummary ? 'bg-blue-50 border-blue-200' : 'bg-white border-border-color'}`}>
      <div className="flex justify-between items-start">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border border-border-color rounded-md focus:ring-brand-secondary focus:border-brand-secondary"
            rows={4}
          />
        ) : (
          <p className="text-text-main flex-1 whitespace-pre-wrap">{memo.content}</p>
        )}
        <div className="flex items-center space-x-2 ml-4">
          {memo.isSummary && <SparklesIcon className="w-5 h-5 text-blue-500" title="AI 요약" />}
          <button onClick={() => setIsEditing(!isEditing)} className="text-text-secondary hover:text-brand-primary transition-colors">
            <EditIcon className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="text-text-secondary hover:text-red-500 transition-colors">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {isEditing && (
        <div className="text-right mt-2 space-x-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm">취소</button>
            <button onClick={handleUpdate} className="px-3 py-1 bg-brand-primary hover:bg-brand-dark text-white rounded-md text-sm">저장</button>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2 text-right">
        {new Date(memo.createdAt).toLocaleString('ko-KR')}
      </p>
    </div>
  );
};

export default MemoItem;
