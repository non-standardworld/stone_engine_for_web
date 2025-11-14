/**
 * Types.ts
 *
 * Stone Engine Web - Core type definitions
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

/**
 * Text direction
 */
export enum Direction {
  LrTb = 'lrTb',  // Left-to-right, Top-to-bottom (horizontal)
  TbRl = 'tbRl',  // Top-to-bottom, Right-to-left (vertical) - Phase 1で実装
}

/**
 * Script classification for font selection
 */
export enum Script {
  Latin = 0,
  Japanese = 1,
  Emoji = 2,
}

/**
 * Text alignment
 */
export enum TextAlign {
  Leading = 'leading',
  Center = 'center',
  Trailing = 'trailing',
  Justified = 'justified',
}

/**
 * Punctuation mode - Phase 1で実装
 */
export enum PunctuationMode {
  Whole = 'whole',   // 常に全角
  Half = 'half',     // 常に半角
  Stone = 'stone',   // コンテキスト依存
}

/**
 * Punctuation type - Phase 1で実装
 */
export enum PunctuationType {
  Whole = 'whole',
  FirstHalf = 'firstHalf',    // 前半（。」など）
  SecondHalf = 'secondHalf',  // 後半（「など）
  Quarter = 'quarter',        // 中点など
}

/**
 * Run: 個別文字のレンダリングユニット
 * STRun相当
 */
export interface Run {
  // 基本情報
  char: string;
  fontId: number;

  // レイアウト情報
  position: Point;
  advance: Size;
  frame: Rect;

  // メタ情報
  line: number;
  tokenId: number;
}

/**
 * Token: Runのグループ（単語など）
 * STToken相当
 */
export interface Token {
  runIds: number[];
}
