// utils/fileSecurity.ts
export class FileSecurity {
  // 🚨 危险文件类型
  static DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.app', '.deb', '.pkg', '.rpm', '.dmg', '.iso', '.msi'
  ];

  // ✅ 验证文件是否安全
  static isFileSafe(fileName: string): { safe: boolean; warning?: string } {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    
    if (this.DANGEROUS_EXTENSIONS.includes(ext)) {
      return {
        safe: false,
        warning: `${ext} 文件可能包含恶意代码，请确认文件来源安全`
      };
    }
    
    return { safe: true };
  }

  // 🔍 检测文件内容
  static async scanFileContent(file: File): Promise<{ safe: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // 检查文件大小异常
    if (file.size === 0) {
      issues.push('文件大小为 0，可能已损坏');
    }
    
    // 检查文件名中的特殊字符
    if (/[<>:"|?*]/.test(file.name)) {
      issues.push('文件名包含特殊字符');
    }
    
    // 检查是否为隐藏文件
    if (file.name.startsWith('.') && file.name !== '.env' && file.name !== '.gitignore') {
      issues.push('检测到隐藏文件');
    }
    
    return {
      safe: issues.length === 0,
      issues
    };
  }
}