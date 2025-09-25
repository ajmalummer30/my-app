import { Outlet } from 'react-router-dom';
import SideMenu from './SideMenu';

const DashboardLayout = () => {
  return (
    <div className="flex h-full min-h-0 overflow-hidden">
     

      {/* Main Content */}
      <section className="flex-1 h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
        <Outlet />
      </section>
    </div>
  );
};

export default DashboardLayout;
