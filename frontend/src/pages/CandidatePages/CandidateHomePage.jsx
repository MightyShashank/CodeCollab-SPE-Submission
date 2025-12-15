import React from 'react'
import Sidebar from '@/components/ui/sidebar'
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect, useMemo } from 'react';
import { userState } from '../../recoil/atoms/authAtoms'; 
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';
import CandidateHomePageMainHome from '@/components/PageWiseComponents/candidatePage/CandidateHomePageMainHome';
import { sidebarNavState } from '../../recoil/atoms/uiAtoms';
import SolveByLinkPage from '@/components/PageWiseComponents/candidatePage/SolveByLinkPage';
import ResizableLayout from '@/utils/render_problem';
import ProblemsPage from '@/components/PageWiseComponents/candidatePage/ProblemsPage';
import CreateProblemPage from '@/components/PageWiseComponents/candidatePage/CreateProblemPage';
import GroupPage from '@/components/PageWiseComponents/candidatePage/GroupsPage';
import JoinSession from '@/components/PageWiseComponents/candidatePage/JoinSession';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// import { userState } from '@/recoil/atoms/authAtoms';
// import { useLocation } from 'react-router-dom'; // this gets the current url info

// ***** 1. IMPORT ANIMATION COMPONENTS *****
import { motion, AnimatePresence } from 'framer-motion';

// --- Placeholder Components for each sidebar option ---
// const GroupsPage = () => <div className="bg-zinc-800 text-white">Groups Page Content</div>;
const JoinSessionPage = () => <div className="bg-zinc-800 text-white">Join Session Page Content</div>;
// const AllProblemsPage = () => <div className="bg-zinc-800 text-white">All Problems Page Content</div>;
// const SolveByLinkPage = () => <div className="bg-zinc-800 text-white">Solve by Link Page Content</div>;
// const CreateProblemPage = () => <div className="bg-zinc-800 text-white">Create Problem Page Content</div>;
const SettingsPage = () => <div className="bg-zinc-800 text-white">Settings Page Content</div>;


export const getInitials = (name) => {
  // Return a fallback if the name is missing
  if (!name) return '??';

  const nameParts = name.trim().split(' ');
  
  // If there's more than one name part (e.g., "Shashank Tippanavar")
  if (nameParts.length > 1) {
    const firstInitial = nameParts[0][0];
    const lastInitial = nameParts[nameParts.length - 1][0];
    return `${firstInitial}${lastInitial}`.toUpperCase();
  } 
  // If there's only one name, take the first two letters
  else if (nameParts[0]) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  
  // Fallback for empty names
  return '??';
};

export default function CandidateHomePage() {

   const navigate = useNavigate();
   const location = useLocation();
  // const [currentUserOption, setCurrentUserOption] = useRecoilState(sidebarNavState); removed now

  // Get the user data from the global state
  const [user, setUser] = useRecoilState(userState);
  // const user = useRecoilValue(userState);

  // --- Helper function to render the correct component based on state ---
  // removed now
  // const renderMainContent = () => {
  //   switch (currentUserOption) {
  //     case 'home':
  //       return <CandidateHomePageMainHome />;
  //     case 'groups':
  //       return <GroupPage />;
  //     case 'join-session':
  //       return <JoinSession />;
  //     case 'all-problems':
  //       return <ProblemsPage />;
  //     case 'solve-by-link':
  //       return <SolveByLinkPage />;
  //     case 'create-problem':
  //       return <CreateProblemPage />;
  //     case 'settings':
  //       return <ResizableLayout />;
  //     default:
  //       return <CandidateHomePageMainHome />;
  //   }
  // };

  // If the user is not logged in (which shouldn't happen because of your router,
  // but it's good practice to check), you can show a loading or error message.
  if (!user) {
    return <div>Loading user data or not logged in...</div>;
  }

  // console.log(`user = ${user}`); // just basic debugging

  // Generate the initials
  const userInitials = getInitials(user.display_name); // This will return "ST"

  // --- User Profile & Logout Component ---
  const UserProfile = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Get user initials for the avatar

    // Close menu if clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
              setIsMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch(' http://localhost:8085/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // Important for sending the cookie to be cleared
            });

            localStorage.removeItem('token');

            if (!response.ok) {
                throw new Error('Logout failed.');
            }
            // On successful logout, you would typically clear global state and redirect.
            // For this example, we'll just reload the page.
            setUser(null); // userState delete on frontend
            toast.success('Logged out successfully!', { duration: 2000 });
            
            // alert('Logged out successfully!');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('An error occurred during logout.', {
              duration: 2000,
              style: {
                background: '#dc2626', // Tailwind red-600
                color: '#fff',
                borderRadius: '8px',
                padding: '10px 16px',
              },
            });
        }
        finally {
          // setUser(null);
          // window.location.href = '/';
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <div 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 p-2 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer text-white font-bold text-sm select-none hover:bg-blue-500 transition-colors"
            >
                {userInitials}
            </div>
            {isMenuOpen && (
                <div className="absolute top-12 right-0 w-48 bg-[#18191c] rounded-md shadow-lg z-50 border border-gray-700/50 py-2 px-2">
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 transition-colors rounded-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar/>
      
      {/* Main content */}
      <div className="flex flex-col flex-1">
        <div className="w-full bg-zinc-700 border-b border-zinc-600 h-16 flex justify-between items-center px-6">

          {/* Search bar */}
          <div className="flex items-center bg-zinc-600 text-zinc-300 px-3 py-2 rounded-md w-full max-w-xs h-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-zinc-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M16.65 16.65A7 7 0 1110 3a7 7 0 016.65 13.65z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search problems, groups..."
              className="bg-transparent outline-none text-sm placeholder-zinc-400 w-full"
            />
          </div>

          <div className="flex gap-x-2 items-center">
            <div className="text-xs p-2 bg-zinc-600 flex gap-x-1 items-center rounded-md">
              <Icon icon="la:user-friends" width="14" height="14" className="text-green-400" />
              <div className="text-white">3 members online</div>
            </div>
            <div className="text-xs p-2 bg-zinc-600 flex gap-x-1 items-center rounded-md">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <div className="text-white">Live Session</div>
            </div>
          </div>

          <div className="flex gap-x-2 items-center">
            <div className="w-8 h-8 rounded-sm bg-zinc-600 flex items-center justify-center cursor-pointer">
              <Icon icon="streamline-flex-color:ai-chip-robot" width="20" height="20" />
            </div>
            <div className="w-8 h-8 rounded-sm bg-zinc-600 flex items-center justify-center cursor-pointer">
              <Icon icon="mynaui:sun" width="20" height="20" className="text-white" />
            </div>
            <div className="w-8 h-8 rounded-sm bg-zinc-600 flex items-center justify-center cursor-pointer">
              <Icon icon="nimbus:notification" width="16" height="16" className="text-white" />
            </div>
            {/* <div className="w-10 h-8 p-2 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer text-white">{userInitials}</div> */}
            <UserProfile user={user} />
          </div>

            
        </div>

        {/* Main center now renders conditionally */}
        <main className="flex-1 p-6 bg-zinc-800 overflow-y-auto flex items-center justify-center">
            {/* {renderMainContent()} */}

            {/* AnimatePresence handles the exit animation */}
          {/* <AnimatePresence mode="wait">
            <motion.div
              // The key is crucial: it tells React that this is a new component
              key={location.pathname}
              
              // Animation properties
              initial={{ opacity: 0, y: 15 }} // Start invisible and slightly down
              animate={{ opacity: 1, y: 0 }}   // Fade in and move to final position
              exit={{ opacity: 0, y: -5 }}    // Fade out and move slightly up
              transition={{ duration: 0.10 }} // Speed of the animation
              
              className="w-full h-full flex items-center justify-center"
            >
              {/* {renderMainContent()} */} 
              {/* <Outlet />
            </motion.div>
          </AnimatePresence> */} 
          <Outlet />
        </main>
        {/* Main center if given home page*/}
        {/* <CandidateHomePageMainHome/> */}
      </div>
      
    </div>
  )
}

