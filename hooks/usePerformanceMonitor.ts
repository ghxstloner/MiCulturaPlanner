import { useEffect, useRef, useState } from 'react';

/**
 * Performance Monitoring Hook - ULTRATHINK Methodology
 * 
 * Monitors app performance metrics and provides insights for optimization.
 * This follows ULTRATHINK principles by providing actionable performance data.
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    memoryUsage: 0,
    isPerformant: true,
  });

  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const maxRenderHistory = 50; // Keep last 50 render times

  // Start render timing
  const startRenderTiming = () => {
    renderStartTime.current = performance.now();
  };

  // End render timing and update metrics
  const endRenderTiming = () => {
    const renderTime = performance.now() - renderStartTime.current;
    
    renderTimes.current.push(renderTime);
    
    // Keep only recent render times
    if (renderTimes.current.length > maxRenderHistory) {
      renderTimes.current.shift();
    }

    const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;
    
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime,
      isPerformant: averageRenderTime < 16, // 60fps = 16.67ms per frame
    }));
  };

  // Monitor memory usage (if available)
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000); // Every 5 seconds
    updateMemoryUsage(); // Initial measurement

    return () => clearInterval(interval);
  }, []);

  // Performance warnings
  const getPerformanceWarnings = () => {
    const warnings: string[] = [];

    if (metrics.averageRenderTime > 16) {
      warnings.push('Render time is above 60fps threshold');
    }

    if (metrics.memoryUsage > 100) {
      warnings.push('Memory usage is high (>100MB)');
    }

    if (metrics.renderCount > 1000 && metrics.averageRenderTime > 10) {
      warnings.push('High render count with slow render times detected');
    }

    return warnings;
  };

  // Performance recommendations
  const getPerformanceRecommendations = () => {
    const recommendations: string[] = [];

    if (metrics.averageRenderTime > 16) {
      recommendations.push('Consider using React.memo() for expensive components');
      recommendations.push('Check for unnecessary re-renders');
      recommendations.push('Optimize heavy computations with useMemo()');
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push('Check for memory leaks in useEffect cleanup');
      recommendations.push('Consider image optimization');
      recommendations.push('Review large data structures');
    }

    return recommendations;
  };

  // Reset metrics
  const resetMetrics = () => {
    renderTimes.current = [];
    setMetrics({
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      memoryUsage: 0,
      isPerformant: true,
    });
  };

  return {
    metrics,
    startRenderTiming,
    endRenderTiming,
    getPerformanceWarnings,
    getPerformanceRecommendations,
    resetMetrics,
    
    // Helper methods
    isRenderingSlowly: metrics.averageRenderTime > 16,
    isMemoryUsageHigh: metrics.memoryUsage > 100,
    shouldOptimize: !metrics.isPerformant || metrics.memoryUsage > 100,
  };
};

export default usePerformanceMonitor;