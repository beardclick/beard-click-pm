'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppThemeMode, getAppTheme } from '@/lib/theme';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';

interface ThemeModeContextValue {
  mode: AppThemeMode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'beardclick-theme-mode';

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used inside ThemeRegistry.');
  }

  return context;
}

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const savedMode = window.localStorage.getItem(STORAGE_KEY) as AppThemeMode | null;

    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((currentMode) => {
          const nextMode = currentMode === 'light' ? 'dark' : 'light';
          window.localStorage.setItem(STORAGE_KEY, nextMode);
          return nextMode;
        });
      },
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <CssBaseline />
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

