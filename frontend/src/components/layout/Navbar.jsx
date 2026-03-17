import { useState } from 'react';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">SOP AI Assistant</div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Connected</span>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-blue-700 px-3 py-2 rounded-full hover:bg-blue-800"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-black font-bold">
                A
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-10">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">Role: Admin</p>
                </div>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
