/**
 * main.ts
 *
 * Stone Engine Web - Comparison Demo
 */

import { StoneLabel, Direction } from './index';

/**
 * ネイティブCanvas描画（禁則処理なし）
 */
function renderNativeCanvas(canvas: HTMLCanvasElement, text: string, fontSize: number, lineHeight: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${fontSize}px "Noto Serif JP", serif`;
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';

  const lines: string[] = [];
  const paragraphs = text.split('\n');
  const lineHeightPx = fontSize * lineHeight;

  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('');
      continue;
    }

    let currentLine = '';
    for (const char of paragraph) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 20) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  let y = fontSize;
  for (const line of lines) {
    ctx.fillText(line, 10, y);
    y += lineHeightPx;
  }
}

// デモ1: 禁則処理の比較
const text1 = `日本語の組版（くみはん）では、行頭に句点（。）や閉じ括弧（）、行末に開き括弧（「）が来ないようにする「禁則処理」が重要です。`;

const nativeCanvas1 = document.getElementById('native-canvas1') as HTMLCanvasElement;
if (nativeCanvas1) {
  renderNativeCanvas(nativeCanvas1, text1, 16, 1.8);
}

const stoneCanvas1 = document.getElementById('stone-canvas1') as HTMLCanvasElement;
if (stoneCanvas1) {
  const label1 = new StoneLabel({
    width: stoneCanvas1.width,
    height: stoneCanvas1.height,
    fontSize: 16,
    lineHeight: 1.8,
  });
  label1.setText(text1);
  label1.render(stoneCanvas1);
}

// デモ2: 縦書きの比較
const text2 = `吾輩は猫である。名前はまだ無い。

どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。`;

const nativeText2 = document.getElementById('native-text2');
if (nativeText2) {
  nativeText2.textContent = text2;
}

const stoneCanvas2 = document.getElementById('stone-canvas2') as HTMLCanvasElement;
if (stoneCanvas2) {
  const label2 = new StoneLabel({
    width: stoneCanvas2.width,
    height: stoneCanvas2.height,
    fontSize: 18,
    lineHeight: 1.8,
    direction: Direction.TbRl,
  });
  label2.setText(text2);
  label2.render(stoneCanvas2);
}

// デモ3: 縦中横の比較
const text3 = `明治25年に発表された作品である。著者は夏目漱石。全11章から成る。`;

const nativeText3 = document.getElementById('native-text3');
if (nativeText3) {
  nativeText3.textContent = text3;
}

const stoneCanvas3 = document.getElementById('stone-canvas3') as HTMLCanvasElement;
if (stoneCanvas3) {
  const label3 = new StoneLabel({
    width: stoneCanvas3.width,
    height: stoneCanvas3.height,
    fontSize: 16,
    lineHeight: 1.8,
    direction: Direction.TbRl,
  });
  label3.setText(text3);
  label3.render(stoneCanvas3);
}

// デモ4: Latin文字の回転
const text4 = `stone_engineは日本語組版エンジンです。WebブラウザでCanvas APIを使って実装されています。`;

const nativeText4 = document.getElementById('native-text4');
if (nativeText4) {
  nativeText4.textContent = text4;
}

const stoneCanvas4 = document.getElementById('stone-canvas4') as HTMLCanvasElement;
if (stoneCanvas4) {
  const label4 = new StoneLabel({
    width: stoneCanvas4.width,
    height: stoneCanvas4.height,
    fontSize: 16,
    lineHeight: 1.8,
    direction: Direction.TbRl,
  });
  label4.setText(text4);
  label4.render(stoneCanvas4);
}

// デモ5: 約物処理の比較
const text5 = `「これは」テストです。「約物処理」により、「。」や「、」の幅が調整されます。`;

const nativeCanvas5 = document.getElementById('native-canvas5') as HTMLCanvasElement;
if (nativeCanvas5) {
  renderNativeCanvas(nativeCanvas5, text5, 16, 1.8);
}

const stoneCanvas5 = document.getElementById('stone-canvas5') as HTMLCanvasElement;
if (stoneCanvas5) {
  const label5 = new StoneLabel({
    width: stoneCanvas5.width,
    height: stoneCanvas5.height,
    fontSize: 16,
    lineHeight: 1.8,
    // punctuationMode: 'stone' がデフォルト
  });
  label5.setText(text5);
  label5.render(stoneCanvas5);
}

console.log('Stone Engine Web Comparison Demo loaded!');
console.log('✅ 実装済み: 横書き（LrTb）、縦書き（TbRl）、禁則処理、縦中横、Latin回転、約物処理（Stone Mode）');
console.log('📊 比較: ネイティブレンダリング vs Stone Engine Web');
