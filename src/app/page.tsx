'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Code, Users, Zap, Share } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createNewSession = async () => {
    setIsCreating(true);
    const sessionId = uuidv4();
    
    // 初始化 WebSocket 服务器
    await fetch('/api/socket');
    
    setTimeout(() => {
      router.push(`/editor/${sessionId}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            共享代码编辑器
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            创建共享代码会话，与团队成员实时协作编程。支持多种编程语言，实时同步，文件共享，无需注册。
          </p>
          
          <button
            onClick={createNewSession}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg"
          >
            {isCreating ? '创建中...' : '创建新的共享会话'}
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">实时编辑</h3>
            <p className="text-gray-600">
              多人同时编辑代码，所有更改实时同步，支持语法高亮和自动补全。
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">团队协作</h3>
            <p className="text-gray-600">
              查看其他用户的光标位置，了解团队成员的编辑状态，提高协作效率。
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Share className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">简单分享</h3>
            <p className="text-gray-600">
              通过唯一链接分享代码会话，无需注册登录，即开即用。
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">文件共享</h3>
            <p className="text-gray-600">
              上传和分享各种文件，支持文本预览和实时同步，最大支持10MB文件。
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            支持的编程语言
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'HTML', 'CSS'].map((lang) => (
              <span
                key={lang}
                className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}