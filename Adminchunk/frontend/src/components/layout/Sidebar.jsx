import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const role = 'Admin'; // Hardcoded role

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Ask SOP', path: '/chat', icon: '💬' },
    { name: 'Upload SOP', path: '/upload', icon: '⬆' },
    { name: 'SOP List', path: '/sop-list', icon: '📄' },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Navigation</h2>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-gray-700 ${
                  location.pathname === item.path ? 'bg-gray-700' : ''
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
