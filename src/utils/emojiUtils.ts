// 絵文字のカテゴリーごとの色定義
const EMOJI_COLORS = {
  // 自然・天気
  '🌲': { bg: 'from-green-50 to-green-100', text: 'text-green-700' },
  '🌺': { bg: 'from-pink-50 to-pink-100', text: 'text-pink-700' },
  '☀️': { bg: 'from-yellow-50 to-yellow-100', text: 'text-yellow-700' },
  '🌙': { bg: 'from-purple-50 to-purple-100', text: 'text-purple-700' },
  
  // 動物
  '🐶': { bg: 'from-amber-50 to-amber-100', text: 'text-amber-700' },
  '🐱': { bg: 'from-orange-50 to-orange-100', text: 'text-orange-700' },
  '🦁': { bg: 'from-yellow-50 to-yellow-100', text: 'text-yellow-700' },
  
  // テクノロジー
  '💻': { bg: 'from-blue-50 to-blue-100', text: 'text-blue-700' },
  '📱': { bg: 'from-sky-50 to-sky-100', text: 'text-sky-700' },
  '🤖': { bg: 'from-slate-50 to-slate-100', text: 'text-slate-700' },
  
  // 感情・人物
  '😊': { bg: 'from-yellow-50 to-yellow-100', text: 'text-yellow-700' },
  '❤️': { bg: 'from-red-50 to-red-100', text: 'text-red-700' },
  '👤': { bg: 'from-indigo-50 to-indigo-100', text: 'text-indigo-700' },
  
  // 地図・場所
  '🗺️': { bg: 'from-emerald-50 to-emerald-100', text: 'text-emerald-700' },
  '🏠': { bg: 'from-cyan-50 to-cyan-100', text: 'text-cyan-700' },
  '🌍': { bg: 'from-blue-50 to-blue-100', text: 'text-blue-700' },
  
  // デフォルト
  default: { bg: 'from-gray-50 to-gray-100', text: 'text-gray-700' }
};

export function getEmojiColors(emoji: string) {
  // 絵文字の種類を判定して適切な色を返す
  for (const [key, value] of Object.entries(EMOJI_COLORS)) {
    if (emoji.includes(key)) {
      return value;
    }
  }
  return EMOJI_COLORS.default;
}