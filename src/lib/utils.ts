export function generateRandomName(): string {
  const adjectives = ['快速', '聪明', '创新', '高效', '专注', '灵活'];
  const nouns = ['开发者', '程序员', '工程师', '编码者', '创造者', '构建者'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}的${noun}`;
}

export function generateUserColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#FF7675', '#74B9FF', '#00B894', '#FDCB6E'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}