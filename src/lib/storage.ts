import { CodeSession, User, SharedFile } from '@/types';

class MemoryStorage {
  private sessions = new Map<string, CodeSession>();

  createSession(id: string, language: string = 'javascript'): CodeSession {
    const session: CodeSession = {
      id,
      content: `// 欢迎使用共享代码编辑器！
// 分享这个链接让其他人加入协作
// 你也可以上传和分享文件

console.log('Hello, World!');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
      language,
      users: new Map(),
      files: new Map(),
      lastModified: new Date(),
    };

    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): CodeSession | null {
    return this.sessions.get(id) || null;
  }

  updateContent(sessionId: string, content: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.content = content;
      session.lastModified = new Date();
      return true;
    }
    return false;
  }

  addUser(sessionId: string, user: User): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.users.set(user.id, user);
      return true;
    }
    return false;
  }

  removeUser(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.users.delete(userId);
      return true;
    }
    return false;
  }

  updateUserCursor(sessionId: string, userId: string, cursor: { line: number; column: number }): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      const user = session.users.get(userId);
      if (user) {
        user.cursor = cursor;
        return true;
      }
    }
    return false;
  }

  // 文件管理方法
  addFile(sessionId: string, file: SharedFile): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.files.set(file.id, file);
      session.lastModified = new Date();
      return true;
    }
    return false;
  }

  removeFile(sessionId: string, fileId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      const deleted = session.files.delete(fileId);
      if (deleted) {
        session.lastModified = new Date();
      }
      return deleted;
    }
    return false;
  }

  getFile(sessionId: string, fileId: string): SharedFile | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      return session.files.get(fileId) || null;
    }
    return null;
  }

  getFiles(sessionId: string): SharedFile[] {
    const session = this.sessions.get(sessionId);
    if (session) {
      return Array.from(session.files.values());
    }
    return [];
  }

  // 清理长时间未使用的会话（可选）
  cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [id, session] of this.sessions) {
      if (session.lastModified < oneHourAgo && session.users.size === 0) {
        this.sessions.delete(id);
      }
    }
  }
}

export const storage = new MemoryStorage();