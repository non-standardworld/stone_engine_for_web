/**
 * PunctuationEngine.ts
 *
 * Stone Engine Web - Punctuation processing (yakumono)
 * 約物処理エンジン
 */

import { Context } from '../core/Context';
import { PunctuationType, PunctuationMode } from '../core/Types';

/**
 * 約物分類
 */
export class Punctuation {
  /**
   * 約物タイプマップ
   * 各約物文字をタイプに分類
   */
  private static readonly PUNCTUATION_MAP = new Map<string, PunctuationType>([
    // 前半（行末寄り）
    ['。', PunctuationType.FirstHalf],
    ['、', PunctuationType.FirstHalf],
    ['，', PunctuationType.FirstHalf],
    ['．', PunctuationType.FirstHalf],
    ['」', PunctuationType.FirstHalf],
    ['』', PunctuationType.FirstHalf],
    ['】', PunctuationType.FirstHalf],
    ['〕', PunctuationType.FirstHalf],
    ['］', PunctuationType.FirstHalf],
    ['｝', PunctuationType.FirstHalf],
    ['）', PunctuationType.FirstHalf],
    ['〉', PunctuationType.FirstHalf],
    ['》', PunctuationType.FirstHalf],

    // 後半（行頭寄り）
    ['「', PunctuationType.SecondHalf],
    ['『', PunctuationType.SecondHalf],
    ['【', PunctuationType.SecondHalf],
    ['〔', PunctuationType.SecondHalf],
    ['［', PunctuationType.SecondHalf],
    ['｛', PunctuationType.SecondHalf],
    ['（', PunctuationType.SecondHalf],
    ['〈', PunctuationType.SecondHalf],
    ['《', PunctuationType.SecondHalf],

    // 中点など（4分角）
    ['・', PunctuationType.Quarter],
    ['：', PunctuationType.Quarter],
    ['；', PunctuationType.Quarter],
  ]);

  /**
   * 文字が約物かチェック
   */
  static isPunctuation(char: string): boolean {
    return this.PUNCTUATION_MAP.has(char);
  }

  /**
   * 約物タイプを取得
   */
  static getPunctuationType(char: string): PunctuationType {
    return this.PUNCTUATION_MAP.get(char) || PunctuationType.Whole;
  }
}

/**
 * 約物処理エンジン
 */
export class PunctuationEngine {
  constructor(private context: Context) {}

  /**
   * すべてのRunに約物処理を適用
   */
  process(): void {
    for (let i = 0; i < this.context.runs.length; i++) {
      const run = this.context.runs[i];

      // 約物タイプを設定
      run.punctuationType = Punctuation.getPunctuationType(run.char);

      // 約物処理を適用
      const layout = this.getLayout(i);
      run.punctuationOffset = layout.offset;
      run.punctuationScale = layout.scale;
    }
  }

  /**
   * 約物のレイアウト（オフセットとスケール）を計算
   */
  private getLayout(index: number): { offset: number; scale: number } {
    const run = this.context.runs[index];
    const mode = this.context.punctuationMode;

    // Whole/Halfモードは固定値
    if (mode === PunctuationMode.Whole) {
      return { offset: 0, scale: 1.0 };
    }
    if (mode === PunctuationMode.Half) {
      return { offset: 0, scale: 0.5 };
    }

    // Stoneモード：コンテキスト依存
    if (!run.punctuationType || run.punctuationType === PunctuationType.Whole) {
      return { offset: 0, scale: 1.0 };
    }

    const prevRun = index > 0 ? this.context.runs[index - 1] : null;
    const nextRun = index < this.context.runs.length - 1 ? this.context.runs[index + 1] : null;

    const prevType = prevRun?.punctuationType || PunctuationType.Whole;
    const nextType = nextRun?.punctuationType || PunctuationType.Whole;
    const currentType = run.punctuationType;

    // パターンマッチング

    // パターン1: FirstHalf + SecondHalf （例：。」）
    if (prevType === PunctuationType.FirstHalf &&
        currentType === PunctuationType.SecondHalf) {
      return { offset: -0.5, scale: 0.5 };
    }

    // パターン2: SecondHalf + SecondHalf （例：「「）
    if (prevType === PunctuationType.SecondHalf &&
        currentType === PunctuationType.SecondHalf) {
      return { offset: -0.5, scale: 0.5 };
    }

    // パターン3: Quarter + SecondHalf （例：・「）
    if (prevType === PunctuationType.Quarter &&
        currentType === PunctuationType.SecondHalf) {
      return { offset: -0.25, scale: 0.5 };
    }

    // パターン4: FirstHalf + FirstHalf （例：。。）
    if (currentType === PunctuationType.FirstHalf &&
        nextType === PunctuationType.FirstHalf) {
      return { offset: 0, scale: 0.5 };
    }

    // パターン5: FirstHalf + Quarter （例：。・）
    if (currentType === PunctuationType.FirstHalf &&
        nextType === PunctuationType.Quarter) {
      return { offset: 0, scale: 0.5 };
    }

    // パターン6: Quarter（単独）
    if (currentType === PunctuationType.Quarter) {
      return { offset: 0, scale: 0.5 };
    }

    // デフォルト：全角
    return { offset: 0, scale: 1.0 };
  }

  /**
   * 約物処理を適用した実際の文字幅を計算
   */
  getAdjustedWidth(run: any, originalWidth: number): number {
    const scale = run.punctuationScale || 1.0;
    return originalWidth * scale;
  }

  /**
   * 約物処理を適用した実際のX位置を計算（横書き）
   */
  getAdjustedPositionX(run: any, originalX: number, fontSize: number): number {
    const offset = run.punctuationOffset || 0;
    return originalX + (fontSize * offset);
  }
}
