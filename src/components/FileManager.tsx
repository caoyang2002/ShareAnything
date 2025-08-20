'use client';

import { useState, useRef } from 'react';
import { SharedFile } from '@/types';
import { 
  Upload, 
  Download, 
  Trash2, 
  File, 
  Image, 
  FileText, 
  Code,
  Eye,
  X
} from 'lucide-react';

interface FileManagerProps {
  files: SharedFile[];
  onFileUpload: (file: SharedFile) => void;
  onFileDelete: (fileId: string) => void;
  currentUserId: string;
}

const TEXT_FILE_EXTENSIONS = [
  '.txt', '.md', '.json', '.xml', '.csv', '.log', '.ini', '.cfg'
];

const CODE_FILE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', 
  '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.r'
];

const IMAGE_FILE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico'
];

export default function FileManager({ 
  files, 
  onFileUpload, 
  onFileDelete, 
  currentUserId 
}: FileManagerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<SharedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    
    if (IMAGE_FILE_EXTENSIONS.includes(ext)) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (CODE_FILE_EXTENSIONS.includes(ext)) {
      return <Code className="w-5 h-5 text-green-500" />;
    } else if (TEXT_FILE_EXTENSIONS.includes(ext)) {
      return <FileText className="w-5 h-5 text-yellow-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const isTextFile = (fileName: string): boolean => {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    return TEXT_FILE_EXTENSIONS.includes(ext) || CODE_FILE_EXTENSIONS.includes(ext);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(processFile);
    }
    event.target.value = '';
  };

  const processFile = async (file: File) => {
    if (file.size > 1024 * 1024 * 1024) { // 1GB 限制
      alert('文件大小不能超过 1GB');
      return;
    }

    setIsUploading(true);

    try {
      const isText = isTextFile(file.name);
      let content: string;

      if (isText) {
        content = await file.text();
      } else {
        const buffer = await file.arrayBuffer();
        content = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      }

      const sharedFile: SharedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        content,
        uploadedBy: currentUserId,
        uploadedAt: new Date(),
        isTextFile: isText,
      };

      onFileUpload(sharedFile);
    } catch (error) {
      console.error('文件处理失败:', error);
      alert('文件上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) {
      Array.from(droppedFiles).forEach(processFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const downloadFile = (file: SharedFile) => {
    try {
      let blob: Blob;
      
      if (file.isTextFile) {
        blob = new Blob([file.content], { type: 'text/plain' });
      } else {
        const binaryString = atob(file.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: file.type });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('文件下载失败');
    }
  };

  const previewTextFile = (file: SharedFile) => {
    if (file.isTextFile) {
      setPreviewFile(file);
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          文件管理 ({files.length})
        </h3>

        {/* 上传区域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors mb-4 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              上传中...
            </div>
          ) : (
            <div className="text-gray-600">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">
                拖拽文件到这里或{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  点击选择文件
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                支持最大 1GB 的文件
              </p>
            </div>
          )}
        </div>

        {/* 文件列表 */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {files.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              还没有上传任何文件
            </p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {getFileIcon(file.name)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {file.isTextFile && (
                    <button
                      onClick={() => previewTextFile(file)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="预览"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => downloadFile(file)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="下载"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onFileDelete(file.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 文件预览模态框 */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] w-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold truncate">
                {previewFile.name}
              </h3>
              <button
                onClick={closePreview}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                {previewFile.content}
              </pre>
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => downloadFile(previewFile)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                下载文件
              </button>
              <button
                onClick={closePreview}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}