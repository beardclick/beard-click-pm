'use client';

import { alpha, createTheme } from '@mui/material/styles';

export type AppThemeMode = 'light' | 'dark';

export function getAppTheme(mode: AppThemeMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#60a5fa' : '#2563eb',
        light: isDark ? alpha('#60a5fa', 0.16) : '#eff6ff',
        dark: isDark ? '#bfdbfe' : '#1d4ed8',
      },
      secondary: {
        main: isDark ? '#f59e0b' : '#d97706',
      },
      background: {
        default: isDark ? '#0b1220' : '#f9fafb',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f3f4f6' : '#111827',
        secondary: isDark ? '#9ca3af' : '#6b7280',
      },
      divider: isDark ? '#243041' : '#e5e7eb',
      error: {
        main: isDark ? '#f87171' : '#dc2626',
      },
      success: {
        main: isDark ? '#4ade80' : '#16a34a',
      },
      warning: {
        main: isDark ? '#fbbf24' : '#d97706',
      },
      action: {
        hover: isDark ? alpha('#ffffff', 0.06) : '#f3f4f6',
        selected: isDark ? alpha('#60a5fa', 0.16) : alpha('#2563eb', 0.08),
      },
    },
    typography: {
      fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.2s ease, color 0.2s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 10px 30px rgb(0 0 0 / 0.35)'
              : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${isDark ? '#243041' : '#e5e7eb'}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0f172a' : '#f9fafb',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            color: isDark ? '#9ca3af' : '#6b7280',
            fontSize: '0.8125rem',
          },
        },
      },
      MuiTableSortLabel: {
        styleOverrides: {
          icon: {
            opacity: '0.5 !important',
          },
          root: {
            '&.Mui-active .MuiTableSortLabel-icon': {
              opacity: '1 !important',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}
