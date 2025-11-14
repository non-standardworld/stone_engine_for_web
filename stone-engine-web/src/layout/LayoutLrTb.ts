/**
 * LayoutLrTb.ts
 *
 * Stone Engine Web - Horizontal text layout (Left-to-right, Top-to-bottom)
 * STLayoutのLrTb機能を移植
 */

import { Context } from '../core/Context';
import { UnicodeUtils } from '../utils/UnicodeUtils';

export class LayoutLrTb {
  private x: number = 0;
  private y: number = 0;
  private lineNumber: number = 0;

  constructor(private context: Context) {}

  /**
   * レイアウトを実行
   */
  layout(): void {
    // 初期化
    this.x = 0;
    this.y = this.context.fontSize;
    this.lineNumber = 0;

    for (let i = 0; i < this.context.runs.length; i++) {
      const run = this.context.runs[i];

      // 改行処理
      if (UnicodeUtils.isNewline(run.char)) {
        this.newLine();
        run.line = this.lineNumber;
        // 改行文字は位置だけ設定（幅0）
        run.position = { x: this.x, y: this.y };
        run.frame = {
          x: this.x,
          y: this.y - this.context.fontSize,
          width: 0,
          height: this.context.fontSize,
        };
        continue;
      }

      // 行折り返し判定
      if (this.x + run.advance.width > this.context.renderSize.width) {
        this.newLine();
      }

      // 位置とフレームを設定
      run.position = { x: this.x, y: this.y };
      run.frame = {
        x: this.x,
        y: this.y - this.context.fontSize,
        width: run.advance.width,
        height: this.context.fontSize,
      };
      run.line = this.lineNumber;

      // X座標を進める
      this.x += run.advance.width;
    }
  }

  /**
   * 改行処理
   */
  private newLine(): void {
    this.x = 0;
    this.y += this.context.lineHeightPx;
    this.lineNumber++;
  }
}
