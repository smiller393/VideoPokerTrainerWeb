// Performance measurement utilities

export interface PerformanceResult {
  operation: string;
  duration: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static measurements: PerformanceResult[] = [];

  static async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    this.logMeasurement(operation, duration);
    return { result, duration };
  }

  static measure<T>(operation: string, fn: () => T): { result: T; duration: number } {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.logMeasurement(operation, duration);
    return { result, duration };
  }

  private static logMeasurement(operation: string, duration: number) {
    const measurement: PerformanceResult = {
      operation,
      duration,
      timestamp: Date.now()
    };
    
    this.measurements.push(measurement);
    
    // Keep only last 100 measurements
    if (this.measurements.length > 100) {
      this.measurements = this.measurements.slice(-100);
    }

    // Log slow operations (>100ms)
    if (duration > 100) {
      console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    } else if (duration > 50) {
      console.log(`${operation} took ${duration.toFixed(2)}ms`);
    }
  }

  static getAverageTime(operation: string): number {
    const operationMeasurements = this.measurements.filter(m => m.operation === operation);
    if (operationMeasurements.length === 0) return 0;
    
    const total = operationMeasurements.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMeasurements.length;
  }

  static getLastMeasurements(count: number = 10): PerformanceResult[] {
    return this.measurements.slice(-count);
  }

  static getAllMeasurements(): PerformanceResult[] {
    return [...this.measurements];
  }

  static clearMeasurements(): void {
    this.measurements = [];
  }
}

// Helper for React components to use performance monitoring
export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  operation: string,
  fn: T
): T => {
  return ((...args: any[]) => {
    return PerformanceMonitor.measure(operation, () => fn(...args)).result;
  }) as T;
};