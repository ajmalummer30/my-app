import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/DashBoard/Dashboard';
import Reports from './pages/DashBoard/Reports';
import Settings from './pages/DashBoard/Settings';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import DashboardLayout from './components/DashBoardLayout';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth';
import AuthInitializer from './components/AuthInitializer';
import { Navigate } from 'react-router-dom';
import UserProfile from './pages/UserProfile';
import Profile from './pages/Profile';

const App = () => {
  return (
    <>

    <Routes>
     <Route path="/" element={<Navigate to="/login" replace />} />
    {/* Login route */}
    <Route path="/login" element={<Login />} />



      {/* Protected Routes */}
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="userprofile" element={<UserProfile />} />
          <Route path="profile" element={<Profile />} />

          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>
    </Routes>
    </>
     
  );
};

export default App;
