import { BrowserRouter, Route, Routes } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import GroupPage from "./pages/GroupPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/group" element={<GroupPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
