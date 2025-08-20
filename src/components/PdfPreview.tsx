// components/PdfPreview.tsx - 使用 CDN Worker 完全修复
'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Search, Download, RotateCw, Maximize, 
  FileText, AlertCircle, Loader2 
} from 'lucide-react';

// 动态导入 react-pdf 组件，禁用 SSR
const Document = dynamic(
  () => import('react-pdf').then(mod => ({ default: mod.Document })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-gray-600 ml-2">正在加载 PDF 组件...</p>
      </div>
    )
  }
);

const Page = dynamic(
  () => import('react-pdf').then(mod => ({ default: mod.Page })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    )
  }
);

// pdfjs 不需要动态导入，因为它不是 React 组件
// pdfjs 会在 useEffect 内部动态导入

interface PdfPreviewProps {
  file: {
    name: string;
    content: string;
    size: number;
  };
  onDownload: () => void;
}

export default function PdfPreview({ file, onDownload }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageInputValue, setPageInputValue] = useState<string>('1');
  const [pdfLoaded, setPdfLoaded] = useState<boolean>(false);

  // 📄 PDF 数据 URL
  const pdfDataUrl = `data:application/pdf;base64,${file.content}`;

  // 🔧 配置 PDF.js worker - CDN 方案（最稳定）
  useEffect(() => {
    const configurePdfWorker = async () => {
      try {
        if (typeof window === 'undefined') return;

        // 动态导入 pdfjs
        const { pdfjs } = await import('react-pdf');
        
        // 方案1: 使用 unpkg CDN（推荐）
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        
        console.log(`PDF.js worker configured: pdfjs-dist@${pdfjs.version}`);
        setPdfLoaded(true);
      } catch (error) {
        console.error('PDF.js 配置失败:', error);
        
        // 备用方案：使用固定版本的 CDN
        try {
          const { pdfjs } = await import('react-pdf');
          pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.mjs';
          console.log('PDF.js fallback worker configured');
          setPdfLoaded(true);
        } catch (fallbackError) {
          console.error('PDF.js fallback 配置失败:', fallbackError);
          setError('PDF 组件初始化失败');
        }
      }
    };

    configurePdfWorker();
  }, []);

  // 📊 文档加载成功
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    console.log(`PDF loaded successfully with ${numPages} pages`);
  }, []);

  // ❌ 文档加载失败
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF loading error:', error);
    setError('PDF 文件加载失败，可能文件已损坏或格式不支持');
    setLoading(false);
  }, []);

  // 📖 页面渲染成功
  const onPageLoadSuccess = useCallback(() => {
    setLoading(false);
  }, []);

  // 📖 页面渲染失败
  const onPageLoadError = useCallback((error: Error) => {
    console.error('PDF page loading error:', error);
  }, []);

  // 🔍 缩放控制
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.25));
  const handleZoomFit = () => setScale(1.0);

  // 📄 页面导航
  const goToPrevPage = () => {
    const newPage = Math.max(pageNumber - 1, 1);
    setPageNumber(newPage);
    setPageInputValue(String(newPage));
  };

  const goToNextPage = () => {
    const newPage = Math.min(pageNumber + 1, numPages);
    setPageNumber(newPage);
    setPageInputValue(String(newPage));
  };

  const handlePageInputChange = (value: string) => {
    setPageInputValue(value);
    const pageNum = parseInt(value);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
    }
  };

  const handlePageInputBlur = () => {
    setPageInputValue(String(pageNumber));
  };

  // 🔄 旋转控制
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // 🖥️ 全屏控制
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // ⌨️ 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextPage();
          break;
        case '+':
        case '=':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
          event.preventDefault();
          handleZoomOut();
          break;
        case '0':
          event.preventDefault();
          handleZoomFit();
          break;
        case 'r':
          event.preventDefault();
          handleRotate();
          break;
        case 'f':
          event.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            event.preventDefault();
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages, isFullscreen]);

  // 📏 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 如果 PDF 组件还没加载完成
  if (!pdfLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-gray-600">正在初始化 PDF 预览...</p>
        <p className="text-gray-500 text-sm mt-2">配置 PDF.js worker...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* 🔧 工具栏 */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          {/* 📄 页面导航 */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="上一页 (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1 text-sm">
              <input
                type="number"
                value={pageInputValue}
                onChange={(e) => handlePageInputChange(e.target.value)}
                onBlur={handlePageInputBlur}
                className="w-14 px-2 py-1 text-center border rounded text-xs"
                min="1"
                max={numPages}
              />
              <span className="text-gray-500">/ {numPages}</span>
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="下一页 (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 🔍 缩放控制 */}
          <div className="flex items-center gap-2 border-l pl-3">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.25}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              title="缩小 (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm font-mono w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3.0}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              title="放大 (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleZoomFit}
              className="px-2 py-1 text-xs rounded hover:bg-gray-200"
              title="适合窗口 (0)"
            >
              重置
            </button>
          </div>

          {/* 🔄 旋转控制 */}
          <button
            onClick={handleRotate}
            className="p-1 rounded hover:bg-gray-200 border-l pl-3"
            title="旋转 90° (R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* 🖥️ 全屏控制 */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-gray-200"
            title={isFullscreen ? "退出全屏 (Esc)" : "全屏显示 (F)"}
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        {/* 📊 文件信息和操作 */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {file.name} • {formatFileSize(file.size)}
          </div>
          
          <button
            onClick={onDownload}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="w-3 h-3" />
            下载
          </button>
        </div>
      </div>

      {/* 📖 PDF 内容区域 */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          {loading && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-gray-600">正在加载 PDF...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-red-600 font-medium mb-2">PDF 预览失败</p>
              <p className="text-gray-600 text-sm max-w-md mb-4">{error}</p>
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                下载文件查看
              </button>
            </div>
          )}

          {!error && pdfLoaded && (
            <div className="w-full max-w-4xl">
              <Document
                file={pdfDataUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                    <p className="text-gray-600">正在加载文档...</p>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-4">PDF 文档加载失败</p>
                    <button
                      onClick={onDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      下载文件查看
                    </button>
                  </div>
                }
              >
                {numPages > 0 && (
                  <div className="bg-white shadow-lg mx-auto" style={{ width: 'fit-content' }}>
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      onLoadSuccess={onPageLoadSuccess}
                      onLoadError={onPageLoadError}
                      loading={
                        <div className="flex items-center justify-center py-16 bg-gray-50">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          <span className="ml-2 text-gray-600">加载页面 {pageNumber}...</span>
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center py-16 bg-gray-50">
                          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                          <p className="text-red-600">页面 {pageNumber} 加载失败</p>
                        </div>
                      }
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </div>
                )}
              </Document>
            </div>
          )}
        </div>
      </div>

      {/* 📱 快捷键提示 */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
        <div className="flex gap-6">
          <span>← → 翻页</span>
          <span>+ - 缩放</span>
          <span>0 重置</span>
          <span>R 旋转</span>
          <span>F 全屏</span>
          {isFullscreen && <span>Esc 退出全屏</span>}
        </div>
      </div>
    </div>
  );
}