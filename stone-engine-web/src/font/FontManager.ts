/**
 * FontManager.ts
 *
 * Stone Engine Web - Font management per script
 * STFontManager相当
 */

import { Script } from '../core/Types';

export class FontManager {
  /**
   * Script別のフォントマッピング
   */
  private scriptFonts: Map<Script, string> = new Map([
    [Script.Latin, 'Times New Roman, Georgia, serif'],
    [
      Script.Japanese,
      '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif',
    ],
    [
      Script.Emoji,
      'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif',
    ],
  ]);

  /**
   * Script別のフォントスケール
   * STFontManagerのscriptFontScalesと同じ
   */
  private scriptScales: Map<Script, number> = new Map([
    [Script.Latin, 0.95],
    [Script.Japanese, 1.0],
    [Script.Emoji, 1.0],
  ]);

  /**
   * Scriptからフォン トIDを取得
   * MVP: ScriptをそのままIDとして使用
   */
  getFontId(script: Script): number {
    return script as number;
  }

  /**
   * フォントIDからフォントファミリー文字列を取得
   */
  getFontFamily(fontId: number): string {
    const script = fontId as Script;
    return this.scriptFonts.get(script) || this.scriptFonts.get(Script.Latin)!;
  }

  /**
   * フォントIDからスケールを取得
   */
  getFontScale(fontId: number): number {
    const script = fontId as Script;
    return this.scriptScales.get(script) || 1.0;
  }

  /**
   * フォントファミリーを設定（カスタマイズ用）
   */
  setFontFamily(script: Script, fontFamily: string): void {
    this.scriptFonts.set(script, fontFamily);
  }

  /**
   * フォントスケールを設定（カスタマイズ用）
   */
  setFontScale(script: Script, scale: number): void {
    this.scriptScales.set(script, scale);
  }
}
