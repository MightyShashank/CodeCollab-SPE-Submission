import React, { useState, useMemo } from 'react';

// --- Helper Components & Icons ---

const CrownIcon = () => (
  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M11.05 3.001a1 1 0 00-2.1 0L6.4 8.642a1 1 0 00.95 1.42h6.3a1 1 0 00.95-1.42L11.05 3.001zM5.385 9.642a1 1 0 00-1.71 1.05l1.414 1.414a1 1 0 001.414 0l-1.118-1.118a1 1 0 00-.95-1.346zM16.329 10.692a1 1 0 00-1.71-1.05l-1.118 1.118a1 1 0 001.414 1.414l1.414-1.414zM12 14a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
    <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
  </svg>
);

const ChatIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
    </svg>
);
const ActiveCallIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
    </svg>
);
const AddUserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
    </svg>
);
const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>
);
const DeleteIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
);

// ✅ NEW ICONS
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);
const UsersIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);


const UserAvatar = ({ name, isOwner }) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-purple-500'];
  const color = colors[name.length % colors.length];

  return (
    <div className="relative group">
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-sm font-bold text-white ring-2 ring-[#2c2f33]`}>
        {initials}
        <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full bg-green-400 border-2 border-[#2c2f33]"></span>
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {name}
        {isOwner && <span className="text-yellow-400"> (Owner)</span>}
      </div>
    </div>
  );
};

// --- Mock Data ---
const mockGroups = [
  { id: 1, name: 'Algorithm Masters', description: 'Daily DSA practice group', members: 12, activeSince: '2 hours ago', code: 'ALG123', onlineMembers: [{ name: 'Alice', isOwner: true }, { name: 'Bob', isOwner: false }, { name: 'Carol', isOwner: false }], otherOnline: 1 },
  { id: 2, name: 'LeetCode Warriors', description: 'Competitive programming focus', members: 8, activeSince: '1 day ago', code: 'LC456', onlineMembers: [{ name: 'Emma', isOwner: false }, { name: 'Frank', isOwner: true }, { name: 'Grace', isOwner: false }], otherOnline: 0 },
  { id: 3, name: 'Interview Prep', description: 'FAANG interview preparation', members: 15, activeSince: '30 minutes ago', code: 'INT789', onlineMembers: [{ name: 'Henry', isOwner: false }, { name: 'Ivy', isOwner: true }, { name: 'Jack', isOwner: false }], otherOnline: 0 },
];

// --- Main Page Component ---
const GroupPage = () => {
  const [groups, setGroups] = useState(mockGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    return groups.filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [groups, searchQuery]);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy text: ', err));
  };

  const GroupCard = ({ group }) => (
    <div className="bg-zinc-700 rounded-lg p-4 flex flex-col space-y-4 border border-transparent hover:border-gray-600/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shrink-0">
            {group.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
                <h3 className="font-semibold text-white">{group.name}</h3>
                {group.onlineMembers.some(m => m.isOwner) && <CrownIcon />}
            </div>
            <p className="text-sm text-gray-400">{group.description}</p>
          </div>
        </div>
        <div className="w-2.5 h-2.5 bg-green-400 rounded-full mt-1 shrink-0"></div>
      </div>
      
      <div className="text-xs text-gray-400 flex items-center justify-between">
        {/* ✅ EDITED: Added members icon */}
        <div className="flex items-center space-x-1.5">
            <UsersIcon />
            <span>{group.members} members</span>
        </div>
        <span>Active {group.activeSince}</span>
      </div>

      <div className="flex items-center space-x-2 bg-[#202225] p-1.5 rounded-md">
        <span className="font-mono text-xs text-gray-400 flex-1">Code: {group.code}</span>
        <button onClick={() => copyToClipboard(group.code)} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-600">
          <CopyIcon />
        </button>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Members Online</h4>
        <div className="flex items-center">
          {group.onlineMembers.map((member, index) => (
            <div key={member.name} style={{ zIndex: group.onlineMembers.length - index }} className="-ml-2 first:ml-0">
              <UserAvatar name={member.name} isOwner={member.isOwner} />
            </div>
          ))}
          {group.otherOnline > 0 && (
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-300 ring-2 ring-[#2c2f33] -ml-2 z-0">
              +{group.otherOnline}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex flex-col space-y-3">
        <button className="w-full bg-[#5865F2] hover:bg-[#4f5bda] text-white font-semibold py-2.5 rounded-md transition-colors">
          Join Session
        </button>
        <div className="flex items-center justify-between text-gray-400 px-1">
            <button className="p-2 rounded-lg hover:bg-gray-700/80 hover:text-white transition-colors"><ChatIcon /></button>
            <button className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"><ActiveCallIcon /></button>
            <button className="p-2 rounded-lg hover:bg-gray-700/80 hover:text-white transition-colors"><AddUserIcon /></button>
            <button className="p-2 rounded-lg hover:bg-gray-700/80 hover:text-white transition-colors"><SettingsIcon /></button>
            <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"><DeleteIcon /></button>
        </div>
      </div>
    </div>
  );

  const Modal = ({ isOpen, onClose, title, children }) => {
      if (!isOpen) return null;
      return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
              <div className="bg-[#36393f] rounded-lg shadow-xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                  <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                  <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
                  {children}
              </div>
          </div>
      );
  };

  return (
    <div className="h-screen bg-zinc-800 text-gray-200 font-sans p-4 sm:p-6 lg:p-8 w-full">
      <div className="w-full mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white pt-6">My Groups</h1>
          <p className="text-gray-400 pt-2">Manage your coding groups and collaborations</p>
          
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:flex-1">
              <input 
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-700 border border-transparent focus:border-[#5865F2] focus:ring-0 rounded-md py-2 pl-10 pr-4 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* ✅ EDITED: Added icons to buttons */}
              <button onClick={() => setJoinModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center space-x-2 text-sm font-semibold bg-gray-600/50 hover:bg-gray-600/80 text-white py-2 px-4 rounded-md transition-colors">
                <PlusIcon />
                <span>Join Group</span>
              </button>
              <button onClick={() => setCreateModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center space-x-2 text-sm font-semibold bg-[#5865F2] hover:bg-[#4f5bda] text-white py-2 px-4 rounded-md transition-colors">
                <PlusIcon />
                <span>Create Group</span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => <GroupCard key={group.id} group={group} />)}
        </main>
      </div>

      <Modal isOpen={isJoinModalOpen} onClose={() => setJoinModalOpen(false)} title="Join a Group">
          <p className="text-sm text-gray-400 mb-4">Enter a group code below to join an existing group.</p>
          <input type="text" placeholder="Enter group code..." className="w-full bg-[#202225] border border-transparent focus:border-[#5865F2] focus:ring-0 rounded-md py-2 px-4 text-sm mb-4" />
          <button className="w-full bg-[#5865F2] hover:bg-[#4f5bda] text-white font-semibold py-2.5 rounded-md transition-colors">Join</button>
      </Modal>

      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create a New Group">
          <p className="text-sm text-gray-400 mb-4">Fill out the details to create your own group.</p>
          <input type="text" placeholder="Group Name" className="w-full bg-[#202225] border border-transparent focus:border-[#5865F2] focus:ring-0 rounded-md py-2 px-4 text-sm mb-4" />
          <textarea placeholder="Group Description" rows="3" className="w-full bg-[#202225] border border-transparent focus:border-[#5865F2] focus:ring-0 rounded-md py-2 px-4 text-sm mb-4 resize-none"></textarea>
          <button className="w-full bg-[#5865F2] hover:bg-[#4f5bda] text-white font-semibold py-2.5 rounded-md transition-colors">Create</button>
      </Modal>

    </div>
  );
};

export default GroupPage;
