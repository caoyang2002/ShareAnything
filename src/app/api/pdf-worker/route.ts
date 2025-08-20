// app/api/pdf-worker/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // 从 node_modules 读取 PDF worker 文件
    const workerPath = join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.min.js');
    const workerContent = readFileSync(workerPath, 'utf8');
    
    return new NextResponse(workerContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=86400', // 缓存 24 小时
      },
    });
  } catch (error) {
    console.error('PDF Worker loading error:', error);
    return new NextResponse('PDF Worker not found', { status: 404 });
  }
}