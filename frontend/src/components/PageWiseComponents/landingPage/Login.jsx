import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react";
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Icon } from '@iconify/react';
import { userState, authProcessState } from '../../../recoil/atoms/authAtoms';
import { activeModalState } from '../../../recoil/atoms/modalAtoms'; 
import toast from 'react-hot-toast';
import { useRecoilState } from "recoil";


// The base URL of your deployed API
// const API_URL = 'https://mostly-postfemoral-xenia.ngrok-free.dev';
const API_URL = 'https://mostly-postfemoral-xenia.ngrok-free.dev';

export default function Login({ isOpen, onOpenChange, navigate }) {

    const [activeModal, setActiveModal] = useRecoilState(activeModalState);

    const [accountType, setAccountType] = useState("individual");
    const [showPassword, setShowPassword] = useState(false);
    
    // --- Form Input State ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // --- Recoil State ---
    const setUser = useSetRecoilState(userState);
    const setAuthProcess = useSetRecoilState(authProcessState);
    const { isLoading, error } = useRecoilValue(authProcessState);

    // --- Form Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthProcess({ isLoading: true, error: null });

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // this was the issue earlier I forgot 
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong during login.');
            }

            setUser(data.user);
            console.log('Login successful:', data);
            console.log(`${JSON.stringify(data)}`);
            console.log(`${JSON.stringify(data.user)}`);
            
            // Replace alert with toast
            toast.success('Successfully logged in!', { duration: 2000 });

            // --- FIXED: Navigate to the home page on success ---
            navigate('/home'); 

            onOpenChange(false); // Close the dialog on success

        } catch (err) {
            setAuthProcess({ isLoading: false, error: err.message });
            console.error('Login failed:', err);
        } finally {
            setAuthProcess(prev => ({ ...prev, isLoading: false }));
        }
    };


  return (
    <Dialog className="sm:max-w-[425px] bg-zinc-700 h-[600px] overflow-y-auto" open={isOpen} onOpenChange={onOpenChange}>
        {/* <DialogTrigger asChild>
          <Button className="bg-zinc-800 rounded-md py-1 px-2 font-semibold cursor-pointer hover:text-indigo-500 text-base hover:bg-zinc-800">Login</Button>
        </DialogTrigger> */}
        <DialogContent className="sm:max-w-[425px] bg-zinc-700">

            {/* header */}
          <DialogHeader>
            <DialogTitle className="text-white border-b pb-4 border-zinc-600 font-bold">Welcome Back!</DialogTitle>
          </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* content */}
          <div className="pb-4 flex flex-col gap-y-4">

            {/* Account type */}
            <div className="gap-y-2 flex flex-col items-center">
                <div className="text-sm w-full text-left font-semibold text-white">Account Type</div>
                <div className="flex gap-x-3 mb-4 w-full">
                    {/* Individual */}
                    <div className={`border border-zinc-600 rounded-md flex flex-col gap-y-1 items-center w-full cursor-pointer py-3 ${accountType==="individual"? "bg-indigo-500":""}`} onClick={() => setAccountType("individual")}>
                        <Icon icon="bx:user" width="24" height="24"  className="text-white" />
                        <div className="text-sm font-bold text-white">Individual</div>
                        <div className={`text-xs font-normal text-zinc-400 ${accountType==="individual"? "text-white":""}`}>Personal Account</div>
                    </div>

                    {/* Company */}
                    <div className={`border border-zinc-600 rounded-md flex flex-col gap-y-1 items-center w-full cursor-pointer py-3 ${accountType==="company"? "bg-indigo-500":""} `} onClick={() => setAccountType("company")}>
                        <Icon icon="mdi:company" width="24" height="24"  className="text-white" />
                        <div className="text-sm font-bold text-white">Company</div>
                        <div className="text-xs font-normal text-zinc-400">Team Account</div>
                    </div>
                </div>
                <div className="w-full bg-white flex justify-center gap-x-2 rounded-md py-3 cursor-pointer hover:bg-gray-100">
                    <Icon icon="devicon:google" width="22" height="22" />
                    <div className="text-black font-semibold text-sm">Continue with Google</div>
                </div>
            </div>

            {/* or */}
            <div className="flex items-center gap-4 w-full">
                <hr className="flex-grow border-t border-zinc-600" />
                <span className="text-sm text-zinc-400">or</span>
                <hr className="flex-grow border-t border-zinc-600" />
            </div> 

            {/* <div className="grid gap-4">
                <div className="grid gap-3">
                    <Label htmlFor="name-1">Account Type</Label>
                    <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="username-1">Username</Label>
                    <Input id="username-1" name="username" defaultValue="@peduarte" />
                </div>
            </div> */}

            <div className="flex items-center justify-center px-4">
                <div className="w-full max-w-md space-y-3">
                    {/* Email */}
                    <div>
                        <label className="text-sm text-white mb-2 block">Email Address</label>
                        <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                            <Mail className="w-5 h-5 mr-2" />
                                <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm text-white mb-2 block">Password</label>
                        <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                            <Lock className="w-5 h-5 mr-2" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
                            required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="focus:outline-none ml-2"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-3 h-3" />
                                ) : (
                                    <Eye className="w-3 h-3" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full text-center bg-indigo-500 font-semibold text-white text-sm py-3 rounded-md hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                        <div className="text-center text-zinc-400 text-sm">
                            Don't have an account? 
                            <button onClick={() => setActiveModal("signup")} className="text-indigo-500 hover:underline pl-1">Sign Up</button>
                            {/* <a href="#" className="text-indigo-500 hover:underline">Sign Up</a> */}
                        </div>
                    </div>

                </div>
            </div>

          </div>
        </form>
        </DialogContent>
    </Dialog>
  )
}
