/**
 * LayoutTbRl.ts
 *
 * Stone Engine Web - Vertical text layout (Top-to-bottom, Right-to-left)
 * STLayoutのTbRl機能を移植
 */

import { Context } from '../core/Context';
import { UnicodeUtils } from '../utils/UnicodeUtils';

export class LayoutTbRl {
  private x: number;
  private y: number = 0;
  private lineNumber: number = 0;

  constructor(private context: Context) {
    // 右端から開始
    this.x = context.renderSize.width - context.fontSize;
  }

  /**
   * レイアウトを実行
   */
  layout(): void {
    // 初期化
    this.x = this.context.renderSize.width - this.context.fontSize;
    this.y = 0;
    this.lineNumber = 0;

    for (let i = 0; i < this.context.runs.length; i++) {
      const run = this.context.runs[i];

      // 改行処理
      if (UnicodeUtils.isNewline(run.char)) {
        this.newLine();
        run.line = this.lineNumber;
        // 改行文字は位置だけ設定（高さ0）
        run.position = { x: this.x, y: this.y };
        run.frame = {
          x: this.x,
          y: this.y,
          width: this.context.fontSize,
          height: 0,
        };
        continue;
      }

      // 縦中横判定（2桁以下の数字）
      if (this.isTateChuYoko(i)) {
        this.layoutTateChuYoko(i);
        continue;
      }

      // 行折り返し判定（下方向）
      if (this.y + run.advance.height > this.context.renderSize.height) {
        this.newLine();
      }

      // 位置とフレームを設定
      run.position = {
        x: this.x + this.context.fontSize / 2,
        y: this.y + run.advance.height / 2,
      };
      run.frame = {
        x: this.x,
        y: this.y,
        width: this.context.fontSize,
        height: run.advance.height,
      };
      run.line = this.lineNumber;

      // Y座標を進める（下方向）
      this.y += run.advance.height;
    }
  }

  /**
   * 改行処理（左方向に移動）
   */
  private newLine(): void {
    this.y = 0;
    this.x -= this.context.lineHeightPx;
    this.lineNumber++;
  }

  /**
   * 縦中横判定（2桁以下の数字）
   */
  private isTateChuYoko(index: number): boolean {
    if (!this.context.runs[index]) return false;

    const char = this.context.runs[index].char;

    // 数字かチェック
    if (!/\d/.test(char)) return false;

    // 前後も数字かチェック
    let digitCount = 1;
    let i = index - 1;

    // 前方向にチェック
    while (i >= 0 && /\d/.test(this.context.runs[i].char)) {
      digitCount++;
      i--;
    }

    // 後方向にチェック
    i = index + 1;
    while (i < this.context.runs.length && /\d/.test(this.context.runs[i].char)) {
      digitCount++;
      i++;
    }

    // 2桁以下の場合のみ縦中横
    return digitCount <= 2;
  }

  /**
   * 縦中横のレイアウト
   */
  private layoutTateChuYoko(index: number): void {
    const run = this.context.runs[index];

    // 縦中横は正立で表示（横向きのまま）
    run.position = {
      x: this.x + this.context.fontSize / 2,
      y: this.y + this.context.fontSize / 2,
    };
    run.frame = {
      x: this.x,
      y: this.y,
      width: this.context.fontSize,
      height: this.context.fontSize,
    };
    run.line = this.lineNumber;

    this.y += this.context.fontSize;
  }

}
