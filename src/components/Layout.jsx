import { Outlet } from "react-router-dom";

import Footer from "./Footer";
import SideMenu from "./SideMenu";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar2 from "./Navbar2";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Sidebar (only on xl and up) */}
     {/*  <aside className="hidden xl:block fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10">
        <div className="h-full overflow-y-auto">
          <SideMenu />
        </div>
      </aside> */}

      {/* Main content area (shifted to the right on xl) */}
      <div className="flex flex-col flex-1 min-h-screen ">
        {/* Header */}
        <header >
        {/*   <Navbar /> */}
        <Navbar2 />

        </header>

        {/* Main section (with top padding to avoid overlap with header) */}
        <main className="flex-1 pt-20 px-4 overflow-y-auto">
          <div className="container mx-auto px-4">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto">
        {/*   <Footer /> */}
        </footer>
      </div>

      {/* Global Toasts */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Layout;
