/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  /**
   * Start measuring performance for a given operation
   */
  static start(label: string): void {
    this.measurements.set(label, performance.now());
  }

  /**
   * End measurement and log the duration
   */
  static end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`No start time found for measurement: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);

    this.measurements.delete(label);
    return duration;
  }

  /**
   * Measure component render time
   */
  static measureComponent(componentName: string, renderFn: () => any) {
    this.start(`${componentName} render`);
    const result = renderFn();
    this.end(`${componentName} render`);
    return result;
  }

  /**
   * Measure async operations
   */
  static async measureAsync<T>(
    label: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.start(label);
    try {
      const result = await operation();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * Get memory usage information
   */
  static getMemoryUsage() {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100,
        total: Math.round((memory.totalJSHeapSize / 1048576) * 100) / 100,
        limit: Math.round((memory.jsHeapSizeLimit / 1048576) * 100) / 100,
      };
    }
    return null;
  }

  /**
   * Log current memory usage
   */
  static logMemoryUsage(label?: string) {
    const memory = this.getMemoryUsage();
    if (memory) {
      console.log(
        `🧠 Memory${label ? ` (${label})` : ""}: ${memory.used}MB used / ${memory.total}MB total`
      );
    }
  }
}

/**
 * React Hook for performance monitoring
 */
import { useEffect, useRef } from "react";

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();

    return () => {
      const unmountTime = performance.now();
      const lifeTime = unmountTime - mountTime.current;
      console.log(
        `📊 ${componentName} lifetime: ${lifeTime.toFixed(2)}ms (${renderCount.current} renders)`
      );
    };
  }, [componentName]);

  useEffect(() => {
    renderCount.current += 1;
    if (renderCount.current > 10) {
      console.warn(
        `⚠️ ${componentName} has rendered ${renderCount.current} times - consider optimization`
      );
    }
  });

  return {
    renderCount: renderCount.current,
    measureRender: (fn: () => any) =>
      PerformanceMonitor.measureComponent(componentName, fn),
  };
};

export default PerformanceMonitor;
