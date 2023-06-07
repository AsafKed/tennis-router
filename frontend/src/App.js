import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Pre-login pages
import WelcomePage from "./pages/WelcomePage";
import DataUsagePolicy from "./pages/DataUsagePolicy";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Post-login pages
import UserPage from "./pages/UserPage";

// Browsing pages
import BrowsingPage from "./pages/GeneralBrowsingPage";

// Navigation pages
import BottomNavigationMenu from "./components/BottomNavigationMenu";
import TopNavigationMenu from "./components/TopNavigationMenu";

// Material UI (better font styling)
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Theme for Material UI (JADS colors)
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Firebase
import { auth } from './firebase';

// Tracking
import { dispatchTrackingData } from "./TrackingDispatcher";
import { track, useTracking } from 'react-tracking';
import { v4 as uuidv4 } from 'uuid';

function LoadingScreen() {
  return <div>Loading...</div>;
}

// Main app component
function App() {
  // Set the theme
  const theme = createTheme({
    palette: {
      primary: {
        main: "#2D2F7F"
      },
      secondary: {
        main: "#CA4F55",
      },
    },
  });

  theme.typography.h1 = ({

        fontSize: '2.125rem', // 34px
        fontWeight: 'bold',
        lineHeight: 1,
        letterSpacing: '-0.0625rem', // -1px
        [theme.breakpoints.down('md')]: {
          fontSize: '2.125rem', // 34px
        },
        [theme.breakpoints.down('sm')]: {
          fontSize: '1.5rem', // 24px
        },
      });

  theme.typography.h2 = ({
        fontSize: '1.875rem', // 30px
        fontWeight: 'bold',
        lineHeight: 1.067,
        letterSpacing: '-0.05rem', // -0.8px
        [theme.breakpoints.down('md')]: {
          fontSize: '1.5rem', // 24px
        },
        [theme.breakpoints.down('sm')]: {
          fontSize: '1.125rem', // 18px
        },
      });

  theme.typography.h3 = ({

        fontSize: '1.5rem', // 24px
        fontWeight: 'bold',
        lineHeight: 1.083,
        letterSpacing: '-0.0375rem', // -0.5px
        [theme.breakpoints.down('md')]: {
          fontSize: '1.25rem', // 20px
        },
        [theme.breakpoints.down('sm')]: {
          fontSize: '1.125rem', // 18px
        },
      });

  theme.typography.h4 = ({
        fontSize: '1.25rem', // 20px
        fontWeight: 'bold',
        lineHeight: 1.1,
        letterSpacing: '-0.025rem', // -0.4px
        [theme.breakpoints.down('md')]: {
          fontSize: '1.125rem', // 18px
        },
        [theme.breakpoints.down('sm')]: {
          fontSize: '1rem', // 16px
        },
      });

  theme.typography.h5 = ({
        fontSize: '1.125rem', // 18px
        fontWeight: 'bold',
        lineHeight: 1.111,
        letterSpacing: '-0.0125rem', // -0.2px
        [theme.breakpoints.down('md')]: {
          fontSize: '1rem', // 16px
        },
      });

  theme.typography.h6 = ({

        fontSize: '1rem', // 16px
        fontWeight: 'bold',
        lineHeight: 1.125,
        letterSpacing: '-0.00625rem', // -0.1px
      });  

  // And other variables
  const [loggedIn, setLoggedIn] = useState(false);
  const { trackEvent } = useTracking();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
        localStorage.setItem('userId', JSON.stringify(user.uid));
        localStorage.removeItem('userPreLoginId');
        localStorage.removeItem('loggingOut');
      } else {
        setLoggedIn(false);
        localStorage.setItem('loggingOut', 'true');
        if (!localStorage.getItem('userPreLoginId')) {
          localStorage.setItem('userPreLoginId', uuidv4());
          localStorage.removeItem('userId');
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);


  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <TopNavigationMenu loggedIn={loggedIn} />
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/data-usage-policy" element={<DataUsagePolicy />} />
            {/* <Route path="/user" element={loggedIn ? <UserPage /> : <Navigate to="/" />} /> */}
            <Route path="/user/:tab?" element={!loading ? (loggedIn ? <UserPage /> : <Navigate to="/" />) : <LoadingScreen />} />

            <Route path="/browser" element={<BrowsingPage />}>
              <Route path="/browser/:browseType/:playerName?" element={<BrowsingPage />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <div style={{ flexGrow: 1 }}></div>
          <BottomNavigationMenu loggedIn={loggedIn} />
        </BrowserRouter>
      </ThemeProvider>
    </div >
  );
}

export default track({ page: 'App' }, { dispatch: dispatchTrackingData })(App);
