/**
 * UnicodeUtils.ts
 *
 * Stone Engine Web - Unicode character classification
 * STObject.swiftのUnicode分類機能を移植
 */

import { Script } from '../core/Types';

export class UnicodeUtils {
  /**
   * 主要なUnicode範囲定義（MVPスコープ）
   */
  static readonly RANGES = {
    // Latin
    BasicLatin: { start: 0x0020, end: 0x007F },
    LatinExtendedA: { start: 0x0100, end: 0x017F },
    LatinExtendedB: { start: 0x0180, end: 0x024F },

    // Japanese
    Hiragana: { start: 0x3040, end: 0x309F },
    Katakana: { start: 0x30A0, end: 0x30FF },
    KatakanaPhoneticExtensions: { start: 0x31F0, end: 0x31FF },
    CJKUnified: { start: 0x4E00, end: 0x9FFF },
    CJKCompatibility: { start: 0x3300, end: 0x33FF },

    // Emoji
    Emoticons: { start: 0x1F600, end: 0x1F64F },
    MiscSymbols: { start: 0x1F300, end: 0x1F5FF },
    Dingbats: { start: 0x2700, end: 0x27BF },
  };

  /**
   * 文字からScriptを判定
   */
  static getScript(char: string): Script {
    const codePoint = char.codePointAt(0);
    if (!codePoint) return Script.Latin;

    // Hiragana/Katakana/Kanji → Japanese
    if (
      this.inRange(codePoint, this.RANGES.Hiragana) ||
      this.inRange(codePoint, this.RANGES.Katakana) ||
      this.inRange(codePoint, this.RANGES.KatakanaPhoneticExtensions) ||
      this.inRange(codePoint, this.RANGES.CJKUnified) ||
      this.inRange(codePoint, this.RANGES.CJKCompatibility)
    ) {
      return Script.Japanese;
    }

    // Emoji
    if (
      this.inRange(codePoint, this.RANGES.Emoticons) ||
      this.inRange(codePoint, this.RANGES.MiscSymbols) ||
      this.inRange(codePoint, this.RANGES.Dingbats)
    ) {
      return Script.Emoji;
    }

    // Default: Latin
    return Script.Latin;
  }

  /**
   * コードポイントが指定範囲内かチェック
   */
  private static inRange(
    codePoint: number,
    range: { start: number; end: number }
  ): boolean {
    return codePoint >= range.start && codePoint <= range.end;
  }

  /**
   * 文字が改行かチェック
   */
  static isNewline(char: string): boolean {
    return char === '\n' || char === '\r' || char === '\r\n';
  }

  /**
   * 文字が空白かチェック
   */
  static isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }
}
