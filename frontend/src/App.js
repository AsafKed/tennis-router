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


  // theme.typography.h1 = {
  //   fontSize: '2.5rem',
  //   fontWeight: 500,
  //   lineHeight: 1.2,
  //   letterSpacing: '-0.01562em',
  //   color: '#2D2F7F',
  // };

  // And other variables
  const [loggedIn, setLoggedIn] = useState(false);
  const { trackEvent } = useTracking();

  useEffect(() => {
    // Check if user is logged in, used for available navigation pages
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
    });

    // Track user if logged in, otherwise use unique ID
    trackEvent({ action: 'mounted' })

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
            <Route path="/user" element={loggedIn ? <UserPage /> : <Navigate to="/" />} />
            
            <Route path="/browser" element={<BrowsingPage />}>
              <Route path="/browser/:browseType/:playerName?" element={<BrowsingPage />} />
            </Route>

            {/* TODO the following */}
            {/* <Route path="/browser/:player" element={<PreferenceSolicitationPage />} /> */}
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
