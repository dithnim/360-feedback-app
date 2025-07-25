import { useEffect, useCallback } from "react";

/**
 * Custom hook for managing localStorage with better performance and error handling
 */
export const useLocalStorage = () => {
  const setItem = useCallback((key: string, value: any) => {
    try {
      const serializedValue =
        typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }, []);

  const getItem = useCallback((key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }, []);

  const removeItem = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }, []);

  return { setItem, getItem, removeItem, clear };
};

/**
 * Hook for batch localStorage operations to reduce performance impact
 */
export const useBatchLocalStorage = (
  data: Record<string, any>,
  dependencies: any[]
) => {
  const { setItem } = useLocalStorage();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      Object.entries(data).forEach(([key, value]) => {
        setItem(key, value);
      });
    }, 100); // Debounce localStorage writes

    return () => clearTimeout(timeoutId);
  }, dependencies);
};

export default useLocalStorage;
