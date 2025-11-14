/**
 * CanvasRenderer.ts
 *
 * Stone Engine Web - Canvas 2D rendering
 * STTextの描画機能を移植
 */

import { Context } from '../core/Context';
import { UnicodeUtils } from '../utils/UnicodeUtils';

export class CanvasRenderer {
  constructor(private context: Context) {}

  /**
   * Canvasに描画
   */
  render(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // テキスト描画設定
    ctx.textBaseline = 'alphabetic';

    for (const run of this.context.runs) {
      // 改行はスキップ
      if (UnicodeUtils.isNewline(run.char)) {
        continue;
      }

      // フォント設定
      const fontFamily = this.context.fontManager.getFontFamily(run.fontId);
      const scale = this.context.fontManager.getFontScale(run.fontId);
      const fontSize = this.context.fontSize * scale;
      ctx.font = `${fontSize}px ${fontFamily}`;

      // テキスト色
      ctx.fillStyle = '#000000';

      // 描画
      ctx.fillText(run.char, run.position.x, run.position.y);
    }
  }

  /**
   * デバッグ用: フレームを描画
   */
  renderDebugFrames(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1;

    for (const run of this.context.runs) {
      ctx.strokeRect(
        run.frame.x,
        run.frame.y,
        run.frame.width,
        run.frame.height
      );
    }
  }
}
