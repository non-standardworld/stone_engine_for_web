/**
 * TextView.ts
 *
 * Stone Engine Web - Editable Text View
 * STTextView相当の編集可能なテキストビュー
 */

import { Context } from '../core/Context';
import { Parser } from '../parser/Parser';
import { LayoutLrTb } from '../layout/LayoutLrTb';
import { LayoutTbRl } from '../layout/LayoutTbRl';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import type { Direction, TextAlign } from '../core/Types';
import { Direction as DirectionEnum } from '../core/Types';

export interface TextViewConfig {
  fontSize?: number;
  lineHeight?: number;
  direction?: Direction;
  textAlign?: TextAlign;
  width?: number;
  height?: number;
}

/**
 * 編集可能なテキストビュー
 */
export class TextView {
  private context: Context;
  private parser: Parser;
  private layoutLrTb: LayoutLrTb;
  private layoutTbRl: LayoutTbRl;
  private renderer: CanvasRenderer;

  private container: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private editable!: HTMLDivElement;

  // カーソル位置（Run配列のインデックス）
  private cursorPosition: number = 0;

  // IME変換中フラグ
  private isComposing: boolean = false;

  constructor(container: HTMLElement, config?: TextViewConfig) {
    this.container = container;
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
    this.layoutLrTb = new LayoutLrTb(this.context);
    this.layoutTbRl = new LayoutTbRl(this.context);
    this.renderer = new CanvasRenderer(this.context);

    this.setupDOM();
    this.setupEventListeners();
  }

  /**
   * DOM要素のセットアップ
   */
  private setupDOM(): void {
    // コンテナのスタイル
    this.container.style.position = 'relative';
    this.container.style.width = `${this.context.renderSize.width}px`;
    this.container.style.height = `${this.context.renderSize.height}px`;

    // Canvas (レンダリング用)
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.context.renderSize.width;
    this.canvas.height = this.context.renderSize.height;
    this.canvas.style.display = 'block';
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.cursor = 'text';
    this.container.appendChild(this.canvas);

    // contenteditable (IME用、透明)
    this.editable = document.createElement('div');
    this.editable.contentEditable = 'true';
    this.editable.style.position = 'absolute';
    this.editable.style.top = '0';
    this.editable.style.left = '0';
    this.editable.style.width = '1px';
    this.editable.style.height = '1px';
    this.editable.style.opacity = '0';
    this.editable.style.overflow = 'hidden';
    this.editable.style.whiteSpace = 'pre';
    this.editable.setAttribute('data-role', 'ime-input');
    this.container.appendChild(this.editable);
  }

  /**
   * イベントリスナーのセットアップ
   */
  private setupEventListeners(): void {
    // Canvas クリック（カーソル移動）
    this.canvas.addEventListener('click', (e: MouseEvent) => {
      this.handleClick(e);
    });

    // Canvas フォーカス時にcontenteditableにフォーカスを移す
    this.canvas.addEventListener('mousedown', () => {
      this.editable.focus();
    });

    // テキスト入力
    this.editable.addEventListener('input', (e: Event) => {
      const inputEvent = e as InputEvent;
      this.handleInput(inputEvent);
    });

    // IME変換開始
    this.editable.addEventListener('compositionstart', () => {
      this.isComposing = true;
    });

    // IME変換終了
    this.editable.addEventListener('compositionend', (e: CompositionEvent) => {
      this.isComposing = false;
      // 変換確定後のテキストを挿入
      if (e.data) {
        this.insertText(e.data);
        this.editable.textContent = '';
      }
    });

    // キーボード（削除、矢印キーなど）
    this.editable.addEventListener('keydown', (e: KeyboardEvent) => {
      this.handleKeyDown(e);
    });

    // ペースト
    this.editable.addEventListener('paste', (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        this.insertText(text);
      }
    });
  }

  /**
   * テキスト入力ハンドラ
   */
  private handleInput(_e: InputEvent): void {
    // IME変換中は処理しない
    if (this.isComposing) {
      return;
    }

    // 通常のテキスト入力（IME以外）
    const text = this.editable.textContent || '';
    if (text) {
      this.insertText(text);
      this.editable.textContent = '';
    }
  }

  /**
   * クリックハンドラ（カーソル移動）
   */
  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 最も近いRunを探す
    this.cursorPosition = this.findClosestRunIndex(x, y);
    this.render();
  }

  /**
   * キーボードハンドラ
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // IME変換中はスキップ
    if (this.isComposing) {
      return;
    }

    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        this.deleteBackward();
        break;

      case 'Delete':
        e.preventDefault();
        this.deleteForward();
        break;

      case 'ArrowLeft':
        e.preventDefault();
        this.moveCursorLeft();
        break;

      case 'ArrowRight':
        e.preventDefault();
        this.moveCursorRight();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.moveCursorUp();
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.moveCursorDown();
        break;

      case 'Home':
        e.preventDefault();
        this.moveCursorToLineStart();
        break;

      case 'End':
        e.preventDefault();
        this.moveCursorToLineEnd();
        break;

      case 'Enter':
        e.preventDefault();
        this.insertText('\n');
        break;

      default:
        // その他のキーは通常の入力として処理される
        break;
    }
  }

  /**
   * テキストを挿入
   */
  private insertText(text: string): void {
    // 現在のテキストを取得
    const currentText = this.getText();

    // カーソル位置にテキストを挿入
    const newText =
      currentText.slice(0, this.cursorPosition) +
      text +
      currentText.slice(this.cursorPosition);

    // 再パース・レイアウト
    this.setText(newText);

    // カーソルを移動
    this.cursorPosition += text.length;
    this.render();
  }

  /**
   * 前方削除（Backspace）
   */
  private deleteBackward(): void {
    if (this.cursorPosition <= 0) {
      return;
    }

    const currentText = this.getText();
    const newText =
      currentText.slice(0, this.cursorPosition - 1) +
      currentText.slice(this.cursorPosition);

    this.setText(newText);
    this.cursorPosition--;
    this.render();
  }

  /**
   * 後方削除（Delete）
   */
  private deleteForward(): void {
    const currentText = this.getText();
    if (this.cursorPosition >= currentText.length) {
      return;
    }

    const newText =
      currentText.slice(0, this.cursorPosition) +
      currentText.slice(this.cursorPosition + 1);

    this.setText(newText);
    this.render();
  }

  /**
   * カーソルを左に移動
   */
  private moveCursorLeft(): void {
    if (this.cursorPosition > 0) {
      this.cursorPosition--;
      this.render();
    }
  }

  /**
   * カーソルを右に移動
   */
  private moveCursorRight(): void {
    const currentText = this.getText();
    if (this.cursorPosition < currentText.length) {
      this.cursorPosition++;
      this.render();
    }
  }

  /**
   * カーソルを上に移動
   */
  private moveCursorUp(): void {
    if (this.context.runs.length === 0) return;

    const currentRun = this.context.runs[this.cursorPosition];
    if (!currentRun) return;

    const currentLine = currentRun.line;
    if (currentLine <= 0) return;

    // 1行上の同じX座標付近のRunを探す
    const targetLine = currentLine - 1;
    const currentX = currentRun.position.x;

    let closestIndex = this.cursorPosition;
    let minDistance = Infinity;

    for (let i = 0; i < this.context.runs.length; i++) {
      const run = this.context.runs[i];
      if (run.line === targetLine) {
        const distance = Math.abs(run.position.x - currentX);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
    }

    this.cursorPosition = closestIndex;
    this.render();
  }

  /**
   * カーソルを下に移動
   */
  private moveCursorDown(): void {
    if (this.context.runs.length === 0) return;

    const currentRun = this.context.runs[this.cursorPosition];
    if (!currentRun) return;

    const currentLine = currentRun.line;
    const maxLine = Math.max(...this.context.runs.map(r => r.line));
    if (currentLine >= maxLine) return;

    // 1行下の同じX座標付近のRunを探す
    const targetLine = currentLine + 1;
    const currentX = currentRun.position.x;

    let closestIndex = this.cursorPosition;
    let minDistance = Infinity;

    for (let i = 0; i < this.context.runs.length; i++) {
      const run = this.context.runs[i];
      if (run.line === targetLine) {
        const distance = Math.abs(run.position.x - currentX);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
    }

    this.cursorPosition = closestIndex;
    this.render();
  }

  /**
   * カーソルを行頭に移動
   */
  private moveCursorToLineStart(): void {
    if (this.context.runs.length === 0) return;

    const currentRun = this.context.runs[this.cursorPosition];
    if (!currentRun) return;

    const currentLine = currentRun.line;

    // 同じ行の最初のRunを探す
    for (let i = 0; i < this.context.runs.length; i++) {
      if (this.context.runs[i].line === currentLine) {
        this.cursorPosition = i;
        this.render();
        return;
      }
    }
  }

  /**
   * カーソルを行末に移動
   */
  private moveCursorToLineEnd(): void {
    if (this.context.runs.length === 0) return;

    const currentRun = this.context.runs[this.cursorPosition];
    if (!currentRun) return;

    const currentLine = currentRun.line;

    // 同じ行の最後のRunを探す
    let lastIndex = this.cursorPosition;
    for (let i = 0; i < this.context.runs.length; i++) {
      if (this.context.runs[i].line === currentLine) {
        lastIndex = i;
      }
    }

    this.cursorPosition = lastIndex + 1; // 行末の次（改行の後）
    this.render();
  }

  /**
   * 最も近いRunのインデックスを探す
   */
  private findClosestRunIndex(x: number, y: number): number {
    if (this.context.runs.length === 0) {
      return 0;
    }

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < this.context.runs.length; i++) {
      const run = this.context.runs[i];

      // Runの中心座標
      const centerX = run.position.x + run.frame.width / 2;
      const centerY = run.position.y - run.frame.height / 2;

      const distance = Math.hypot(centerX - x, centerY - y);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  /**
   * テキストを設定
   */
  setText(text: string): void {
    this.parser.parse(text);

    // 方向に応じてレイアウトエンジンを切り替え
    if (this.context.direction === DirectionEnum.TbRl) {
      this.layoutTbRl.layout();
    } else {
      this.layoutLrTb.layout();
    }

    // カーソル位置を調整
    this.cursorPosition = Math.min(this.cursorPosition, text.length);
  }

  /**
   * テキストを取得
   */
  getText(): string {
    return this.context.runs.map(r => r.char).join('');
  }

  /**
   * レンダリング
   */
  render(): void {
    // テキストを描画
    this.renderer.render(this.canvas);

    // カーソルを描画
    this.drawCursor();
  }

  /**
   * カーソルを描画
   */
  private drawCursor(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // カーソル位置のRunを取得
    let cursorX: number;
    let cursorY: number;
    let cursorHeight: number;

    if (this.context.runs.length === 0) {
      // テキストがない場合は左上に表示
      cursorX = 0;
      cursorY = 0;
      cursorHeight = this.context.fontSize;
    } else if (this.cursorPosition >= this.context.runs.length) {
      // 末尾の場合
      const lastRun = this.context.runs[this.context.runs.length - 1];
      if (this.context.direction === DirectionEnum.TbRl) {
        // 縦書きの場合
        cursorX = lastRun.position.x;
        cursorY = lastRun.position.y + lastRun.advance.height;
        cursorHeight = this.context.fontSize;
      } else {
        // 横書きの場合
        cursorX = lastRun.position.x + lastRun.advance.width;
        cursorY = lastRun.frame.y;
        cursorHeight = lastRun.frame.height;
      }
    } else {
      // 通常の場合
      const run = this.context.runs[this.cursorPosition];
      cursorX = run.position.x;
      cursorY = run.frame.y;
      cursorHeight = run.frame.height;
    }

    // カーソルを描画（点滅アニメーションは簡易版）
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (this.context.direction === DirectionEnum.TbRl) {
      // 縦書き: 横線カーソル
      ctx.moveTo(cursorX - this.context.fontSize / 2, cursorY);
      ctx.lineTo(cursorX + this.context.fontSize / 2, cursorY);
    } else {
      // 横書き: 縦線カーソル
      ctx.moveTo(cursorX, cursorY);
      ctx.lineTo(cursorX, cursorY + cursorHeight);
    }

    ctx.stroke();
  }

  /**
   * Contextを取得（高度な使用のため）
   */
  getContext(): Context {
    return this.context;
  }

  /**
   * カーソル位置を取得
   */
  getCursorPosition(): number {
    return this.cursorPosition;
  }

  /**
   * カーソル位置を設定
   */
  setCursorPosition(position: number): void {
    this.cursorPosition = Math.max(0, Math.min(position, this.getText().length));
    this.render();
  }

  /**
   * フォーカスを設定
   */
  focus(): void {
    this.editable.focus();
  }

  /**
   * フォーカスを解除
   */
  blur(): void {
    this.editable.blur();
  }
}
