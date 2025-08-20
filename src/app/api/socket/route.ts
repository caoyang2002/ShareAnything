import { NextRequest } from 'next/server';
import { initializeWebSocketServer } from '@/lib/socket-server';

export async function GET(request: NextRequest) {
  // 初始化 WebSocket 服务器
  initializeWebSocketServer();
  
  return new Response('WebSocket server initialized', { status: 200 });
}