/**
 * KinsokuEngine.ts
 *
 * Stone Engine Web - Kinsoku processing (line-start/end prohibitions)
 * 禁則処理エンジン
 */

import { Context } from '../core/Context';

/**
 * 禁則文字セット
 */
export class Kinsoku {
  /**
   * 行頭禁則文字（行頭に来てはいけない文字）
   * 句読点、括弧閉じ、小書き仮名など
   */
  static readonly notStartingChars = new Set([
    ' ', ',', '.', '?', ':', ';', '!', ')', '）', ']', '］', '｝', '、', '〕',
    '〉', '》', '」', '』', '】', '〙', '〗', '〟', '\u2019', '\u201D', '｠', '»',
    'ヽ', 'ヾ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ッ', 'ャ', 'ュ', 'ョ', 'ヮ',
    'ヵ', 'ヶ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'っ', 'ゃ', 'ゅ', 'ょ', 'ゎ',
    'ゕ', 'ゖ', 'ㇰ', 'ㇱ', 'ㇲ', 'ㇳ', 'ㇴ', 'ㇵ', 'ㇶ', 'ㇷ', 'ㇸ', 'ㇹ',
    'ㇺ', 'ㇻ', 'ㇼ', 'ㇽ', 'ㇾ', 'ㇿ', '々', '〻', '？', '!', '‼', '⁇',
    '⁈', '⁉', '。', '.', '™',
  ]);

  /**
   * 行末禁則文字（行末に来てはいけない文字）
   * 括弧開きなど
   */
  static readonly notEndingChars = new Set([
    '(', '（', '[', '［', '｛', '〔', '〈', '《', '「', '『', '【', '〘',
    '〖', '〝', '\u2018', '\u201C', '｟', '«', '\u0022', '\u0027',
  ]);

  /**
   * ぶら下げ文字（行末からはみ出してもよい文字）
   */
  static readonly hangingChars = new Set(['、', '。']);

  /**
   * 文字が行頭禁則文字かチェック
   */
  static isNotStarting(char: string): boolean {
    return this.notStartingChars.has(char);
  }

  /**
   * 文字が行末禁則文字かチェック
   */
  static isNotEnding(char: string): boolean {
    return this.notEndingChars.has(char);
  }

  /**
   * 文字がぶら下げ可能かチェック
   */
  static isHanging(char: string): boolean {
    return this.hangingChars.has(char);
  }
}

/**
 * 禁則処理エンジン
 */
export class KinsokuEngine {
  constructor(private context: Context) {}

  /**
   * 禁則処理を適用
   * 行末の文字が行末禁則または次の行頭が行頭禁則の場合、
   * 単語単位で前の行に戻す
   *
   * @param lineStartRunId 現在の行の開始Run ID
   * @param runId 現在のRun ID（行末の文字）
   * @returns 調整後のRun ID
   */
  process(lineStartRunId: number, runId: number): number {
    // 禁則処理が無効の場合はスキップ
    if (!this.context.isKinsokuAvailable) {
      return runId;
    }

    // 改行の場合はスキップ
    if (runId < this.context.runs.length) {
      const run = this.context.runs[runId];
      if (run.char === '\n') {
        return runId;
      }
    }

    let adjustedRunId = runId;

    // 禁則処理ループ
    while (adjustedRunId > lineStartRunId) {
      // 行末の文字と次の行頭の文字を取得
      const endRun = adjustedRunId < this.context.runs.length ? this.context.runs[adjustedRunId] : null;
      const nextStartRun =
        adjustedRunId + 1 < this.context.runs.length ? this.context.runs[adjustedRunId + 1] : null;

      // 行末禁則チェック
      if (endRun && Kinsoku.isNotEnding(endRun.char)) {
        adjustedRunId = this.decreaseRunId(adjustedRunId, lineStartRunId);
        continue;
      }

      // 行頭禁則チェック
      if (nextStartRun && Kinsoku.isNotStarting(nextStartRun.char)) {
        adjustedRunId = this.decreaseRunId(adjustedRunId, lineStartRunId);
        continue;
      }

      // 禁則に該当しない場合は終了
      break;
    }

    return adjustedRunId;
  }

  /**
   * Run IDを単語単位で減らす
   *
   * @param runId 現在のRun ID
   * @param lineStartRunId 行の開始Run ID
   * @returns 調整後のRun ID
   */
  private decreaseRunId(runId: number, lineStartRunId: number): number {
    if (runId <= 0) {
      return runId;
    }

    // 前の文字のtoken IDを取得
    const tokenId = this.context.runs[runId - 1].tokenId;
    const token = this.context.tokens[tokenId];

    // トークンの先頭のRun IDを取得
    const firstRunId = token.runIds.length > 0 ? token.runIds[0] : runId;

    // トークンの先頭までRun IDを戻す
    const newRunId = Math.max(lineStartRunId, firstRunId);

    return newRunId;
  }
}
