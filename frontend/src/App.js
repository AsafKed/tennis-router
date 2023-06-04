import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";

// Pre-login pages
import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Post-login pages
import UserPage from "./pages/UserPage";
import PreferenceSolicitationPage from "./pages/PreferenceSolicitationPage";
import BottomNavigationMenu from "./components/BottomNavigationMenu";
import TopNavigationMenu from "./components/TopNavigationMenu";

// Material UI (better font styling)
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Firebase
import { auth } from './firebase';

// Tracking
import { dispatchTrackingData } from "./TrackingDispatcher";
import { track, useTracking } from 'react-tracking';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { trackEvent } = useTracking();

  useEffect(() => {
    // Check if user is logged in, used for available navigation pages
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
        localStorage.setItem('userId', JSON.stringify(user.uid));
        localStorage.removeItem('userPreLoginId');
      } else {
        setLoggedIn(false);
        localStorage.setItem('userPreLoginId', uuidv4());
        localStorage.removeItem('userId');
      }
    });

    trackEvent({ action: 'mounted', 'user_id': localStorage.getItem('userId'), 'user_pre_login_id': localStorage.getItem('userPreLoginId') })

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <BrowserRouter>
        <TopNavigationMenu loggedIn={loggedIn} />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          {loggedIn && (
            <>
              <Route path="/user" element={<UserPage />} />
              <Route path="/preferences" element={<PreferenceSolicitationPage />} />
            </>
          )}
          {!loggedIn && (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </>
          )}
        </Routes>
        <div style={{ flexGrow: 1 }}></div>
        <BottomNavigationMenu loggedIn={loggedIn} />
      </BrowserRouter>
    </div>
  );
}

export default track({ page: 'App' }, { dispatch: dispatchTrackingData })(App);
