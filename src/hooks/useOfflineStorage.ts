import { useState, useEffect } from 'react';

/**
 * A custom hook to persist data to localStorage while offline,
 * and simulate syncing when coming back online.
 */
export function useOfflineStorage<T>(key: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    // Detect network status
    setIsOffline(!navigator.onLine);
    
    const handleOnline = () => {
      setIsOffline(false);
      // Simulate Sync
      if (localStorage.getItem(`${key}_pending`)) {
        setTimeout(() => {
          setPendingSync(false);
          localStorage.removeItem(`${key}_pending`);
        }, 1500); // 1.5s simulated sync time
      }
    };
    
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load from storage
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
    
    if (localStorage.getItem(`${key}_pending`)) {
      setPendingSync(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(data) : value;
      setData(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // If we save while offline, mark as pending sync
      if (isOffline) {
        localStorage.setItem(`${key}_pending`, "true");
        setPendingSync(true);
      }
    } catch (error) {
      console.warn("Error setting localStorage", error);
    }
  };

  return { data, setValue, isOffline, pendingSync };
}
