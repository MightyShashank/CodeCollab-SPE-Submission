import React, { useState } from 'react';
import { Home, Users, Play, Settings, List, Link, Plus } from 'lucide-react';
import { Icon } from '@iconify/react';
import { userState } from '../../recoil/atoms/authAtoms'; 
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';
import { sidebarNavState } from '../../recoil/atoms/uiAtoms';
import { getInitials } from '@/pages/CandidatePages/CandidateHomePage';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  // const [currentUserOption, setCurrentUserOption] = useRecoilState(sidebarNavState);

  // const handleNav = (comp) => {
  //   setCurrentUserOption(comp);
  //   navigate(`/home/${comp}`);
  // }

  const toggleSidebar = () => setCollapsed(!collapsed);
  const navigate = useNavigate(); // newly added

  const menuItems = [
    { icon: <Home size={20} />, label: 'Home', key: 'home' },
    { icon: <Users size={20} />, label: 'Groups', key: 'groups' },
    { icon: <Play size={20} />, label: 'Join Session', key: 'join-session' },
    { icon: <List size={20} />, label: 'All Problems', key: 'all-problems' },
    { icon: <Link size={20} />, label: 'Solve by Link', key: 'solve-by-link' },
    { icon: <Plus size={20} />, label: 'Create Problem', key: 'create-problem' },
    { icon: <Settings size={20} />, label: 'Settings', key: 'settings' },
  ];

  // Get the user data from the global state
  const user = useRecoilValue(userState);

  // If the user is not logged in (which shouldn't happen because of your router,
  // but it's good practice to check), you can show a loading or error message.
  if (!user) {
    return <div>Loading user data or not logged in...</div>;
  }

  return (
    <div className="relative flex h-screen">
      {/* Sidebar */}
      <div
        className={`flex flex-col h-screen bg-zinc-700 text-white border-r border-zinc-600
          transition-all duration-300 ease-in-out overflow-hidden
          ${collapsed ? 'w-16' : 'w-64'}
        `}
        style={{ transitionProperty: 'width' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700 relative">
          {/* Left side: Logo */}
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-500 text-white p-1 rounded-md flex-shrink-0">
                <Icon
                  icon="material-symbols:code-rounded"
                  width="26"
                  height="26"
                />
              </div>
              <span className="text-lg font-semibold transition-all duration-300">
                CodeCollab
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              {/* Toggle replaces logo when collapsed */}
              <button
                onClick={toggleSidebar}
                className="text-white p-1 hover:bg-zinc-600 rounded-md transition-colors"
              >
                <Icon
                  icon="tabler:layout-sidebar-right-collapse"
                  width="26"
                  height="26"
                />
              </button>
            </div>
          )}

          {/* Right side: Toggle */}
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="text-white p-1 hover:bg-zinc-600 rounded-md transition-colors"
            >
              <Icon
                icon="tabler:layout-sidebar-left-collapse"
                width="26"
                height="26"
              />
            </button>
          )}
        </div>

        {/* Menu Items */}
        {/* <div className="flex-1 p-2 space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.key}
              // This is where you add the onClick handler
              onClick={() => setCurrentUserOption(item.key)}
              className={`flex items-center px-4 py-2 rounded-md cursor-pointer hover:bg-zinc-600 ${
                // This now dynamically checks if the item is the active one
                currentUserOption === item.key ? 'bg-indigo-500 text-white' : 'text-zinc-300'
              } transition-colors duration-200`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <span
                className={`ml-3 transition-all duration-300 ease-in-out ${
                  collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                } overflow-hidden whitespace-nowrap`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div> */}

        {/* Menu Items: This version handles url */}
        <div className="flex-1 p-2 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.key}
              // The 'to' prop tells the router where to go.
              // Handle the 'home' case separately.
              to={item.key === 'home' ? '/home' : `/home/${item.key}`}
              // The 'end' prop is crucial for the home link to not match all other links.
              end={item.key === 'home'}
              // The className function gives you an 'isActive' boolean.
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md cursor-pointer hover:bg-zinc-600 ${
                  isActive ? 'bg-indigo-500 text-white' : 'text-zinc-300'
                } transition-colors duration-200`
              }
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <span
                className={`ml-3 transition-all duration-300 ease-in-out ${
                  collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                } overflow-hidden whitespace-nowrap`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 mt-auto flex items-center space-x-3">
          <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {getInitials(user.display_name)}
          </div>
          <div
            className={`flex flex-col text-sm transition-all duration-300 ${
              collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
            } overflow-hidden`}
          >
            <span className="font-medium">{user.display_name}</span>
            <span className="text-emerald-400">● Online</span>
          </div>
        </div>


      </div>
    </div>
  );
};

// Before you re-render this component, check if its props have changed. 
// If the props are exactly the same as last time, just skip the re-render and use the old result.
export default React.memo(Sidebar);
