
export interface Memo {
  id: string;
  content: string;
  isSummary: boolean;
  createdAt: string;
}

export interface Article {
  id:string;
  title: string;
  body: string;
  source: string;
  createdAt: string;
  format: '뉴스' | '블로그' | '책' | '논문' | '유튜브' | 'pdf' | '기타';
  category: string;
  keywords: string[];
  memos: Memo[];
  attachments?: {
    name: string;
    type: string;
    dataUrl: string;
  }[];
}