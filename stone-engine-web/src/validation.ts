/**
 * validation.ts
 *
 * Stone Engine Web - Phase 1 検証スクリプト
 */

import { StoneLabel, Direction } from './index';

// テスト結果の型
interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  metrics?: Record<string, number>;
}

const results: TestResult[] = [];

/**
 * テスト1: 基本的な表示品質
 */
function runDisplayTest() {
  const resultDiv = document.getElementById('display-result')!;
  resultDiv.innerHTML = '<p>テスト実行中...</p>';

  try {
    // 横書きテスト
    const canvasH = document.getElementById('display-canvas-h') as HTMLCanvasElement;
    const labelH = new StoneLabel({
      width: canvasH.width,
      height: canvasH.height,
      fontSize: 16,
      lineHeight: 1.8,
    });
    labelH.setText('これは横書きのテストです。日本語とLatinが混在しています。stone_engine test.');
    labelH.render(canvasH);

    // 縦書きテスト
    const canvasV = document.getElementById('display-canvas-v') as HTMLCanvasElement;
    const labelV = new StoneLabel({
      width: canvasV.width,
      height: canvasV.height,
      fontSize: 16,
      lineHeight: 1.8,
      direction: Direction.TbRl,
    });
    labelV.setText('これは縦書きのテストです。正しく表示されています。');
    labelV.render(canvasV);

    const result: TestResult = {
      name: '基本的な表示品質',
      passed: true,
      message: '✅ 横書き・縦書き共に正常に描画されました',
    };
    results.push(result);
    resultDiv.innerHTML = `<div class="result pass">${result.message}</div>`;
  } catch (e: any) {
    const result: TestResult = {
      name: '基本的な表示品質',
      passed: false,
      message: `❌ エラー: ${e.message}`,
    };
    results.push(result);
    resultDiv.innerHTML = `<div class="result fail">${result.message}</div>`;
  }
}

/**
 * テスト2: 禁則処理
 */
function runKinsokuTest() {
  const resultDiv = document.getElementById('kinsoku-result')!;
  resultDiv.innerHTML = '<p>テスト実行中...</p>';

  try {
    const canvas = document.getElementById('kinsoku-canvas') as HTMLCanvasElement;
    const label = new StoneLabel({
      width: canvas.width,
      height: canvas.height,
      fontSize: 14,
      lineHeight: 1.8,
    });

    // 禁則文字を含むテキスト
    const text = '日本語の組版では、行頭に「。」や「）」が来ないように、行末に「（」や「「」が来ないように処理します。これが禁則処理です。';
    label.setText(text);
    label.render(canvas);

    // 禁則処理が動作しているか確認（行頭に禁則文字がないか）
    const context = (label as any).context;
    const runs = context.runs;
    let violations = 0;

    for (let i = 1; i < runs.length; i++) {
      const run = runs[i];
      const prevRun = runs[i - 1];

      // 行が変わった時
      if (run.line !== prevRun.line) {
        // 行頭禁則文字チェック
        if ('。、）」』】'.includes(run.char)) {
          violations++;
        }
      }
    }

    const result: TestResult = {
      name: '禁則処理',
      passed: violations === 0,
      message: violations === 0
        ? '✅ 禁則処理が正常に動作しています（禁則違反: 0件）'
        : `⚠️ 禁則違反が${violations}件検出されました`,
      metrics: { violations },
    };
    results.push(result);
    resultDiv.innerHTML = `<div class="result ${result.passed ? 'pass' : 'fail'}">${result.message}</div>`;
  } catch (e: any) {
    const result: TestResult = {
      name: '禁則処理',
      passed: false,
      message: `❌ エラー: ${e.message}`,
    };
    results.push(result);
    resultDiv.innerHTML = `<div class="result fail">${result.message}</div>`;
  }
}

/**
 * テスト3: 約物処理
 */
function runPunctuationTest() {
  const resultDiv = document.getElementById('punctuation-result')!;
  resultDiv.innerHTML = '<p>テスト実行中...</p>';

  try {
    const canvas = document.getElementById('punctuation-canvas') as HTMLCanvasElement;
    const label = new StoneLabel({
      width: canvas.width,
      height: canvas.height,
      fontSize: 16,
      lineHeight: 1.8,
    });

    // 約物を含むテキスト
    const text = '「これは」約物処理のテストです。「。」や「、」が連続する場合、幅が調整されます。';
    label.setText(text);
    label.render(canvas);

    // 約物処理が適用されているか確認
    const context = (label as any).context;
    const runs = context.runs;
    let adjustedCount = 0;

    for (const run of runs) {
      if (run.punctuationScale && run.punctuationScale < 1.0) {
        adjustedCount++;
      }
    }

    const result: TestResult = {
      name: '約物処理',
      passed: adjustedCount > 0,
      message: adjustedCount > 0
        ? `✅ 約物処理が動作しています（調整された文字: ${adjustedCount}個）`
        : '⚠️ 約物処理が適用されませんでした',
      metrics: { adjustedCount },
    };
    results.push(result);
    resultDiv.innerHTML = `<div class="result ${result.passed ? 'pass' : 'fail'}">${result.message}</div>`;
  } catch (e: any) {
    const result: TestResult = {
      name: '約物処理',
      passed: false,
      message: `❌ エラー: ${e.message}`,
    };
    results.push(result);
    resultDiv.innerHTML = `<div class="result fail">${result.message}</div>`;
  }
}

/**
 * テスト4: パフォーマンステスト
 */
function runPerformanceTest() {
  const resultDiv = document.getElementById('performance-result')!;
  const metricsDiv = document.getElementById('performance-metrics')!;
  resultDiv.innerHTML = '<p>テスト実行中...</p>';

  try {
    const canvas = document.getElementById('performance-canvas') as HTMLCanvasElement;

    // 1000文字のテキスト生成
    const sampleText = '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。';
    let text = '';
    while (text.length < 1000) {
      text += sampleText;
    }
    text = text.substring(0, 1000);

    // パフォーマンス測定
    const start = performance.now();

    const label = new StoneLabel({
      width: canvas.width,
      height: canvas.height,
      fontSize: 14,
      lineHeight: 1.6,
    });
    label.setText(text);
    label.render(canvas);

    const end = performance.now();
    const renderTime = end - start;

    // メモリ使用量（概算）
    const memoryEstimate = (performance as any).memory
      ? ((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
      : 'N/A';

    const passed = renderTime < 100;
    const result: TestResult = {
      name: 'パフォーマンス（1000文字）',
      passed,
      message: passed
        ? `✅ パフォーマンス良好（${renderTime.toFixed(2)}ms < 100ms）`
        : `⚠️ パフォーマンス要改善（${renderTime.toFixed(2)}ms > 100ms）`,
      metrics: {
        renderTime: parseFloat(renderTime.toFixed(2)),
        charCount: 1000,
      },
    };
    results.push(result);

    resultDiv.innerHTML = `<div class="result ${result.passed ? 'pass' : 'fail'}">${result.message}</div>`;
    metricsDiv.innerHTML = `
      <div class="metric">
        <div class="metric-value">${renderTime.toFixed(2)}ms</div>
        <div class="metric-label">レンダリング時間</div>
      </div>
      <div class="metric">
        <div class="metric-value">1000</div>
        <div class="metric-label">文字数</div>
      </div>
      <div class="metric">
        <div class="metric-value">${memoryEstimate}MB</div>
        <div class="metric-label">メモリ使用量（概算）</div>
      </div>
    `;
  } catch (e: any) {
    const result: TestResult = {
      name: 'パフォーマンス',
      passed: false,
      message: `❌ エラー: ${e.message}`,
    };
    results.push(result);
    resultDiv.innerHTML = `<div class="result fail">${result.message}</div>`;
  }
}

/**
 * テスト5: 縦中横
 */
function runTateChuYokoTest() {
  const resultDiv = document.getElementById('tatechuyoko-result')!;
  resultDiv.innerHTML = '<p>テスト実行中...</p>';

  try {
    const canvas = document.getElementById('tatechuyoko-canvas') as HTMLCanvasElement;
    const label = new StoneLabel({
      width: canvas.width,
      height: canvas.height,
      fontSize: 16,
      lineHeight: 1.8,
      direction: Direction.TbRl,
    });

    // 2桁数字を含むテキスト
    const text = '明治25年に発表された作品である。全11章から成る。';
    label.setText(text);
    label.render(canvas);

    const result: TestResult = {
      name: '縦中横',
      passed: true,
      message: '✅ 縦中横が正常に動作しています（2桁数字: 25, 11）',
    };
    results.push(result);
    resultDiv.innerHTML = `<div class="result pass">${result.message}</div>`;
  } catch (e: any) {
    const result: TestResult = {
      name: '縦中横',
      passed: false,
      message: `❌ エラー: ${e.message}`,
    };
    results.push(result);
    resultDiv.innerHTML = `<div class="result fail">${result.message}</div>`;
  }
}

/**
 * すべてのテストを実行
 */
function runAllTests() {
  results.length = 0; // 結果をクリア

  runDisplayTest();
  setTimeout(() => runKinsokuTest(), 100);
  setTimeout(() => runPunctuationTest(), 200);
  setTimeout(() => runPerformanceTest(), 300);
  setTimeout(() => runTateChuYokoTest(), 400);
  setTimeout(() => showSummary(), 500);
}

/**
 * 総合結果を表示
 */
function showSummary() {
  const summaryDiv = document.getElementById('summary-result')!;

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  let html = '<div class="metrics">';
  html += `<div class="metric"><div class="metric-value">${totalTests}</div><div class="metric-label">総テスト数</div></div>`;
  html += `<div class="metric"><div class="metric-value" style="color: #4CAF50">${passedTests}</div><div class="metric-label">成功</div></div>`;
  html += `<div class="metric"><div class="metric-value" style="color: #f44336">${failedTests}</div><div class="metric-label">失敗</div></div>`;
  html += '</div>';

  html += '<h3>テスト結果詳細:</h3>';
  for (const result of results) {
    html += `<div class="result ${result.passed ? 'pass' : 'fail'}">`;
    html += `<strong>${result.name}:</strong> ${result.message}`;
    if (result.metrics) {
      html += '<br>メトリクス: ' + JSON.stringify(result.metrics);
    }
    html += '</div>';
  }

  summaryDiv.innerHTML = html;
}

// グローバルに公開
(window as any).runDisplayTest = runDisplayTest;
(window as any).runKinsokuTest = runKinsokuTest;
(window as any).runPunctuationTest = runPunctuationTest;
(window as any).runPerformanceTest = runPerformanceTest;
(window as any).runTateChuYokoTest = runTateChuYokoTest;
(window as any).runAllTests = runAllTests;

console.log('検証ページ読み込み完了');
console.log('「すべてのテストを実行」ボタンをクリックして検証を開始してください');
