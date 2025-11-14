/**
 * main.ts
 *
 * Stone Engine Web - Demo application
 */

import { createLabel } from './index';

// デモ1: 基本的な日本語
const canvas1 = document.getElementById('canvas1') as HTMLCanvasElement;
if (canvas1) {
  const text1 = `吾輩は猫である。名前はまだ無い。

どこで生れたかとんと見当がつかぬ。
何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。

吾輩はここで始めて人間というものを見た。`;

  createLabel(canvas1, text1, {
    fontSize: 18,
    lineHeight: 1.8,
  });
}

// デモ2: 日本語とLatin混在
const canvas2 = document.getElementById('canvas2') as HTMLCanvasElement;
if (canvas2) {
  const text2 = `stone_engineは、日本語の文字組版を実現する、テキストレンダリングエンジンである。

その第一義の目的は、日本語の高度な組版を実現することである。具体的には、縦書き、禁則処理、約物処理、文字種ごとのスケーリングが挙げられる。

このMVP版では、横書き（LrTb）の基本的な日本語表示を実装しています。`;

  createLabel(canvas2, text2, {
    fontSize: 16,
    lineHeight: 1.8,
  });
}

// デモ3: ウィスキーの説明
const canvas3 = document.getElementById('canvas3') as HTMLCanvasElement;
if (canvas3) {
  const text3 = `ウイスキー（whisky, whiskey）は、蒸留酒の一つで、大麦、ライ麦、トウモロコシなどの穀物を麦芽の酵素で糖化し、これを発酵させ蒸留したものである。

「ウイスキー」という言葉は、ゲール語で「命の水」を意味する「uisce beatha（ウシュク・ベーハ）」または「uisge beatha（ウィシュケ・ベーハ）」に由来すると考えられている。

主な生産国は、スコットランド、アイルランド、アメリカ合衆国、カナダ、日本などである。`;

  createLabel(canvas3, text3, {
    fontSize: 15,
    lineHeight: 1.8,
  });
}

console.log('Stone Engine Web MVP Demo loaded!');
console.log('MVP機能: 横書き日本語、基本的なフォント選択、自動改行');
console.log('Phase 1予定: 縦書き、禁則処理、約物処理');
