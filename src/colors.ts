/**
 * はらぺこあおむし（Eric Carle）スタイルのカラーパレット
 * 高彩度・ハイコントラスト・ビビッドな色使い
 * コラージュ画のような力強い色彩
 *
 * AM (0-11): 深夜→明け方→朝→午前
 * PM (12-23): 昼下がり→夕方→夜の入り→夜
 */

export interface HourColor {
  bg: string;
  badge: string;
  text: string;
}

// ===== AM: 0時〜11時 =====
// Eric Carleの絵本のような鮮烈な色

const AM_COLORS: HourColor[] = [
  // 深夜 (0-2): 深いインディゴ〜紫
  { bg: "#1B0A5C", badge: "#2A1080", text: "#ffffff" }, // 0時: 漆黒のインディゴ
  { bg: "#2E1578", badge: "#3D1E9E", text: "#ffffff" }, // 1時: 深い紫
  { bg: "#4A2090", badge: "#6030B0", text: "#ffffff" }, // 2時: 紫の夜明け前

  // 明け方 (3-5): 鮮烈な朝焼け
  { bg: "#D81848", badge: "#E82058", text: "#ffffff" }, // 3時: 力強いクリムゾン
  { bg: "#F06010", badge: "#F87020", text: "#ffffff" }, // 4時: 燃えるオレンジ
  { bg: "#F8C800", badge: "#FFD500", text: "#1a1a1a" }, // 5時: まぶしいイエロー

  // 朝 (6-8): 鮮やかな自然の緑
  { bg: "#88C800", badge: "#98D810", text: "#1a1a1a" }, // 6時: ライムグリーン
  { bg: "#009848", badge: "#00B058", text: "#ffffff" }, // 7時: 鮮やかなグリーン
  { bg: "#008068", badge: "#009878", text: "#ffffff" }, // 8時: ティールグリーン

  // 午前 (9-11): 力強い青空
  { bg: "#0098D8", badge: "#00A8E8", text: "#ffffff" }, // 9時:  ビビッドスカイ
  { bg: "#0070C0", badge: "#0080D0", text: "#ffffff" }, // 10時: コバルトブルー
  { bg: "#0050A0", badge: "#0060B8", text: "#ffffff" }, // 11時: ロイヤルブルー
];

// ===== PM: 12時〜23時 =====

const PM_COLORS: HourColor[] = [
  // 昼下がり (12-14): 太陽の色
  { bg: "#F8B800", badge: "#FFC810", text: "#1a1a1a" }, // 12時: ゴールデンイエロー
  { bg: "#F09800", badge: "#F8A810", text: "#1a1a1a" }, // 13時: マリーゴールド
  { bg: "#E87800", badge: "#F08808", text: "#ffffff" }, // 14時: アンバー

  // 夕方 (15-17): 夕焼けの赤
  { bg: "#E05000", badge: "#E86010", text: "#ffffff" }, // 15時: バーントオレンジ
  { bg: "#D02020", badge: "#E03030", text: "#ffffff" }, // 16時: ファイアレッド
  { bg: "#B01850", badge: "#C82060", text: "#ffffff" }, // 17時: ディープローズ

  // 夜の入り (18-20): たそがれの紫
  { bg: "#8818A0", badge: "#9820B0", text: "#ffffff" }, // 18時: ビビッドパープル
  { bg: "#6018A0", badge: "#7028B0", text: "#ffffff" }, // 19時: ディープパープル
  { bg: "#401890", badge: "#502098", text: "#ffffff" }, // 20時: ダークバイオレット

  // 夜 (21-23): 夜空
  { bg: "#281070", badge: "#381880", text: "#ffffff" }, // 21時: ミッドナイト
  { bg: "#1C0C58", badge: "#281068", text: "#ffffff" }, // 22時: 深い夜
  { bg: "#100840", badge: "#1C1058", text: "#ffffff" }, // 23時: 漆黒
];

export function getAmColor(hour: number): HourColor {
  return AM_COLORS[hour % 12];
}

export function getPmColor(hour: number): HourColor {
  return PM_COLORS[hour % 12];
}

export function getHourColor(hour24: number): HourColor {
  return hour24 < 12 ? getAmColor(hour24) : getPmColor(hour24);
}

export const amColors = AM_COLORS;
export const pmColors = PM_COLORS;
