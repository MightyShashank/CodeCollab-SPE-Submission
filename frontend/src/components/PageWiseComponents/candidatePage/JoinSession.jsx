import React, { useState, useRef, useEffect } from 'react';
// ✅ FIXED: Replaced the esm.sh import with esm.run to resolve the dynamic require error.
// The CSS is automatically bundled with this import.
import { Tldraw } from 'tldraw';
import "tldraw/tldraw.css";
import CodeEditor from '@/utils/codeEditor';


// --- Mock Data (replace with real data from your state/API) ---
const mockSessionData = {
  groupName: 'Algorithm Masters',
  problem: {
    title: 'Two Sum',
    description_md: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`...',
    // ... other problem fields
  },
  participants: [
    { id: 1, name: 'Alice', isSpeaker: true, isMuted: false, avatarColor: 'bg-indigo-500' },
    { id: 2, name: 'Bob', isSpeaker: true, isMuted: true, avatarColor: 'bg-blue-500' },
    { id: 3, name: 'Carol', isSpeaker: false, isMuted: false, avatarColor: 'bg-purple-500' },
    { id: 4, name: 'David', isSpeaker: false, isMuted: false, avatarColor: 'bg-pink-500' },
    { id: 5, name: 'Emma', isSpeaker: false, isMuted: true, avatarColor: 'bg-teal-500' },
  ],
  chatMessages: [
    { id: 1, sender: 'Alice', text: 'Hey everyone, ready to start?' },
    { id: 2, sender: 'Carol', text: 'Yep, let\'s do this! I think we can start with a brute-force approach.' },
    { id: 3, sender: 'Bob', text: 'Sounds good. I\'ll map it out on the whiteboard.' },
  ]
};

// --- Helper Icons ---
const MicOnIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 9.5a.5.5 0 01.5.5v1a4 4 0 004 4h.5a.5.5 0 010 1h-1a5 5 0 01-5-5v-1a.5.5 0 01.5-.5z" /></svg>;
const MicOffIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm-1.465 5.035a.5.5 0 01.707 0L8 10.707l1.757-1.758a.5.5 0 11.708.708L8.707 11.414l1.758 1.758a.5.5 0 01-.708.708L8 12.121l-1.757 1.757a.5.5 0 01-.708-.708L7.293 11.414 5.535 9.757a.5.5 0 010-.707z" clipRule="evenodd" /><path d="M5.5 9.5a.5.5 0 01.5.5v1a4 4 0 004 4h.5a.5.5 0 010 1h-1a5 5 0 01-5-5v-1a.5.5 0 01.5-.5z" /></svg>;
const HeadphoneIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a5 5 0 005-5V3a5 5 0 00-10 0v4a5 5 0 005 5zM3 10a2 2 0 114 0v1a2 2 0 11-4 0v-1zm10 0a2 2 0 114 0v1a2 2 0 11-4 0v-1z" /></svg>;
const ShareScreenIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l-1.334 1.334a1 1 0 01-1.414 0L9.22 15H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" /><path d="M8 8a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 8zm4 0a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 0112 8z" /></svg>;
const DisconnectIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M14.348 14.849a1.2 1.2 0 01-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 11-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 111.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 111.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 010 1.698z" /></svg>;
const SendIcon = () => <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>;

// --- Sub-Components ---

const Participant = ({ participant }) => (
  <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/5">
    <div className={`w-10 h-10 rounded-full ${participant.avatarColor} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
      {participant.name.split(' ').map(n => n[0]).join('')}
    </div>
    <span className="flex-1 text-gray-300 truncate">{participant.name}</span>
    {participant.isMuted && <MicOffIcon />}
  </div>
);

const ParticipantsPanel = ({ participants }) => {
  const speakers = participants.filter(p => p.isSpeaker);
  const listeners = participants.filter(p => !p.isSpeaker);
  return (
    <div className="bg-[#2c2f33] w-64 p-3 flex flex-col space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase text-gray-500 px-2 mb-2">Speakers ({speakers.length})</h3>
        <div className="space-y-1">
          {speakers.map(p => <Participant key={p.id} participant={p} />)}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase text-gray-500 px-2 mb-2">Listeners ({listeners.length})</h3>
        <div className="space-y-1">
          {listeners.map(p => <Participant key={p.id} participant={p} />)}
        </div>
      </div>
    </div>
  );
};

const ChatPanel = ({ messages }) => {
  const [newMessage, setNewMessage] = useState('');
  return (
    <div className="bg-[#2c2f33] w-80 p-3 flex flex-col">
      <h2 className="font-semibold text-white mb-3 px-1">Session Chat</h2>
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map(msg => (
          <div key={msg.id} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-300">{msg.sender}</span>
            <p className="text-gray-400 text-sm">{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 relative">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-[#40444b] rounded-md py-2 pl-3 pr-10 text-sm border-none focus:ring-0"
        />
        <button className="absolute inset-y-0 right-0 px-3 flex items-center">
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

// --- Main Session Page Component ---
const JoinSession = () => {
  const [sessionData, setSessionData] = useState(mockSessionData);
  const [activeTab, setActiveTab] = useState('problem'); // problem, whiteboard, code
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        activeTab === id ? 'bg-gray-600/50 text-white' : 'text-gray-400 hover:bg-gray-700/50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-[830px] w-full bg-[#36393f] text-gray-200 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-[#202225] p-3 flex items-center justify-between shrink-0 shadow-md w-full">
        <h1 className="text-lg font-semibold text-white">{sessionData.groupName} - Session</h1>
        <div className="flex items-center space-x-2">
            <span className="text-xs bg-green-500/20 text-green-400 font-bold px-2 py-1 rounded-full">LIVE</span>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400">Recording</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden w-full">
        <ParticipantsPanel participants={sessionData.participants} />
        
        <div className="flex-1 flex flex-col bg-[#36393f] p-4">
          <div className="flex items-center space-x-2 mb-4">
            <TabButton id="problem" label="Problem" />
            <TabButton id="whiteboard" label="Whiteboard" />
            <TabButton id="code" label="Code Editor" />
          </div>
          <div className="flex-1 bg-[#2c2f33] rounded-lg overflow-hidden">
            {activeTab === 'problem' && <div className="p-6 overflow-y-auto h-full"> {/* Replace with ProblemDisplay */} <h2 className="text-2xl font-bold text-white">{sessionData.problem.title}</h2> <p className="text-gray-400 mt-4">{sessionData.problem.description_md}</p> </div>}
            {activeTab === 'whiteboard' && <Tldraw />}
            {activeTab === 'code' && <div className="p-6"> {/* Replace with CodeEditor */} <CodeEditor/> </div>}
          </div>
        </div>

        <ChatPanel messages={sessionData.chatMessages} />
      </div>

      {/* Footer Control Bar */}
      <footer className="bg-[#202225] p-3 flex items-center justify-between shrink-0 border-t border-gray-700/50 w-full pb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>
            {isMuted ? <MicOffIcon /> : <MicOnIcon />}
          </button>
          <button onClick={() => setIsDeafened(!isDeafened)} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors">
            <HeadphoneIcon />
          </button>
        </div>
        <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition-colors">
            <ShareScreenIcon/>
            <span>Share Screen</span>
        </button>
        <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition-colors">
            <DisconnectIcon/>
            <span>Leave Session</span>
        </button>
      </footer>
    </div>
  );
};

export default JoinSession;
