'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import CodeEditor from '@/components/CodeEditor';
import UserList from '@/components/UserList';
import ShareButton from '@/components/ShareButton';
import FileManager from '@/components/FileManager';
import { User, SocketMessage, SharedFile } from '@/types';
import { projectHmrEvents } from 'next/dist/build/swc/generated-native';

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
];

export default function EditorPage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  const [content, setContent] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [language, setLanguage] = useState('javascript');

  // 初始化用户
  useEffect(() => {
    const userId = uuidv4();
    const userName = `用户${Math.floor(Math.random() * 1000)}`;
    const userColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    
    const user: User = {
      id: userId,
      name: userName,
      color: userColor,
    };
    
    setCurrentUser(user);
  }, []);

  // 连接 WebSocket
  useEffect(() => {
    if (!currentUser) return;

    const connectWebSocket = () => {
      const ip = process.env.NEXT_PUBLIC_HOST_IP
      const port = process.env.WS_PORT || process.env.NEXT_PUBLIC_WS_PORT
      console.log(ip)
      const websocket = new WebSocket(`ws://${ip}:${port}`); // 修改这个 ip
      
      
      websocket.onopen = () => {
        setIsConnected(true);
        setWs(websocket);
        
        // 加入会话
        const joinMessage: SocketMessage = {
          type: 'join',
          sessionId,
          user: currentUser,
        };
        websocket.send(JSON.stringify(joinMessage));
      };

      websocket.onmessage = (event) => {
        try {
          const message: SocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      websocket.onclose = () => {
        setIsConnected(false);
        setWs(null);
   
        const web_port:number = Number(process.env.WEB_PORT) || Number(process.env.NEXT_PUBLIC_WEB_PORT) 
        // 尝试重连
        setTimeout(connectWebSocket,web_port);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        const leaveMessage: SocketMessage = {
          type: 'leave',
          sessionId,
          userId: currentUser.id,
        };
        ws.send(JSON.stringify(leaveMessage));
        ws.close();
      }
    };
  }, [currentUser, sessionId]);

  const handleWebSocketMessage = (message: SocketMessage) => {
    switch (message.type) {
      case 'content-change':
        if (message.content !== undefined) {
          setContent(message.content);
        }
        break;
      case 'user-update':
        if (message.user) {
          setUsers(prev => {
            const filtered = prev.filter(u => u.id !== message.user!.id);
            return [...filtered, message.user!];
          });
        }
        break;
      case 'leave':
        if (message.userId) {
          setUsers(prev => prev.filter(u => u.id !== message.userId));
        }
        break;
      case 'cursor-change':
        if (message.userId && message.cursor) {
          setUsers(prev => prev.map(user => 
            user.id === message.userId 
              ? { ...user, cursor: message.cursor }
              : user
          ));
        }
        break;
      case 'file-list-update':
        if (message.files) {
          setFiles(message.files);
        }
        break;
    }
  };

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    
    if (ws && isConnected) {
      const message: SocketMessage = {
        type: 'content-change',
        sessionId,
        content: newContent,
      };
      ws.send(JSON.stringify(message));
    }
  }, [ws, isConnected, sessionId]);

  const handleCursorChange = useCallback((line: number, column: number) => {
    if (ws && isConnected && currentUser) {
      const message: SocketMessage = {
        type: 'cursor-change',
        sessionId,
        userId: currentUser.id,
        cursor: { line, column },
      };
      ws.send(JSON.stringify(message));
    }
  }, [ws, isConnected, currentUser, sessionId]);

  const handleFileUpload = useCallback((file: SharedFile) => {
    if (ws && isConnected) {
      const message: SocketMessage = {
        type: 'file-upload',
        sessionId,
        file,
      };
      ws.send(JSON.stringify(message));
    }
  }, [ws, isConnected, sessionId]);

  const handleFileDelete = useCallback((fileId: string) => {
    if (ws && isConnected) {
      const message: SocketMessage = {
        type: 'file-delete',
        sessionId,
        fileId,
      };
      ws.send(JSON.stringify(message));
    }
  }, [ws, isConnected, sessionId]);

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">初始化中...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        {/* 头部 */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">同步共享编辑器</h1>
            <p className="text-sm text-gray-600">
              会话 ID: {sessionId}
              {isConnected ? (
                <span className="ml-2 text-green-600">● 已连接</span>
              ) : (
                <span className="ml-2 text-red-600">● 连接中...</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* 编辑器 */}
          <div className="col-span-8">
            <CodeEditor
              value={content}
              onChange={handleContentChange}
              onCursorChange={handleCursorChange}
              language={language}
              users={users.filter(u => u.id !== currentUser.id)}
              readOnly={!isConnected}
            />
          </div>

          {/* 侧边栏 */}
          <div className="col-span-4 space-y-4 overflow-y-auto">
            <ShareButton sessionId={sessionId} />
            <UserList 
              users={[currentUser, ...users]} 
              currentUserId={currentUser.id} 
            />
            <FileManager
              files={files}
              onFileUpload={handleFileUpload}
              onFileDelete={handleFileDelete}
              currentUserId={currentUser.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}