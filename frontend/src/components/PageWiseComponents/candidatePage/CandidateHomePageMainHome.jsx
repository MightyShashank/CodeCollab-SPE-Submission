import React from 'react'
import Sidebar from '@/components/ui/sidebar'
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"
import { useState } from 'react';
import { userState } from '../../../recoil/atoms/authAtoms'; 
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

function CandidateHomePageMainHome() {

    // Get the user data from the global state
    const user = useRecoilValue(userState);

    // If the user is not logged in (which shouldn't happen because of your router,
    // but it's good practice to check), you can show a loading or error message.
    if (!user) {
        return <div>Loading user data or not logged in...</div>;
    }
    
    return (
          
        <div className="flex-1 bg-zinc-800 text-white flex items-center justify-center">
            <div className="space-y-2 text-center">
            <div className="text-lg text-white font-semibold text-center">Welcome to CodeCollab, {user.display_name}</div>
            <div className="text-xs text-gray-500 text-center">Start by creating a group or joining a coding session</div>
            <div className="flex gap-x-2">
                <Button className="bg-blue-500 text-white">Manage Groups</Button>
                <Button variant="outline" className="">Start Session</Button>
                <Button variant="secondary" className="">Back To Home</Button>
            </div>
            </div>
        </div>

    )
}

export default CandidateHomePageMainHome