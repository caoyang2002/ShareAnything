import { WebSocketServer } from 'ws';
import { storage } from './storage';
import { SocketMessage } from '@/types';
import { exit } from 'process';

let wss: WebSocketServer | null = null;

export function initializeWebSocketServer() {
  if (wss) return wss;
  // 检查环境变量
  if (process.env.NODE_ENV == 'production') {
     console.log("[Socket Server] 生产模式")
    if (process.env.NEXT_PUBLIC_WS_PORT === undefined) {
      console.log("[Socket Server] 配置错误")
      return;
    }
  }
  
  const port = process.env.NEXT_PUBLIC_WS_PORT
  console.log("WS PORT:", port)
  const ws_port: number = Number(port);

  wss = new WebSocketServer({ port: ws_port });
  

  wss.on('connection', (ws) => {
    let currentSessionId: string | null = null;
    let currentUserId: string | null = null;

    ws.on('message', (data) => {
      try {
        const message: SocketMessage = JSON.parse(data.toString());

        switch (message.type) {
          case 'join':
            handleJoin(ws, message);
            break;
          case 'leave':
            handleLeave(message);
            break;
          case 'content-change':
            handleContentChange(message);
            break;
          case 'cursor-change':
            handleCursorChange(message);
            break;
          case 'file-upload':
            handleFileUpload(message);
            break;
          case 'file-delete':
            handleFileDelete(message);
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      if (currentSessionId && currentUserId) {
        storage.removeUser(currentSessionId, currentUserId);
        broadcastToSession(currentSessionId, {
          type: 'leave',
          sessionId: currentSessionId,
          userId: currentUserId,
        });
      }
    });

    function handleJoin(ws: any, message: SocketMessage) {
      if (!message.sessionId || !message.user) return;

      currentSessionId = message.sessionId;
      currentUserId = message.user.id;

      let session = storage.getSession(message.sessionId);
      if (!session) {
        session = storage.createSession(message.sessionId);
      }

      storage.addUser(message.sessionId, message.user);

      // 发送当前内容给新用户
      ws.send(JSON.stringify({
        type: 'content-change',
        sessionId: message.sessionId,
        content: session.content,
      }));

      // 发送当前文件列表给新用户
      const files = storage.getFiles(message.sessionId);
      ws.send(JSON.stringify({
        type: 'file-list-update',
        sessionId: message.sessionId,
        files: files,
      }));

      // 广播新用户加入
      broadcastToSession(message.sessionId, {
        type: 'user-update',
        sessionId: message.sessionId,
        user: message.user,
      }, ws);
    }

    function handleLeave(message: SocketMessage) {
      if (!message.sessionId || !message.userId) return;

      storage.removeUser(message.sessionId, message.userId);
      broadcastToSession(message.sessionId, message);
    }

    function handleContentChange(message: SocketMessage) {
      if (!message.sessionId || message.content === undefined) return;

      storage.updateContent(message.sessionId, message.content);
      broadcastToSession(message.sessionId, message, ws);
    }

    function handleCursorChange(message: SocketMessage) {
      if (!message.sessionId || !message.userId || !message.cursor) return;

      storage.updateUserCursor(message.sessionId, message.userId, message.cursor);
      broadcastToSession(message.sessionId, message, ws);
    }

    function handleFileUpload(message: SocketMessage) {
      if (!message.sessionId || !message.file) return;

      storage.addFile(message.sessionId, message.file);

      // 广播文件上传给所有用户
      const files = storage.getFiles(message.sessionId);
      broadcastToSession(message.sessionId, {
        type: 'file-list-update',
        sessionId: message.sessionId,
        files: files,
      });
    }

    function handleFileDelete(message: SocketMessage) {
      if (!message.sessionId || !message.fileId) return;

      storage.removeFile(message.sessionId, message.fileId);

      // 广播文件删除给所有用户
      const files = storage.getFiles(message.sessionId);
      broadcastToSession(message.sessionId, {
        type: 'file-list-update',
        sessionId: message.sessionId,
        files: files,
      });
    }
  });

  // 定期清理
  setInterval(() => {
    storage.cleanup();
  }, 60000); // 每分钟清理一次

  return wss;
}

function broadcastToSession(sessionId: string, message: SocketMessage, excludeWs?: any) {
  if (!wss) return;

  const messageStr = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === client.OPEN) {
      // 这里需要根据实际情况判断客户端是否属于该会话
      client.send(messageStr);
    }
  });
}