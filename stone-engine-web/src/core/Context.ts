/**
 * Context.ts
 *
 * Stone Engine Web - Central state management
 * STContext相当
 */

import type { Run, Token, Direction, Size, TextAlign, PunctuationMode } from './Types';
import { Direction as DirectionEnum, TextAlign as TextAlignEnum, PunctuationMode as PunctuationModeEnum } from './Types';
import { FontManager } from '../font/FontManager';

export class Context {
  // データ
  runs: Run[] = [];
  tokens: Token[] = [];

  // レイアウト設定
  fontSize: number = 18;
  lineHeight: number = 1.5;
  direction: Direction = DirectionEnum.LrTb;  // MVP: LrTbのみ
  textAlign: TextAlign = TextAlignEnum.Leading;
  renderSize: Size = { width: 800, height: 600 };

  // 高度な組版設定
  isKinsokuAvailable: boolean = true; // 禁則処理を有効にするか
  punctuationMode: PunctuationMode = PunctuationModeEnum.Stone; // 約物処理モード

  // フォント管理
  fontManager: FontManager;

  constructor() {
    this.fontManager = new FontManager();
  }

  /**
   * すべてのデータをクリア
   */
  clear(): void {
    this.runs = [];
    this.tokens = [];
  }

  /**
   * 行の高さを取得
   */
  get lineHeightPx(): number {
    return this.fontSize * this.lineHeight;
  }

  /**
   * 指定した行のRunインデックス範囲を取得
   */
  getRunIndexesForLine(line: number): number[] {
    const indexes: number[] = [];
    for (let i = 0; i < this.runs.length; i++) {
      if (this.runs[i].line === line) {
        indexes.push(i);
      }
    }
    return indexes;
  }

  /**
   * 総行数を取得
   */
  get lineCount(): number {
    if (this.runs.length === 0) return 0;
    return Math.max(...this.runs.map(r => r.line)) + 1;
  }
}
