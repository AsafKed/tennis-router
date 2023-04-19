import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
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

function App() {
  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <BrowserRouter>
        <TopNavigationMenu />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/group" element={<GroupPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user" element={<UserPage />} />
        </Routes>
        <div style={{ flexGrow: 1 }}></div>
        <BottomNavigationMenu />
      </BrowserRouter>
    </div>
  );
}


export default App;
