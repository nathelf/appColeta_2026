import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export interface StorageQuota {
  used: number;
  total: number;
  percentage: number;
  available: number;
}

const ALERT_THRESHOLD = 80; // Alert at 80%
const DANGER_THRESHOLD = 95; // Danger at 95%

export function useStorageQuota() {
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkQuota = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const total = estimate.quota || 0;
        const percentage = total > 0 ? (used / total) * 100 : 0;
        const available = total - used;

        const quotaData: StorageQuota = {
          used,
          total,
          percentage,
          available
        };

        setQuota(quotaData);

        // Show alerts based on usage
        if (percentage >= DANGER_THRESHOLD) {
          toast({
            title: 'Armazenamento crítico',
            description: `Você está usando ${percentage.toFixed(1)}% do espaço disponível. Considere limpar dados antigos.`,
            variant: 'destructive',
          });
        } else if (percentage >= ALERT_THRESHOLD) {
          toast({
            title: 'Armazenamento alto',
            description: `Você está usando ${percentage.toFixed(1)}% do espaço disponível.`,
          });
        }
      } catch (error) {
        console.error('Erro ao verificar quota de armazenamento:', error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkQuota();
    // Check every 5 minutes
    const interval = setInterval(checkQuota, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return {
    quota,
    loading,
    checkQuota,
    formatBytes,
    isAlertLevel: quota ? quota.percentage >= ALERT_THRESHOLD : false,
    isDangerLevel: quota ? quota.percentage >= DANGER_THRESHOLD : false,
  };
}
