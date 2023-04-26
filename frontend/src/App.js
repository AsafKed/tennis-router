import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import WelcomePage from "./pages/WelcomePage";
import GroupPage from "./pages/GroupPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPage from "./pages/UserPage";
import BottomNavigationMenu from "./components/BottomNavigationMenu";
import TopNavigationMenu from "./components/TopNavigationMenu";

// Material UI (better font styling)
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { auth } from './firebase';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });

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
              <Route path="/group" element={<GroupPage />} />
              <Route path="/user" element={<UserPage />} />
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

export default App;