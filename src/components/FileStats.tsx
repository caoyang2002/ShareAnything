// components/FileStats.tsx
import { SharedFile } from '@/types';
import { PieChart, BarChart } from 'lucide-react';

interface FileStatsProps {
  files: SharedFile[];
}

export default function FileStats({ files }: FileStatsProps) {
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    categories: files.reduce((acc, f) => {
      const cat = f.category || '其他';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    sizeByCategory: files.reduce((acc, f) => {
      const cat = f.category || '其他';
      acc[cat] = (acc[cat] || 0) + f.size;
      return acc;
    }, {} as Record<string, number>)
  };

  const formatSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <BarChart className="w-5 h-5" />
        文件统计
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalFiles}</div>
          <div className="text-sm text-blue-800">总文件数</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{formatSize(stats.totalSize)}</div>
          <div className="text-sm text-green-800">总大小</div>
        </div>
      </div>
      
      <div className="space-y-2">
        {Object.entries(stats.categories).map(([category, count]) => (
          <div key={category} className="flex justify-between items-center">
            <span className="text-sm">{category}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{count}</span>
              <span className="text-xs text-gray-500">
                ({formatSize(stats.sizeByCategory[category])})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}