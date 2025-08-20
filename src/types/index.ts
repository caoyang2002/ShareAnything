export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
}

export interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // Base64 encoded for binary files, plain text for text files
  uploadedBy: string;
  uploadedAt: Date;
  isTextFile: boolean;
}

export interface CodeSession {
  id: string;
  content: string;
  language: string;
  users: Map<string, User>;
  files: Map<string, SharedFile>;
  lastModified: Date;
}

export interface SocketMessage {
  type: 'join' | 'leave' | 'content-change' | 'cursor-change' | 'user-update' | 'file-upload' | 'file-delete' | 'file-list-update';
  sessionId: string;
  userId?: string;
  user?: User;
  content?: string;
  cursor?: {
    line: number;
    column: number;
  };
  file?: SharedFile;
  fileId?: string;
  files?: SharedFile[];
}