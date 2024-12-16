export function calculateNodeSize(size: string): string {
  const sizeMap = {
    '1': 'w-6 h-6',
    '2': 'w-10 h-10',
    '3': 'w-16 h-16',
    '4': 'w-32 h-32',
    '5': 'w-48 h-48'
  };
  return sizeMap[size] || sizeMap['3'];
}

export function getSizeInPixels(size: string): number {
  const sizeMap = {
    '1': 24,
    '2': 40,
    '3': 64,
    '4': 128,
    '5': 192
  };
  return sizeMap[size] || sizeMap['3'];
}