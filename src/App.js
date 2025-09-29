import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ProgramProvider } from "./context/ProgramContext"; // ✅ import ProgramProvider
import Landing from "./components/Landing";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import TopHeader from "./components/Topheader";
import SuperCupLanding from "./components/SuperCupLanding";
import NotFound from "./components/NotFound";
import TicketRegistration from "./components/registration/TicketRegistration";
import PlayerRegistration from "./components/registration/PlayerRegistration";
import CoachRegistration from "./components/registration/CoachRegistration";
import ManagerRegistration from "./components/registration/ManagerRegistration";
import TeamRegistration from "./components/registration/TeamRegistration";
import RegistrationHome from "./components/registration/RegistrationHome";
import RegistrationSuccess from "./components/registration/RegistrationSuccess";
import LearnMorePage from "./pages/LearnMorePage";
import ViewTeamsPage from "./pages/ViewTeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import AboutPage from "./pages/AboutPage";
import HomeMirror from "./pages/HomeMirror";
import AppFooter from "./components/Footer";
import VerifyPayment from "./pages/VerifyPayment";
import PlayerDashboard from "./components/Dashboards/PlayerDashboard";
import CoachDashboard from "./components/Dashboards/CoachDashboard";
import ManagerDashboard from "./components/Dashboards/TeamManager";
import AdminDashboard from "./components/Dashboards/AdminDashbord";
import RedirectPage from "./components/RedirectPage";

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* ✅ wrap inside ProgramProvider */}
      <Router>
        <div className="site-root">
          <TopHeader />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/supercup" element={<SuperCupLanding />} />
              <Route path="/programs" element={<Landing />} />
              <Route path="/home" element={<HomeMirror />} />
              <Route path="/home-mirror" element={<HomeMirror />} />
              <Route path="/donate" element={<RedirectPage />} />
              <Route path="/transparency" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              {/* Registration routes */}
              <Route path="/register" element={<RegistrationHome />} />
              <Route path="/register/ticket" element={<TicketRegistration />} />
              <Route path="/register/player" element={<PlayerRegistration />} />
              <Route path="/register/coach" element={<CoachRegistration />} />
              <Route
                path="/register/manager"
                element={<ManagerRegistration />}
              />
              <Route path="/register/team" element={<TeamRegistration />} />
              <Route
                path="/register/success"
                element={<RegistrationSuccess />}
              />
              <Route path="/verify-payment" element={<VerifyPayment />} />
              {/* Admin routes */}
              <Route path="/learn" element={<LearnMorePage />} />
              <Route path="/teams" element={<ViewTeamsPage />} />
              <Route path="/teams/:id" element={<TeamDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/manager"
                element={
                  <ProtectedRoute>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coach"
                element={
                  <ProtectedRoute>
                    <CoachDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/player"
                element={
                  <ProtectedRoute>
                    <PlayerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <AppFooter className="app-footer" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
