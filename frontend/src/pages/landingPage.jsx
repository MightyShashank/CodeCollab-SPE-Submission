import React from 'react'
import TopNavBar from '../components/PageWiseComponents/landingPage/TopNavBar'
import Footer from '../components/PageWiseComponents/landingPage/Footer';
import Main from '../components/PageWiseComponents/landingPage/Main';
import {
  Code,
  Users,
  Video,
  PenTool,
  Brain,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Play,
  X,
  Mail,
  Lock,
  User,
  Building,
  Eye,
  EyeOff,
  Phone,
} from "lucide-react"

function landingPage({ navigate }) {
  return (
    <div className='bg-zinc-800 h-full w-full'>
        <header className='px-20'>
            <TopNavBar navigate={navigate}/>
        </header>

        {/* Announcement Banner */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">🎉 New Feature:</span>
            </div>
            <span className="text-sm md:text-base">
              Real-time teammate messaging and instant calling now available in coding sessions!
            </span>
            {/* onClick={() => openAuthModal("signup")} put this in below button later */}
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-1 rounded-full text-sm font-medium transition-colors">
              Try Now →
            </button>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="relative z-10 bg-black bg-opacity-30 backdrop-blur-sm border-b border-discord-gray">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12 text-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">
                  <span className="font-bold text-white">2,847</span> developers coding live
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">
                  <span className="font-bold text-white">156</span> active coding sessions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">
                  <span className="font-bold text-white">12,439</span> problems solved today
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">
                  <span className="font-bold text-white">89</span> video calls in progress
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <main className='px-20 flex flex-col items-center'>

            {/* Trust Indicators */}
            <div className="text-center mb-8 pt-20">
              <div className="flex items-center justify-center space-x-6 mb-4 opacity-60">
                <span className="text-sm text-gray-400">Trusted by developers from:</span>
                <div className="flex items-center space-x-4">
                  <div className="px-3 py-1 bg-zinc-600 rounded-full text-xs font-medium text-white">Google</div>
                  <div className="px-3 py-1 bg-zinc-600 rounded-full text-xs font-medium text-white">Microsoft</div>
                  <div className="px-3 py-1 bg-zinc-600 rounded-full text-xs font-medium text-white">Amazon</div>
                  <div className="px-3 py-1 bg-zinc-600 rounded-full text-xs font-medium text-white">Meta</div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 text-yellow-400">
                      ⭐
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-300">
                  <span className="font-bold">4.9/5</span> from 2,100+ developers
                </span>
              </div>

              <div className="inline-flex items-center space-x-2 border border-blue-500 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-500">#1 Platform for Collaborative Coding</span>
              </div>
            </div>

            <Main/>
        </main>
        
        <footer className='border-t border-white/25 pt-4 px-20'>
            <Footer/>
        </footer>
    </div>
  )
}


export default landingPage;