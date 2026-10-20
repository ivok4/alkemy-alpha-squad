import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8',
      light: '#7dd3fc',
      dark: '#0ea5e9',
      contrastText: '#030303',
    },
    secondary: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#030303',
      paper: 'rgba(13, 17, 24, 0.92)',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#030303',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '0.01em',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
          color: '#030303',
          boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)',
            boxShadow: '0 6px 28px rgba(56, 189, 248, 0.55)',
            transform: 'translateY(-2px)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(56, 189, 248, 0.4)',
          color: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.04)',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          backgroundColor: 'rgba(13, 17, 24, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          backgroundColor: 'rgba(13, 17, 24, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(56, 189, 248, 0.25)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(8px)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.12)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(56, 189, 248, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#38bdf8',
              boxShadow: '0 0 0 3px rgba(56, 189, 248, 0.15)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#9ca3af',
          },
          '& .MuiInputBase-input': {
            color: '#f3f4f6',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(10, 14, 22, 0.96)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(10, 14, 22, 0.96) !important',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;