import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/DashBoard/Dashboard";
import Reports from "./pages/DashBoard/Reports";
import Settings from "./pages/DashBoard/Settings";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DashboardLayout from "./components/DashBoardLayout";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";
import AuthInitializer from "./components/AuthInitializer";
import { Navigate } from "react-router-dom";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import AddVisitorForm from "./pages/AddVisitor";
import PhoneAuth from "./Helperfunctions/PhoneAuth";
import "./components/i18n";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import VisitorSelfRegistration from "./pages/VisitorSelfRegistration";
import TestPage from "./pages/testpage";
import "./App.css";
import VisitsTable from "./components/VisitsTable";
import GetVisitorData from "./components/GetVisitorData";
import ImageUploaderCropper from "./components/ImageuploaderCropper";

const App = () => {
  const { i18n } = useTranslation();

  // Update the direction based on language
  /*  useEffect(() => {
    const lang = i18n.language || "en";
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [i18n.language]); */
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Login route */}
        <Route path="/login" element={<Login />} />
        <Route path="/phonelogin" element={<PhoneAuth />} />
        <Route path="/tespage" element={<TestPage />} />
        <Route path="/selfregister" element={<VisitorSelfRegistration />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="addvisitor" element={<AddVisitorForm />} />
            <Route path="contact" element={<Contact />} />
            <Route path="userprofile" element={<UserProfile />} />
            <Route path="editprofile" element={<EditProfile />} />
            <Route path="visitorreport" element={<VisitsTable />} />
            <Route path="showvisitor" element={<GetVisitorData />} />
             <Route path="testimage" element={<ImageUploaderCropper />} />
            {/* <Route path="addvisitor" element={<AddVisitorForm />} /> */}

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
