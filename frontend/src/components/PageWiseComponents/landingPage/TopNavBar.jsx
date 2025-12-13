import React from 'react';
import { Icon } from '@iconify/react';
import Login from './Login';
import SignUP from './SignUp';
import { useRecoilState } from 'recoil';
import { activeModalState } from '../../../recoil/atoms/modalAtoms'; 
import { Button } from "@/components/ui/button"; 

export default function TopNavBar({ navigate }) {
    const [activeModal, setActiveModal] = useRecoilState(activeModalState);

    return (
        <div className="bg-zinc-800 flex justify-between w-full h-16 items-center px-4">
            {/* Icon and Options sections remain the same */}
            <div className="flex gap-x-2 items-center">
                <div className="bg-indigo-500 rounded-md p-1">
                    <Icon icon="material-symbols:code-rounded" width="26" height="26" className='text-white' />
                </div>
                <div className="text-lg font-semibold text-white">CodeCollab</div>
            </div>
            <div className="flex gap-x-5 text-white items-center">
                <div className="text-base font-normal cursor-pointer hover:text-indigo-500">Features</div>
                <div className="text-base font-normal cursor-pointer hover:text-indigo-500">About</div>
                <div className="text-base font-normal cursor-pointer hover:text-indigo-500">Contact</div>
            </div>

            {/* Login or Signup Buttons */}
            <div className="flex gap-x-4 text-white items-center">
                {/* These buttons now just change the global state */}
                <Button onClick={() => setActiveModal('login')} className="bg-zinc-800 rounded-md py-1 px-2 font-semibold cursor-pointer hover:text-indigo-500 text-base hover:bg-zinc-800">Login</Button>
                <Button onClick={() => setActiveModal('signup')} className="bg-indigo-500 rounded-md py-1.5 px-5 font-semibold cursor-pointer hover:bg-indigo-600">Sign Up</Button>
            </div>

            {/* The actual dialog components are now controlled by the global state */}
            <Login isOpen={activeModal === 'login'} onOpenChange={() => setActiveModal(null)} navigate={navigate} />
            <SignUP isOpen={activeModal === 'signup'} onOpenChange={() => setActiveModal(null)} />
        </div>
    );
}