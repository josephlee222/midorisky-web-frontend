import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { grey } from '@mui/material/colors';
import { responsiveFontSizes } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { Amplify } from 'aws-amplify';

import './index.css'
import { fetchAuthSession } from 'aws-amplify/auth';

let fonts = [
  'Nunito',
  '"Nunito Sans"',
  'Roboto',
  '"Segoe UI"',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',');

// Theme for the website, configure it here
let theme = createTheme({
  palette: {
    primary: {
      main: "#44624a",
      light: "#8BA888",
      dark: "#364e3b",
      contrastText: "#ffffff",
    },
    secondary: {
      main: grey[500],
      light: grey[300],
      dark: grey[700],
    },
    yellow: {
      main: "#FDDC02",
      light: "#fde45f",
      dark: "#7e6e01",
      contrastText: "#000000",
    },
    white: {
      main: "#ffffff",
      light: "#ffffff",
      dark: "#ffffff",
      contrastText: "#000000",
    },
    appGrey: {
      main: "#EEEEEE",
      light: "#ffffff",
      dark: "#bcbcbc",
      contrastText: "#000000",
    },
    background: {
      paper: "#EEEEEE",
    }
  },
  typography: {
    fontFamily: fonts,
    "fontWeightLight": 300,
    "fontWeightRegular": 400,
    "fontWeightMedium": 500,
    "fontWeightBold": 700,
  },
  components: {
    MuiTypography: {
      defaultProps: {
        fontFamily: fonts,
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      }
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'secondary' },
          style: {
            color: "#44624a",
            backgroundColor: "#44624a32",
            '&:hover': {
              backgroundColor: "#44624a80",
            },
            backdropFilter: "blur(10px)",
          },
        },
      ]
    },
    MuiDialogTitle: {
      defaultProps: {
        style: {
          fontWeight: 700,
        }
      }
    },
    MuiPaper: {
      variants: [
        {
          props: { variant: 'draggable' },
          style: {
            backgroundColor: "#ffffff",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: 10,
          },
        },
        {
          props: { variant: 'blurred' },
          style: {
            backgroundColor: "#ffffff50",
            backdropFilter: "blur(10px)",
            borderRadius: 10,
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            backgroundColor: "#ffffff",
            border: "1px solid lightgrey",
            borderRadius: 10,
          },
        },
      ],
    },
    MuiCardContent: {
      defaultProps: {
        style: {
          padding: 16,
          "&:last-child": {
            paddingBottom: 0,
          },
        }
      },
    },
  },
  shape: {
    borderRadius: 10,
  },

});

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
  API: {
    REST: {
      midori: {
        endpoint: import.meta.env.VITE_API_URL,
      }
    }
  }
}, {
  API: {
    REST: {
      headers: async () => {
        return { Authorization: localStorage.getItem("token") };
      }
    }
  }
});

theme = responsiveFontSizes(theme);

ReactDOM.createRoot(document.getElementById('root')).render(

  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
    </BrowserRouter>
  </ThemeProvider>


)
