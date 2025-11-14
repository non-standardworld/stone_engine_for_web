/**
 * CanvasRenderer.ts
 *
 * Stone Engine Web - Canvas 2D rendering
 * STTextの描画機能を移植
 */

import { Context } from '../core/Context';
import { Direction } from '../core/Types';
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
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

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

      // 縦書きの場合はLatin文字を回転
      if (this.context.direction === Direction.TbRl) {
        this.renderVertical(ctx, run);
      } else {
        this.renderHorizontal(ctx, run);
      }
    }
  }

  /**
   * 横書き描画
   */
  private renderHorizontal(ctx: CanvasRenderingContext2D, run: any): void {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillText(run.char, run.position.x, run.position.y);
    ctx.restore();
  }

  /**
   * 縦書き描画
   */
  private renderVertical(ctx: CanvasRenderingContext2D, run: any): void {
    const script = UnicodeUtils.getScript(run.char);
    const isLatin = script === 0; // Script.Latin

    ctx.save();

    if (isLatin && !/\d/.test(run.char)) {
      // Latin文字（数字以外）は90度回転
      ctx.translate(run.position.x, run.position.y);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(run.char, 0, 0);
    } else {
      // 日本語、Emoji、数字（縦中横）はそのまま
      ctx.fillText(run.char, run.position.x, run.position.y);
    }

    ctx.restore();
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
