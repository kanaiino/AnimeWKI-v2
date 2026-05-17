import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Aside from "./components/Aside/Aside";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import Catalog from "./pages/Catalog/Catalog";
import AnimePage from "./pages/AnimePage/AnimePage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import WatchPage from "./pages/WatchPage/WatchPage";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [asideActive, setAsideActive] = useState(!isMobile);       // на десктопе открыта, на мобильных закрыта
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!isMobile); // на десктопе открыта, на мобильных закрыта

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        // При переходе на мобильный вид обе панели закрываются
        setAsideActive(false);
        setIsRightPanelOpen(false);
      } else {
        // При переходе на десктоп – обе открываются
        setAsideActive(true);
        setIsRightPanelOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleAside = () => {
    if (isMobile) {
      if (!asideActive) {
        setAsideActive(true);
        if (isRightPanelOpen) setIsRightPanelOpen(false);
      } else {
        setAsideActive(false);
      }
    } else {
      setAsideActive(prev => !prev);
    }
  };

  const toggleRightPanel = () => {
    if (isMobile) {
      if (!isRightPanelOpen) {
        setIsRightPanelOpen(true);
        if (asideActive) setAsideActive(false);
      } else {
        setIsRightPanelOpen(false);
      }
    } else {
      setIsRightPanelOpen(prev => !prev);
    }
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Header
          onToggleAside={toggleAside}
          onToggleRightPanel={toggleRightPanel}
          isMobile={isMobile}
        />
<Aside isActive={asideActive} onClose={() => setAsideActive(false)} isMobile={isMobile} />
        <Routes>
          <Route path="/login" element={<Login isActive={asideActive} />} />
          <Route path="/register" element={<Register isActive={asideActive} />} />
          <Route path="/" element={<Home isActive={asideActive} />} />
          <Route
            path="/catalog"
            element={
              <Catalog
                isActive={asideActive}
                isRightPanelOpen={isRightPanelOpen}
                isMobile={isMobile}
              />
            }
          />
          <Route path="/anime/:id" element={<AnimePage isActive={asideActive} />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile isActive={asideActive} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watch/:shikimoriId"
            element={
              <ProtectedRoute>
                <WatchPage
                  isActive={asideActive}
                  isRightPanelOpen={isRightPanelOpen}
                  isMobile={isMobile}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;