import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import Footer from './Footer';
import SideMenu from './SideMenu';

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (static, on all pages) */}
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10">
            <SideMenu />
        </aside>


      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />

        {/* Content (scrollable if needed) */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
