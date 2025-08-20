// components/FileManager.tsx - 更新版本（解决变量重复问题）
'use client';

import { useState, useRef } from 'react';
import { SharedFile } from '@/types';
import FilePreviewModal from './FilePreviewModal';
import { FILE_TYPES } from '@/types/fileTypes';
import {
  Upload, Download, Trash2, Eye, AlertTriangle
} from 'lucide-react';

interface FileManagerProps {
  files: SharedFile[];
  onFileUpload: (file: SharedFile) => void;
  onFileDelete: (fileId: string) => void;
  currentUserId: string;
}

export default function FileManager({ 
  files, 
  onFileUpload, 
  onFileDelete, 
  currentUserId 
}: FileManagerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewingFile, setPreviewingFile] = useState<SharedFile | null>(null); // 重命名变量
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔍 获取文件类型信息
  const getFileTypeInfo = (fileName: string) => {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    
    for (const [typeKey, config] of Object.entries(FILE_TYPES)) {
      if (config.extensions.includes(ext)) {
        return { typeKey, ...config };
      }
    }
    
    return {
      typeKey: 'unknown',
      extensions: [ext],
      icon: 'File',
      color: 'text-gray-500',
      category: '其他',
      canPreview: true, // 默认允许预览（至少可以显示十六进制）
      isTextBased: false,
      maxSize: 100
    };
  };

  // 🎨 获取文件图标
  const getFileIcon = (fileName: string) => {
    const typeInfo = getFileTypeInfo(fileName);
    // 简化图标逻辑，使用 Lucide 图标
    const iconMap: Record<string, any> = {
      'File': '📄',
      'Image': '🖼️',
      'Code': '💻',
      'Music': '🎵',
      'Video': '🎬',
      'Archive': '🗜️',
      'Database': '🗄️',
      'Shield': '🔐',
      'Settings': '⚙️',
      'Zap': '⚡',
      'Book': '📚',
      'Gamepad2': '🎮',
      'Globe': '🌐',
      'Palette': '🎨',
      'Sheet': '📊',
      'Presentation': '📈'
    };
    
    return (
      <span className="text-lg">
        {iconMap[typeInfo.icon] || '📄'}
      </span>
    );
  };

  // 📏 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 🔒 安全的 Base64 编码
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('FileReader result is not a string'));
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  // 📂 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(processFile);
    }
    event.target.value = '';
  };

  // ⚙️ 处理文件
  const processFile = async (file: File) => {
    const typeInfo = getFileTypeInfo(file.name);
    const maxSizeBytes = (typeInfo.maxSize || 100) * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      alert(`${typeInfo.category}文件大小不能超过 ${typeInfo.maxSize}MB`);
      return;
    }

    if (typeInfo.warning) {
      const confirmed = confirm(
        `警告：${typeInfo.warning}\n\n文件：${file.name}\n类型：${typeInfo.category}\n大小：${formatFileSize(file.size)}\n\n确定要上传吗？`
      );
      if (!confirmed) return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let content: string;

      if (typeInfo.isTextBased) {
        content = await file.text();
        setUploadProgress(50);
      } else {
        content = await fileToBase64(file);
        setUploadProgress(50);
      }

      const sharedFile: SharedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        content,
        uploadedBy: currentUserId,
        uploadedAt: new Date(),
        isTextFile: typeInfo.isTextBased,
        category: typeInfo.category,
        canPreview: true, // 所有文件都支持某种形式的预览
        fileTypeInfo: typeInfo
      };

      setUploadProgress(80);
      await onFileUpload(sharedFile);
      setUploadProgress(100);
      
    } catch (error) {
      console.error('文件处理失败:', error);
      alert(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 🎯 拖拽处理
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

  // 📥 下载文件
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

  // 🏷️ 获取所有分类
  const categories = ['全部', ...new Set(files.map(f => f.category || '其他'))];

  // 🔍 过滤文件
  const filteredFiles = selectedCategory === '全部' 
    ? files 
    : files.filter(f => (f.category || '其他') === selectedCategory);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* 🎯 分类筛选 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          增强文件管理器 ({filteredFiles.length}/{files.length})
        </h3>

        {/* 📤 上传区域 */}
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
              <div className="text-sm">上传中... {uploadProgress}%</div>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
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
                支持文本、二进制、十六进制等多种预览模式
              </p>
            </div>
          )}
        </div>

        {/* 📋 文件列表 */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              {selectedCategory === '全部' ? '还没有上传任何文件' : `没有找到${selectedCategory}类型的文件`}
            </p>
          ) : (
            filteredFiles.map((file) => {
              const typeInfo = getFileTypeInfo(file.name);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {getFileIcon(file.name)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      {typeInfo.warning && (
                        <span title={typeInfo.warning}>
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full bg-gray-100 ${typeInfo.color}`}>
                        {file.category || typeInfo.category}
                      </span>
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{new Date(file.uploadedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewingFile(file)} // 使用新的变量名
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="高级预览"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
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
              );
            })
          )}
        </div>
      </div>

      {/* 🔍 高级预览模态框 */}
      <FilePreviewModal
        file={previewingFile}
        onClose={() => setPreviewingFile(null)}
        onDownload={downloadFile}
      />
    </>
  );
}