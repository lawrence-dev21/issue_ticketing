
// Utility functions for localStorage (can be expanded)

export const loadState = <T,>(key: string): T | undefined => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState) as T;
  } catch (error) {
    console.warn(`Error loading state for key "${key}" from localStorage:`, error);
    return undefined;
  }
};

export const saveState = <T,>(key: string, state: T): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.warn(`Error saving state for key "${key}" to localStorage:`, error);
  }
};

// This file is currently not heavily used as DataContext handles its own localStorage logic.
// It's included as a good practice for potential future expansion or refactoring.
