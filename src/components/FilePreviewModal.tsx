// components/FilePreviewModal.tsx - 添加 PDF 预览支持
'use client';

import { useState, useEffect, useRef } from 'react';
import { SharedFile } from '@/types';
import PdfPreview from '@/components/PdfPreview';
import { 
  X, Eye, Code, FileText, Image as ImageIcon, 
  Music, Video, Table, Binary, Hash, Download,
  ZoomIn, ZoomOut, RotateCw, Copy, FileIcon
} from 'lucide-react';

interface FilePreviewModalProps {
  file: SharedFile | null;
  onClose: () => void;
  onDownload: (file: SharedFile) => void;
}

type PreviewMode = 'auto' | 'text' | 'hex' | 'binary' | 'image' | 'audio' | 'video' | 'pdf' | 'csv' | 'json' | 'xml';

export default function FilePreviewModal({ file, onClose, onDownload }: FilePreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('auto');
  const [imageZoom, setImageZoom] = useState(100);
  const [imageRotation, setImageRotation] = useState(0);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [jsonData, setJsonData] = useState<any>(null);
  const [binaryContent, setBinaryContent] = useState<string>('');
  const [hexContent, setHexContent] = useState<string>('');

  useEffect(() => {
    if (!file) return;
    
    // 根据文件类型自动选择预览模式
    const ext = file.name.split('.').pop()?.toLowerCase();
    const autoMode = getAutoPreviewMode(ext || '', file.type);
    setPreviewMode(autoMode);
    
    // 预处理文件内容
    preprocessFileContent(file);
  }, [file]);

  // 🎯 自动选择预览模式
  const getAutoPreviewMode = (ext: string, mimeType: string): PreviewMode => {
    // PDF 类型 - 新增
    if (ext === 'pdf' || mimeType === 'application/pdf') {
      return 'pdf';
    }
    
    // 图片类型
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return 'image';
    }
    
    // 音频类型
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext)) {
      return 'audio';
    }
    
    // 视频类型
    if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext)) {
      return 'video';
    }
    
    // CSV
    if (ext === 'csv') {
      return 'csv';
    }
    
    // JSON
    if (ext === 'json' || mimeType === 'application/json') {
      return 'json';
    }
    
    // XML
    if (['xml', 'svg'].includes(ext) || mimeType.includes('xml')) {
      return 'xml';
    }
    
    // 文本文件
    if (file?.isTextFile) {
      return 'text';
    }
    
    // 默认十六进制
    return 'hex';
  };

  // 🔄 预处理文件内容
  const preprocessFileContent = async (fileData: SharedFile) => {
    try {
      if (!fileData.isTextFile) {
        // 二进制文件：生成二进制和十六进制视图
        const binaryData = atob(fileData.content);
        generateBinaryView(binaryData);
        generateHexView(binaryData);
      }
      
      // CSV 解析
      if (fileData.name.endsWith('.csv')) {
        parseCsvContent(fileData.content);
      }
      
      // JSON 解析
      if (fileData.name.endsWith('.json')) {
        try {
          setJsonData(JSON.parse(fileData.content));
        } catch (e) {
          console.error('JSON 解析失败:', e);
        }
      }
    } catch (error) {
      console.error('文件预处理失败:', error);
    }
  };

  // 📊 生成二进制视图
  const generateBinaryView = (binaryData: string) => {
    const binary = [];
    for (let i = 0; i < Math.min(binaryData.length, 1024); i++) {
      const byte = binaryData.charCodeAt(i);
      binary.push(byte.toString(2).padStart(8, '0'));
    }
    setBinaryContent(binary.join(' '));
  };

  // 🔢 生成十六进制视图
  const generateHexView = (binaryData: string) => {
    const hex = [];
    
    for (let i = 0; i < Math.min(binaryData.length, 1024); i += 16) {
      const offset = i.toString(16).padStart(8, '0').toUpperCase();
      const hexLine = [];
      const asciiLine = [];
      
      for (let j = 0; j < 16 && i + j < binaryData.length; j++) {
        const byte = binaryData.charCodeAt(i + j);
        hexLine.push(byte.toString(16).padStart(2, '0').toUpperCase());
        asciiLine.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
      }
      
      hex.push(`${offset}  ${hexLine.join(' ').padEnd(47)}  ${asciiLine.join('')}`);
    }
    
    setHexContent(hex.join('\n'));
  };

  // 📈 解析 CSV 内容
  const parseCsvContent = (content: string) => {
    const lines = content.split('\n');
    const data = lines.map(line => {
      return line.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
    }).filter(row => row.some(cell => cell.length > 0));
    
    setCsvData(data);
  };

  // 🎨 图片操作
  const handleImageZoom = (delta: number) => {
    setImageZoom(prev => Math.max(10, Math.min(500, prev + delta)));
  };

  const handleImageRotate = () => {
    setImageRotation(prev => (prev + 90) % 360);
  };

  // 📋 复制内容
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('内容已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 📱 预览模式选择器
  const PreviewModeSelector = () => {
    const modes: { key: PreviewMode; label: string; icon: any }[] = [
      { key: 'auto', label: '自动', icon: Eye },
      { key: 'text', label: '文本', icon: FileText },
      { key: 'hex', label: '十六进制', icon: Hash },
      { key: 'binary', label: '二进制', icon: Binary },
      { key: 'image', label: '图片', icon: ImageIcon },
      { key: 'audio', label: '音频', icon: Music },
      { key: 'video', label: '视频', icon: Video },
      { key: 'pdf', label: 'PDF', icon: FileIcon }, // 新增 PDF 模式
      { key: 'csv', label: '表格', icon: Table },
      { key: 'json', label: 'JSON', icon: Code },
    ];

    return (
      <div className="flex flex-wrap gap-1 mb-4">
        {modes.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPreviewMode(key)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              previewMode === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
    );
  };

  // 🖼️ 图片预览组件
  const ImagePreview = ({ file }: { file: SharedFile }) => (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => handleImageZoom(-10)} className="p-1 bg-gray-200 rounded">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-sm">{imageZoom}%</span>
        <button onClick={() => handleImageZoom(10)} className="p-1 bg-gray-200 rounded">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleImageRotate} className="p-1 bg-gray-200 rounded">
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
      <img
        src={`data:${file.type};base64,${file.content}`}
        alt={file.name}
        style={{
          transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
          maxWidth: '100%',
          maxHeight: '60vh',
          objectFit: 'contain'
        }}
        className="transition-transform"
      />
    </div>
  );

  // 🎵 音频预览组件
  const AudioPreview = ({ file }: { file: SharedFile }) => (
    <div className="flex flex-col items-center p-8">
      <Music className="w-16 h-16 text-gray-400 mb-4" />
      <audio
        controls
        className="w-full max-w-md"
        src={`data:${file.type};base64,${file.content}`}
      >
        您的浏览器不支持音频播放
      </audio>
    </div>
  );

  // 🎬 视频预览组件
  const VideoPreview = ({ file }: { file: SharedFile }) => (
    <div className="flex justify-center">
      <video
        controls
        className="max-w-full max-h-96"
        src={`data:${file.type};base64,${file.content}`}
      >
        您的浏览器不支持视频播放
      </video>
    </div>
  );

  // 📊 CSV 表格预览
  const CsvPreview = () => (
    <div className="overflow-auto max-h-96">
      <table className="w-full border-collapse border border-gray-300">
        {csvData.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50' : ''}>
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className="border border-gray-300 px-2 py-1 text-sm"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  );

  // 🔧 JSON 预览
  const JsonPreview = () => (
    <div className="relative">
      <button
        onClick={() => copyToClipboard(JSON.stringify(jsonData, null, 2))}
        className="absolute top-2 right-2 p-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        <Copy className="w-4 h-4" />
      </button>
      <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
        {JSON.stringify(jsonData, null, 2)}
      </pre>
    </div>
  );

  // 🔢 十六进制预览
  const HexPreview = () => (
    <div className="relative">
      <button
        onClick={() => copyToClipboard(hexContent)}
        className="absolute top-2 right-2 p-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        <Copy className="w-4 h-4" />
      </button>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
        {hexContent}
      </pre>
    </div>
  );

  // 📊 二进制预览
  const BinaryPreview = () => (
    <div className="relative">
      <button
        onClick={() => copyToClipboard(binaryContent)}
        className="absolute top-2 right-2 p-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        <Copy className="w-4 h-4" />
      </button>
      <pre className="bg-gray-900 text-cyan-400 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono break-all">
        {binaryContent}
      </pre>
    </div>
  );

  // 📄 文本预览
  const TextPreview = ({ file }: { file: SharedFile }) => (
    <div className="relative">
      <button
        onClick={() => copyToClipboard(file.content)}
        className="absolute top-2 right-2 p-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        <Copy className="w-4 h-4" />
      </button>
      <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm whitespace-pre-wrap font-mono">
        {file.content}
      </pre>
    </div>
  );

  if (!file) return null;

  // 📱 渲染预览内容
  const renderPreviewContent = () => {
    const currentMode = previewMode === 'auto' ? getAutoPreviewMode(
      file.name.split('.').pop()?.toLowerCase() || '', 
      file.type
    ) : previewMode;

    switch (currentMode) {
      case 'image':
        return <ImagePreview file={file} />;
      case 'audio':
        return <AudioPreview file={file} />;
      case 'video':
        return <VideoPreview file={file} />;
      case 'pdf': // 新增 PDF 预览
        return (
          <PdfPreview 
            file={{
              name: file.name,
              content: file.content,
              size: file.size
            }}
            onDownload={() => onDownload(file)}
          />
        );
      case 'csv':
        return <CsvPreview />;
      case 'json':
        return jsonData ? <JsonPreview /> : <TextPreview file={file} />;
      case 'hex':
        return <HexPreview />;
      case 'binary':
        return <BinaryPreview />;
      case 'text':
      default:
        return <TextPreview file={file} />;
    }
  };

  // 📄 PDF 预览时使用全高度布局
  const isPdfPreview = (previewMode === 'auto' && file.name.toLowerCase().endsWith('.pdf')) || previewMode === 'pdf';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg w-full flex flex-col ${
        isPdfPreview ? 'max-w-7xl h-[95vh]' : 'max-w-6xl max-h-[90vh]'
      }`}>
        {/* 🔝 头部 - PDF 预览时隐藏 */}
        {!isPdfPreview && (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold truncate">{file.name}</h3>
                <p className="text-sm text-gray-500">
                  {file.category} • {formatFileSize(file.size)} • {file.type}
                </p>
              </div>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 🎛️ 控制栏 */}
            <div className="p-4 border-b">
              <PreviewModeSelector />
            </div>
          </>
        )}

        {/* 📄 内容区域 */}
        <div className={isPdfPreview ? 'flex-1' : 'flex-1 overflow-auto p-4'}>
          {isPdfPreview && (
            <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={onClose} 
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {renderPreviewContent()}
        </div>

        {/* 🔽 底部操作栏 - PDF 预览时隐藏 */}
        {!isPdfPreview && (
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-gray-500">
              预览模式: {previewMode === 'auto' ? `自动 (${getAutoPreviewMode(
                file.name.split('.').pop()?.toLowerCase() || '', 
                file.type
              )})` : previewMode}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onDownload(file)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                下载文件
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 📏 工具函数
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}