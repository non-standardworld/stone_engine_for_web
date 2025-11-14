/**
 * index.ts
 *
 * Stone Engine Web - Main entry point
 * STLabel相当のシンプルなAPIを提供
 */

import { Context } from './core/Context';
import { Parser } from './parser/Parser';
import { LayoutLrTb } from './layout/LayoutLrTb';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import type { Direction, TextAlign, Size } from './core/Types';

export interface StoneLabelConfig {
  fontSize?: number;
  lineHeight?: number;
  direction?: Direction;
  textAlign?: TextAlign;
  width?: number;
  height?: number;
}

export class StoneLabel {
  private context: Context;
  private parser: Parser;
  private layout: LayoutLrTb;
  private renderer: CanvasRenderer;

  constructor(config?: StoneLabelConfig) {
    this.context = new Context();

    // 設定を適用
    if (config) {
      if (config.fontSize !== undefined) {
        this.context.fontSize = config.fontSize;
      }
      if (config.lineHeight !== undefined) {
        this.context.lineHeight = config.lineHeight;
      }
      if (config.direction !== undefined) {
        this.context.direction = config.direction;
      }
      if (config.textAlign !== undefined) {
        this.context.textAlign = config.textAlign;
      }
      if (config.width !== undefined || config.height !== undefined) {
        this.context.renderSize = {
          width: config.width || this.context.renderSize.width,
          height: config.height || this.context.renderSize.height,
        };
      }
    }

    this.parser = new Parser(this.context);
    this.layout = new LayoutLrTb(this.context);
    this.renderer = new CanvasRenderer(this.context);
  }

  /**
   * テキストを設定
   */
  setText(text: string): void {
    this.parser.parse(text);
    this.layout.layout();
  }

  /**
   * Canvasに描画
   */
  render(canvas: HTMLCanvasElement): void {
    this.renderer.render(canvas);
  }

  /**
   * デバッグ用: フレームを描画
   */
  renderDebugFrames(canvas: HTMLCanvasElement): void {
    this.renderer.renderDebugFrames(canvas);
  }

  /**
   * Contextを取得（高度な使用のため）
   */
  getContext(): Context {
    return this.context;
  }

  /**
   * レンダリングサイズを取得
   */
  getRenderSize(): Size {
    return this.context.renderSize;
  }

  /**
   * レンダリングサイズを設定
   */
  setRenderSize(size: Size): void {
    this.context.renderSize = size;
    this.layout.layout(); // 再レイアウト
  }
}

/**
 * シンプルなヘルパー関数
 */
export function createLabel(
  canvas: HTMLCanvasElement,
  text: string,
  config?: StoneLabelConfig
): StoneLabel {
  const label = new StoneLabel({
    width: canvas.width,
    height: canvas.height,
    ...config,
  });
  label.setText(text);
  label.render(canvas);
  return label;
}

// 型をエクスポート
export * from './core/Types';
export { Context } from './core/Context';
export { Parser } from './parser/Parser';
export { LayoutLrTb } from './layout/LayoutLrTb';
export { CanvasRenderer } from './renderer/CanvasRenderer';
export { FontManager } from './font/FontManager';
export { UnicodeUtils } from './utils/UnicodeUtils';
