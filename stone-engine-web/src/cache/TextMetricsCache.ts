/**
 * TextMetricsCache.ts
 *
 * TextMetricsのキャッシュ
 * Parser.tsでの文字幅測定を高速化
 */

export interface CachedMetrics {
  width: number;
  actualBoundingBoxLeft: number;
  actualBoundingBoxRight: number;
  actualBoundingBoxAscent: number;
  actualBoundingBoxDescent: number;
}

/**
 * TextMetricsキャッシュ
 */
export class TextMetricsCache {
  private cache: Map<string, CachedMetrics> = new Map();
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * キャッシュキーを生成
   */
  private getCacheKey(char: string, fontFamily: string, fontSize: number): string {
    return `${char}|${fontFamily}|${fontSize}`;
  }

  /**
   * TextMetricsを取得（キャッシュから、またはCanvas測定）
   */
  measureText(char: string, fontFamily: string, fontSize: number): CachedMetrics {
    const key = this.getCacheKey(char, fontFamily, fontSize);

    // キャッシュヒット
    if (this.cache.has(key)) {
      this.hitCount++;
      return this.cache.get(key)!;
    }

    // キャッシュミス: 実際に測定
    this.missCount++;
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = this.ctx.measureText(char);

    const cachedMetrics: CachedMetrics = {
      width: metrics.width,
      actualBoundingBoxLeft: metrics.actualBoundingBoxLeft,
      actualBoundingBoxRight: metrics.actualBoundingBoxRight,
      actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
      actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
    };

    this.cache.set(key, cachedMetrics);
    return cachedMetrics;
  }

  /**
   * キャッシュサイズを取得
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * ヒット率を取得
   */
  getHitRate(): number {
    const total = this.hitCount + this.missCount;
    if (total === 0) {
      return 0;
    }

    return this.hitCount / total;
  }

  /**
   * 統計情報を取得
   */
  getStats(): { size: number; hitCount: number; missCount: number; hitRate: number } {
    return {
      size: this.getSize(),
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.getHitRate(),
    };
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * 統計情報をリセット（キャッシュは保持）
   */
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }
}

/**
 * グローバルなTextMetricsキャッシュインスタンス
 */
export const globalTextMetricsCache = new TextMetricsCache();
