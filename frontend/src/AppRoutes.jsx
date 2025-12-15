import './App.css'
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { userState } from './recoil/atoms/authAtoms'; 

import LandingPage from './pages/landingPage';
import CandidateHomePage from './pages/CandidatePages/CandidateHomePage';
import CandidateHomePageMainHome from './components/PageWiseComponents/candidatePage/CandidateHomePageMainHome';
import GroupPage from './components/PageWiseComponents/candidatePage/GroupsPage';
import ProblemsPage from './components/PageWiseComponents/candidatePage/ProblemsPage';
import JoinSession from './components/PageWiseComponents/candidatePage/JoinSession';
import SolveByLinkPage from './components/PageWiseComponents/candidatePage/SolveByLinkPage';
import ResizableLayout from './utils/render_problem';
import CreateProblemPage from './components/PageWiseComponents/candidatePage/CreateProblemPage';


export default function AppRoutes() {
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const token = localStorage.getItem('token');

        // If no token, user is not authenticated
        if (!token) {
          setUser(null);
          return;
        }

        const res = await fetch(
          'http://localhost:8085/api/auth/check-auth',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);

          // Navigation logic intentionally left untouched
          // (as per your original comments)
        } else {
          // Token exists but is invalid / expired
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserAuth();
  }, [setUser]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-900 text-white">
        Checking session...
      </div>
    );
  }

  return (
    <Routes>
      {/* If user not logged in, show landing page */}
      {/* This logic correctly redirects a logged-in user from "/" to "/home" */}
      <Route path="/" element={!user ? <LandingPage navigate={navigate} /> : <Navigate to="/home" replace />} />
      
      {/* If user logged in, show homepage */}
      {/* This logic correctly protects the "/home" routes */}
      <Route path="/home" element={user ? <CandidateHomePage /> : <Navigate to="/" replace />}>
        {/* This defines what shows up inside the <Outlet /> */}
        <Route index element={<CandidateHomePageMainHome />} />
        <Route path="groups" element={<GroupPage />} />
        <Route path="join-session" element={<JoinSession />} />
        <Route path="all-problems/*" element={<ProblemsPage />} />
        <Route path="solve-by-link" element={<SolveByLinkPage />} />
        <Route path="create-problem" element={<CreateProblemPage />} />
        <Route path="settings" element={<ResizableLayout />} />

        {/* You can add your other nested routes here */}
      </Route>
    </Routes>
  );
}