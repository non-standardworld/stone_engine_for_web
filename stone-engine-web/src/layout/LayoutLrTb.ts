/**
 * LayoutLrTb.ts
 *
 * Stone Engine Web - Horizontal text layout (Left-to-right, Top-to-bottom)
 * STLayoutのLrTb機能を移植
 */

import { Context } from '../core/Context';
import { UnicodeUtils } from '../utils/UnicodeUtils';
import { KinsokuEngine } from '../kinsoku/KinsokuEngine';
import { PunctuationEngine } from '../punctuation/PunctuationEngine';

export class LayoutLrTb {
  private x: number = 0;
  private y: number = 0;
  private lineNumber: number = 0;
  private lineStartRunId: number = 0;
  private kinsokuEngine: KinsokuEngine;
  private punctuationEngine: PunctuationEngine;

  constructor(private context: Context) {
    this.kinsokuEngine = new KinsokuEngine(context);
    this.punctuationEngine = new PunctuationEngine(context);
  }

  /**
   * レイアウトを実行
   */
  layout(): void {
    // 約物処理を適用
    this.punctuationEngine.process();

    // 初期化
    this.x = 0;
    this.y = this.context.fontSize;
    this.lineNumber = 0;
    this.lineStartRunId = 0;

    for (let i = 0; i < this.context.runs.length; i++) {
      const run = this.context.runs[i];

      // 改行処理
      if (UnicodeUtils.isNewline(run.char)) {
        this.newLine(i);
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

      // 約物処理適用後の幅を計算
      const adjustedWidth = this.punctuationEngine.getAdjustedWidth(run, run.advance.width);
      const adjustedX = this.punctuationEngine.getAdjustedPositionX(run, this.x, this.context.fontSize);

      // 行折り返し判定
      if (this.x + adjustedWidth > this.context.renderSize.width) {
        // 禁則処理を適用
        const adjustedRunId = this.kinsokuEngine.process(this.lineStartRunId, i - 1);

        // 調整されたRunIdまでレイアウト、残りは次の行へ
        this.layoutCurrentLine(this.lineStartRunId, adjustedRunId);
        this.newLine(adjustedRunId);

        // iを調整して、次の行の最初から再レイアウト
        i = adjustedRunId;
        continue;
      }

      // 位置とフレームを設定
      run.position = { x: adjustedX, y: this.y };
      run.frame = {
        x: adjustedX,
        y: this.y - this.context.fontSize,
        width: adjustedWidth,
        height: this.context.fontSize,
      };
      run.line = this.lineNumber;

      // X座標を進める
      this.x += adjustedWidth;
    }
  }

  /**
   * 現在の行をレイアウト（禁則処理適用後）
   */
  private layoutCurrentLine(startRunId: number, endRunId: number): void {
    this.x = 0;
    for (let i = startRunId; i <= endRunId; i++) {
      const run = this.context.runs[i];

      // 改行はスキップ
      if (UnicodeUtils.isNewline(run.char)) {
        continue;
      }

      // 約物処理適用後の幅を計算
      const adjustedWidth = this.punctuationEngine.getAdjustedWidth(run, run.advance.width);
      const adjustedX = this.punctuationEngine.getAdjustedPositionX(run, this.x, this.context.fontSize);

      // 位置とフレームを設定
      run.position = { x: adjustedX, y: this.y };
      run.frame = {
        x: adjustedX,
        y: this.y - this.context.fontSize,
        width: adjustedWidth,
        height: this.context.fontSize,
      };
      run.line = this.lineNumber;

      // X座標を進める
      this.x += adjustedWidth;
    }
  }

  /**
   * 改行処理
   */
  private newLine(currentRunId: number): void {
    this.x = 0;
    this.y += this.context.lineHeightPx;
    this.lineNumber++;
    this.lineStartRunId = currentRunId + 1;
  }
}
