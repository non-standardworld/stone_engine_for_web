/**
 * PerformanceMonitor.ts
 *
 * パフォーマンス計測ユーティリティ
 */

export interface PerformanceMetrics {
  parseTime: number;
  layoutTime: number;
  renderTime: number;
  totalTime: number;
  runCount: number;
  fps?: number;
}

/**
 * パフォーマンスモニター
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  /**
   * 計測開始
   */
  start(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  /**
   * 計測終了
   */
  end(label: string): number {
    const startTime = this.startTimes.get(label);
    if (startTime === undefined) {
      console.warn(`PerformanceMonitor: No start time for label "${label}"`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 履歴に追加
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);

    this.startTimes.delete(label);
    return duration;
  }

  /**
   * 平均時間を取得
   */
  getAverage(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) {
      return 0;
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * 最小時間を取得
   */
  getMin(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) {
      return 0;
    }

    return Math.min(...values);
  }

  /**
   * 最大時間を取得
   */
  getMax(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) {
      return 0;
    }

    return Math.max(...values);
  }

  /**
   * 最新の計測値を取得
   */
  getLast(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) {
      return 0;
    }

    return values[values.length - 1];
  }

  /**
   * すべてのメトリクスを取得
   */
  getAllMetrics(): Record<string, { avg: number; min: number; max: number; last: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; last: number; count: number }> = {};

    for (const [label, values] of this.metrics.entries()) {
      result[label] = {
        avg: this.getAverage(label),
        min: this.getMin(label),
        max: this.getMax(label),
        last: this.getLast(label),
        count: values.length,
      };
    }

    return result;
  }

  /**
   * メトリクスをクリア
   */
  clear(label?: string): void {
    if (label) {
      this.metrics.delete(label);
      this.startTimes.delete(label);
    } else {
      this.metrics.clear();
      this.startTimes.clear();
    }
  }

  /**
   * メトリクスをコンソールに出力
   */
  log(label?: string): void {
    if (label) {
      const values = this.metrics.get(label);
      if (!values) {
        console.log(`PerformanceMonitor: No metrics for label "${label}"`);
        return;
      }

      console.log(`[${label}]`, {
        avg: this.getAverage(label).toFixed(2) + 'ms',
        min: this.getMin(label).toFixed(2) + 'ms',
        max: this.getMax(label).toFixed(2) + 'ms',
        last: this.getLast(label).toFixed(2) + 'ms',
        count: values.length,
      });
    } else {
      console.log('=== Performance Metrics ===');
      const allMetrics = this.getAllMetrics();
      for (const [key, value] of Object.entries(allMetrics)) {
        console.log(`[${key}]`, {
          avg: value.avg.toFixed(2) + 'ms',
          min: value.min.toFixed(2) + 'ms',
          max: value.max.toFixed(2) + 'ms',
          last: value.last.toFixed(2) + 'ms',
          count: value.count,
        });
      }
    }
  }

  /**
   * FPS計測用のヘルパー
   */
  static createFPSMonitor(): { update: () => number; getFPS: () => number } {
    let lastTime = performance.now();
    let fps = 0;
    const fpsHistory: number[] = [];
    const historySize = 60;

    return {
      update(): number {
        const now = performance.now();
        const delta = now - lastTime;
        lastTime = now;

        fps = 1000 / delta;
        fpsHistory.push(fps);

        if (fpsHistory.length > historySize) {
          fpsHistory.shift();
        }

        return fps;
      },

      getFPS(): number {
        if (fpsHistory.length === 0) {
          return 0;
        }

        const sum = fpsHistory.reduce((acc, val) => acc + val, 0);
        return sum / fpsHistory.length;
      },
    };
  }
}

/**
 * グローバルなパフォーマンスモニターインスタンス
 */
export const globalPerformanceMonitor = new PerformanceMonitor();
