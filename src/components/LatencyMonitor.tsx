'use client';

import { useEffect, useState } from 'react';

interface LatencyMetrics {
  latency: number;
  status: 'success' | 'failed';
  timestamp: string;
}

export const LatencyMonitor = () => {
  const [metrics, setMetrics] = useState<LatencyMetrics | null>(null);

  useEffect(() => {
    const checkLatency = async () => {
      const cdnUrl = 'https://cdn.xperia.pt/';
      const startTime = performance.now();

      try {
        // Ping CDN with a HEAD request (minimal payload)
        const response = await fetch(cdnUrl, {
          method: 'HEAD',
          mode: 'no-cors', // Required for cross-origin
          cache: 'no-store',
        });

        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        const data: LatencyMetrics = {
          latency,
          status: 'success',
          timestamp: new Date().toISOString(),
        };

        setMetrics(data);
        console.log(
          `%c[CDN Latency] %c${latency}ms`,
          'color: #00d4ff; font-weight: bold;',
          'color: #00ff88; font-weight: bold;'
        );
        console.log('CDN URL:', cdnUrl);
        console.log('Full metrics:', data);
      } catch (error) {
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        const data: LatencyMetrics = {
          latency,
          status: 'failed',
          timestamp: new Date().toISOString(),
        };

        setMetrics(data);
        console.error(
          `%c[CDN Latency] %cFailed after ${latency}ms`,
          'color: #ff4444; font-weight: bold;',
          'color: #ffaa44;'
        );
        console.error('Error:', error);
      }
    };

    // Check latency on mount
    checkLatency();

    // Re-check every 30 seconds
    const interval = setInterval(checkLatency, 30000);
    return () => clearInterval(interval);
  }, []);

  return null; // Silent component - only logs to console
};
