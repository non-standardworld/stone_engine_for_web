/**
 * Parser.ts
 *
 * Stone Engine Web - Text to runs converter
 * STParser相当
 */

import { Context } from '../core/Context';
import { Run } from '../core/Types';
import { UnicodeUtils } from '../utils/UnicodeUtils';
import { Punctuation } from '../punctuation/PunctuationEngine';
import { globalTextMetricsCache } from '../cache/TextMetricsCache';

export class Parser {
  constructor(private context: Context) {}

  /**
   * テキストをパースしてRunsとTokensを生成
   */
  parse(text: string): void {
    this.context.clear();

    // 文字ごとにRunを作成
    let tokenId = 0;
    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];

      // 改行でトークン区切り（MVP: 簡易版）
      if (UnicodeUtils.isNewline(char)) {
        tokenId++;
      }

      const run = this.createRun(char, tokenId);
      this.context.runs.push(run);
    }

    // トークン作成（MVP: 改行で区切るだけ）
    this.createTokens();
  }

  /**
   * 1文字からRunを生成
   */
  private createRun(char: string, tokenId: number): Run {
    // Script判定
    const script = UnicodeUtils.getScript(char);
    const fontId = this.context.fontManager.getFontId(script);

    // フォント情報取得
    const fontFamily = this.context.fontManager.getFontFamily(fontId);
    const scale = this.context.fontManager.getFontScale(fontId);
    const fontSize = this.context.fontSize * scale;

    // Canvas TextMetricsで文字幅測定
    const metrics = this.measureChar(char, fontFamily, fontSize);

    return {
      char,
      fontId,
      position: { x: 0, y: 0 }, // layoutで設定
      advance: {
        width: metrics.width,
        height: fontSize * this.context.lineHeight,
      },
      frame: { x: 0, y: 0, width: 0, height: 0 }, // layoutで設定
      line: 0, // layoutで設定
      tokenId,
      // 約物タイプを設定
      punctuationType: Punctuation.getPunctuationType(char),
      punctuationOffset: 0,
      punctuationScale: 1.0,
    };
  }

  /**
   * Canvas TextMetricsで文字を測定（キャッシュ使用）
   */
  private measureChar(
    char: string,
    fontFamily: string,
    fontSize: number
  ): { width: number; height: number } {
    // 改行文字は幅0
    if (UnicodeUtils.isNewline(char)) {
      return { width: 0, height: fontSize };
    }

    // キャッシュから取得または測定
    const metrics = globalTextMetricsCache.measureText(char, fontFamily, fontSize);
    return {
      width: metrics.width,
      height: fontSize,
    };
  }

  /**
   * Runsからトークンを作成
   * MVP: 改行で区切るだけの簡易版
   */
  private createTokens(): void {
    let currentToken: number[] = [];
    let currentTokenId = 0;

    this.context.runs.forEach((run, index) => {
      if (run.tokenId !== currentTokenId) {
        // トークン区切り
        if (currentToken.length > 0) {
          this.context.tokens.push({ runIds: currentToken });
        }
        currentToken = [];
        currentTokenId = run.tokenId;
      }
      currentToken.push(index);
    });

    // 最後のトークン
    if (currentToken.length > 0) {
      this.context.tokens.push({ runIds: currentToken });
    }
  }
}
