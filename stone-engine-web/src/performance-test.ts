/**
 * performance-test.ts
 *
 * Phase 4: パフォーマンステストスクリプト
 */

import { StoneLabel, globalTextMetricsCache } from './index';

// サンプルテキスト
const sampleText = '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。';

/**
 * テキストを指定文字数に拡張
 */
function generateText(charCount: number): string {
  let text = '';
  while (text.length < charCount) {
    text += sampleText;
  }
  return text.substring(0, charCount);
}

/**
 * 結果のフォーマット
 */
function formatTime(ms: number): string {
  if (ms < 1) {
    return `${ms.toFixed(3)}ms`;
  } else if (ms < 10) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${ms.toFixed(1)}ms`;
  }
}

/**
 * 評価の判定
 */
function getEvaluation(totalMs: number, charCount: number): { class: string; text: string } {
  const target = charCount === 1000 ? 50 : (charCount / 1000) * 50;

  if (totalMs < target * 0.7) {
    return { class: 'metric-good', text: '✅ 優秀' };
  } else if (totalMs < target) {
    return { class: 'metric-good', text: '✓ 合格' };
  } else if (totalMs < target * 1.5) {
    return { class: 'metric-warn', text: '△ 要改善' };
  } else {
    return { class: 'metric-bad', text: '✗ 不合格' };
  }
}

/**
 * テスト1: 文字数別パフォーマンス
 */
(window as any).runCharCountTest = async () => {
  const select = document.getElementById('text-size') as HTMLSelectElement;
  const charCount = parseInt(select.value);

  const text = generateText(charCount);
  const canvas = document.getElementById('test1-canvas') as HTMLCanvasElement;
  canvas.style.display = 'block';

  // キャッシュをクリア（公平な測定のため）
  globalTextMetricsCache.clear();

  // テスト実行
  const label = new StoneLabel({
    width: canvas.width,
    height: canvas.height,
    fontSize: 16,
    lineHeight: 1.8,
    enablePerformanceMonitoring: true,
  });

  label.setText(text);
  label.render(canvas);

  // 結果を取得
  const monitor = label.getPerformanceMonitor()!;
  const parseTime = monitor.getLast('parse');
  const layoutTime = monitor.getLast('layout');
  const renderTime = monitor.getLast('render');
  const totalTime = parseTime + layoutTime + renderTime;

  // 結果を表示
  const resultsDiv = document.getElementById('test1-results')!;
  resultsDiv.style.display = 'block';

  const tbody = document.getElementById('test1-tbody')!;
  const evaluation = getEvaluation(totalTime, charCount);

  tbody.innerHTML = `
    <tr>
      <td>${charCount}文字</td>
      <td>${formatTime(parseTime)}</td>
      <td>${formatTime(layoutTime)}</td>
      <td>${formatTime(renderTime)}</td>
      <td><strong>${formatTime(totalTime)}</strong></td>
      <td class="${evaluation.class}">${evaluation.text}</td>
    </tr>
  `;
};

/**
 * テスト2: キャッシュ効果の検証
 */
(window as any).runCacheTest = async () => {
  const text = generateText(1000);
  const canvas = document.getElementById('test2-canvas') as HTMLCanvasElement;
  canvas.style.display = 'block';

  // 1回目: キャッシュクリア後（コールド）
  globalTextMetricsCache.clear();

  const label1 = new StoneLabel({
    width: canvas.width,
    height: canvas.height,
    fontSize: 16,
    lineHeight: 1.8,
    enablePerformanceMonitoring: true,
  });

  const start1 = performance.now();
  label1.setText(text);
  const end1 = performance.now();
  const coldTime = end1 - start1;

  // 2回目: キャッシュあり（ウォーム）
  const label2 = new StoneLabel({
    width: canvas.width,
    height: canvas.height,
    fontSize: 16,
    lineHeight: 1.8,
    enablePerformanceMonitoring: true,
  });

  const start2 = performance.now();
  label2.setText(text);
  const end2 = performance.now();
  const warmTime = end2 - start2;

  // キャッシュ統計を取得
  const cacheStats = globalTextMetricsCache.getStats();
  const hitRate = cacheStats.hitRate * 100;
  const speedup = coldTime / warmTime;

  // 結果を表示
  label2.render(canvas);

  const statsDiv = document.getElementById('cache-stats')!;
  statsDiv.style.display = 'grid';

  document.getElementById('cache-cold-time')!.textContent = formatTime(coldTime);
  document.getElementById('cache-warm-time')!.textContent = formatTime(warmTime);
  document.getElementById('cache-speedup')!.textContent = speedup.toFixed(2);
  document.getElementById('cache-hit-rate')!.textContent = hitRate.toFixed(1);
};

/**
 * テスト3: 連続レンダリングベンチマーク
 */
(window as any).runRepeatTest = async () => {
  const repeatInput = document.getElementById('repeat-count') as HTMLInputElement;
  const repeatCount = parseInt(repeatInput.value);
  const button = document.getElementById('repeat-btn') as HTMLButtonElement;
  const progressBar = document.getElementById('repeat-progress') as HTMLDivElement;

  button.disabled = true;

  const text = generateText(1000);
  const canvas = document.getElementById('test3-canvas') as HTMLCanvasElement;
  canvas.style.display = 'block';

  // 初回実行（キャッシュウォームアップ）
  globalTextMetricsCache.clear();
  const warmupLabel = new StoneLabel({
    width: canvas.width,
    height: canvas.height,
    fontSize: 16,
    lineHeight: 1.8,
  });
  warmupLabel.setText(text);
  warmupLabel.render(canvas);

  // 連続実行
  const times: number[] = [];

  for (let i = 0; i < repeatCount; i++) {
    const label = new StoneLabel({
      width: canvas.width,
      height: canvas.height,
      fontSize: 16,
      lineHeight: 1.8,
      enablePerformanceMonitoring: true,
    });

    const start = performance.now();
    label.setText(text);
    label.render(canvas);
    const end = performance.now();

    times.push(end - start);

    // 進捗更新
    progressBar.style.width = `${((i + 1) / repeatCount) * 100}%`;

    // UIをブロックしないように少し待つ
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // 統計計算
  const sum = times.reduce((acc, val) => acc + val, 0);
  const avg = sum / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const variance = times.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / times.length;
  const std = Math.sqrt(variance);

  // 結果を表示
  const statsDiv = document.getElementById('repeat-stats')!;
  statsDiv.style.display = 'grid';

  document.getElementById('repeat-avg')!.textContent = formatTime(avg);
  document.getElementById('repeat-min')!.textContent = formatTime(min);
  document.getElementById('repeat-max')!.textContent = formatTime(max);
  document.getElementById('repeat-std')!.textContent = formatTime(std);

  button.disabled = false;
  progressBar.style.width = '0%';
};

/**
 * テスト4: 総合ベンチマーク
 */
(window as any).runAllTests = async () => {
  const button = document.getElementById('all-tests-btn') as HTMLButtonElement;
  const logDiv = document.getElementById('benchmark-log')!;
  logDiv.style.display = 'block';
  logDiv.innerHTML = '';

  button.disabled = true;

  const log = (message: string, type: string = 'info') => {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
  };

  log('=== 総合ベンチマーク開始 ===', 'info');
  log('');

  // テスト1: 文字数別
  log('テスト1: 文字数別パフォーマンス', 'info');
  for (const charCount of [100, 500, 1000, 2000, 5000]) {
    globalTextMetricsCache.clear();

    const text = generateText(charCount);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;

    const label = new StoneLabel({
      width: canvas.width,
      height: canvas.height,
      fontSize: 16,
      lineHeight: 1.8,
      enablePerformanceMonitoring: true,
    });

    label.setText(text);
    label.render(canvas);

    const monitor = label.getPerformanceMonitor()!;
    const totalTime = monitor.getLast('parse') + monitor.getLast('layout') + monitor.getLast('render');
    const evaluation = getEvaluation(totalTime, charCount);

    log(`  ${charCount}文字: ${formatTime(totalTime)} - ${evaluation.text}`, evaluation.class === 'metric-good' ? 'success' : (evaluation.class === 'metric-warn' ? 'warn' : 'error'));
  }

  log('');

  // テスト2: キャッシュ効果
  log('テスト2: キャッシュ効果の検証', 'info');
  globalTextMetricsCache.clear();

  const text1000 = generateText(1000);
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;

  const start1 = performance.now();
  const label1 = new StoneLabel({ width: canvas.width, height: canvas.height });
  label1.setText(text1000);
  const end1 = performance.now();

  const start2 = performance.now();
  const label2 = new StoneLabel({ width: canvas.width, height: canvas.height });
  label2.setText(text1000);
  const end2 = performance.now();

  const speedup = (end1 - start1) / (end2 - start2);
  const hitRate = globalTextMetricsCache.getStats().hitRate * 100;

  log(`  コールド: ${formatTime(end1 - start1)}`, 'info');
  log(`  ウォーム: ${formatTime(end2 - start2)}`, 'info');
  log(`  高速化率: ${speedup.toFixed(2)}x`, speedup > 1.5 ? 'success' : 'warn');
  log(`  ヒット率: ${hitRate.toFixed(1)}%`, hitRate > 80 ? 'success' : 'warn');

  log('');
  log('=== 総合ベンチマーク完了 ===', 'success');

  button.disabled = false;
};
