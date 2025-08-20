// types/fileTypes.ts
export interface FileTypeConfig {
  extensions: string[];
  icon: string;
  color: string;
  category: string;
  canPreview: boolean;
  isTextBased: boolean;
  maxSize?: number; // MB
  warning?: string;
}

export const FILE_TYPES: Record<string, FileTypeConfig> = {
  // 📄 文档类型
 document: {
    extensions: ['.pdf', '.doc', '.docx', '.odt', '.rtf'],
    icon: 'FileText',
    color: 'text-red-500',
    category: '文档',
    canPreview: true, // PDF 现在支持预览
    isTextBased: false,
    maxSize: 50
  },
  
  // 📊 表格类型
  spreadsheet: {
    extensions: ['.xls', '.xlsx', '.ods', '.csv'],
    icon: 'Sheet',
    color: 'text-green-500',
    category: '表格',
    canPreview: true,
    isTextBased: true,
    maxSize: 20
  },
  
  // 📈 演示文稿
  presentation: {
    extensions: ['.ppt', '.pptx', '.odp'],
    icon: 'Presentation',
    color: 'text-orange-500',
    category: '演示文稿',
    canPreview: false,
    isTextBased: false,
    maxSize: 100
  },
  
  // 🖼️ 图像类型
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif'],
    icon: 'Image',
    color: 'text-blue-500',
    category: '图像',
    canPreview: true,
    isTextBased: false,
    maxSize: 50
  },
  
  // 🎨 专业图像
  designImage: {
    extensions: ['.psd', '.ai', '.sketch', '.fig', '.xd', '.indd'],
    icon: 'Palette',
    color: 'text-purple-500',
    category: '设计文件',
    canPreview: false,
    isTextBased: false,
    maxSize: 200
  },
  
  // 🎵 音频类型
  audio: {
    extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
    icon: 'Music',
    color: 'text-pink-500',
    category: '音频',
    canPreview: false,
    isTextBased: false,
    maxSize: 100
  },
  
  // 🎬 视频类型
  video: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v'],
    icon: 'Video',
    color: 'text-indigo-500',
    category: '视频',
    canPreview: false,
    isTextBased: false,
    maxSize: 500
  },
  
  // 🗜️ 压缩文件
  archive: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'],
    icon: 'Archive',
    color: 'text-yellow-500',
    category: '压缩文件',
    canPreview: false,
    isTextBased: false,
    maxSize: 200
  },
  
  // 💻 代码文件
  code: {
    extensions: [
      '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte',
      '.py', '.java', '.cpp', '.c', '.h', '.cs', '.go', '.rs',
      '.php', '.rb', '.swift', '.kt', '.scala', '.r', '.m',
      '.html', '.css', '.scss', '.sass', '.less',
      '.sql', '.sh', '.bat', '.ps1','.lisp'
    ],
    icon: 'Code',
    color: 'text-green-600',
    category: '代码',
    canPreview: true,
    isTextBased: true,
    maxSize: 10
  },
  
  // 📝 文本文件
  text: {
    extensions: ['.txt', '.md', '.readme', '.log', '.ini', '.cfg', '.conf', '.yaml', '.yml', '.toml'],
    icon: 'FileText',
    color: 'text-gray-500',
    category: '文本',
    canPreview: true,
    isTextBased: true,
    maxSize: 5
  },
  
  // 🔧 数据文件
  data: {
    extensions: ['.json', '.xml', '.csv', '.tsv', '.db', '.sqlite', '.sql'],
    icon: 'Database',
    color: 'text-cyan-500',
    category: '数据',
    canPreview: true,
    isTextBased: true,
    maxSize: 50
  },
  
  // 🔑 证书和密钥
  certificate: {
    extensions: ['.pem', '.crt', '.key', '.p12', '.pfx', '.cer'],
    icon: 'Shield',
    color: 'text-red-600',
    category: '证书',
    canPreview: false,
    isTextBased: false,
    maxSize: 1
  },
  
  // ⚙️ 系统文件
  system: {
    extensions: ['.dll', '.so', '.dylib', '.sys'],
    icon: 'Settings',
    color: 'text-gray-600',
    category: '系统文件',
    canPreview: false,
    isTextBased: false,
    maxSize: 50,
    warning: '系统文件可能包含恶意代码，请谨慎下载'
  },
  
  // ⚡ 可执行文件
  executable: {
    extensions: ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.appimage'],
    icon: 'Zap',
    color: 'text-red-700',
    category: '可执行文件',
    canPreview: false,
    isTextBased: false,
    maxSize: 500,
    warning: '可执行文件可能包含病毒或恶意代码，请确认来源后再下载'
  },
  
  // 📚 电子书
  ebook: {
    extensions: ['.epub', '.mobi', '.azw', '.azw3', '.fb2'],
    icon: 'Book',
    color: 'text-amber-600',
    category: '电子书',
    canPreview: false,
    isTextBased: false,
    maxSize: 50
  },
  
  // 🎮 游戏文件
  game: {
    extensions: ['.rom', '.iso', '.bin', '.cue'],
    icon: 'Gamepad2',
    color: 'text-violet-500',
    category: '游戏',
    canPreview: false,
    isTextBased: false,
    maxSize: 1000
  },
  
  // 🌐 Web 文件
  web: {
    extensions: ['.woff', '.woff2', '.ttf', '.otf', '.eot'],
    icon: 'Globe',
    color: 'text-blue-600',
    category: 'Web 字体',
    canPreview: false,
    isTextBased: false,
    maxSize: 5
  }
};