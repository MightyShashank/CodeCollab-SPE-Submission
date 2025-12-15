import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input" // Assuming this is a styled input
import { useState } from "react";
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react';
import { Icon } from '@iconify/react';
import { userState, authProcessState } from '../../../recoil/atoms/authAtoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import './custom_scrollbar.css';
import { useRecoilState } from 'recoil';
import { activeModalState } from '../../../recoil/atoms/modalAtoms';
import toast from 'react-hot-toast';

// The base URL of your deployed API
// const API_URL = ' http://localhost:8085';
const API_URL = ' http://localhost:8085';

export default function SignUP({ isOpen, onOpenChange }) {

    // --- Component State ---
    const [accountType, setAccountType] = useState("individual");
    const [showPassword, setShowPassword] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false); // <-- NEW: State for final success
    const [verificationCode, setVerificationCode] = useState('');
    const [activeModal, setActiveModal] = useRecoilState(activeModalState);

    // --- Form Input State ---
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // --- Recoil State ---
    const setUser = useSetRecoilState(userState);
    const setAuthProcess = useSetRecoilState(authProcessState);
    const { isLoading, error } = useRecoilValue(authProcessState);

    // --- Form Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthProcess({ isLoading: true, error: null });

        if (password !== confirmPassword) {
            setAuthProcess({ isLoading: false, error: "Passwords do not match." });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong during signup.');
            }

            // On success, switch to the verification view
            setSignupSuccess(true);
            console.log('Signup successful, awaiting verification:', data);

        } catch (err) {
            setAuthProcess({ isLoading: false, error: err.message });
            console.error('Signup failed:', err);
        } finally {
            setAuthProcess(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setAuthProcess({ isLoading: true, error: null });

        try {
            const response = await fetch(`${API_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: verificationCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed.');
            }

            // now set the user
            
            console.log('Verification successful:', data);
            // On success, show the final success message
             // Replace alert with toast
            toast.success('Successfully Signed Up, Please Login!', { duration: 2000 });
            setVerificationSuccess(true);

        } catch (err) {
            setAuthProcess({ isLoading: false, error: err.message });
            console.error('Verification failed:', err);
        } finally {
            setAuthProcess(prev => ({ ...prev, isLoading: false }));
        }
    };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {/* <DialogTrigger asChild>
          <Button className="bg-indigo-500 rounded-md py-1.5 px-5 font-semibold cursor-pointer hover:bg-indigo-600">Sign Up</Button>
        </DialogTrigger> */}
        <DialogContent className="sm:max-w-[425px] bg-zinc-700 h-[600px] overflow-y-auto custom-scrollbar">

            {/* header */}
          <DialogHeader>
            <DialogTitle className="text-white border-b pb-4 border-zinc-600 font-bold">Join CodeCollab</DialogTitle>
          </DialogHeader>

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

            <form onSubmit={signupSuccess ? handleVerify : handleSubmit}>
                {accountType === "individual" && !signupSuccess && (
                <div className="flex items-center justify-center px-4">
                    <div className="w-full max-w-md space-y-3">
                    {/* Full name */}
                    <div>
                        <label className="text-sm text-white mb-2 block">Full Name</label>
                        <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
                            required
                        />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="text-sm text-white mb-2 block">Username</label>
                        <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
                            required
                        />
                        </div>
                    </div>

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
                            type={showPassword ? "text" : "password"}
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

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm text-white mb-2 block">Confirm Password</label>
                        <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                        <Lock className="w-5 h-5 mr-2" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
                            required
                        />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-center bg-indigo-500 font-semibold text-white text-sm py-3 rounded-md hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                        {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                        <div className="text-center text-zinc-400 text-sm">
                        Already have an account?{" "}
                        <a href="#" className="text-indigo-500 hover:underline">
                            Sign In
                        </a>
                        </div>
                    </div>
                    </div>
                </div>
                )}

                {signupSuccess && !verificationSuccess && (
                    <div className="p-6 text-center text-white flex flex-col items-center gap-y-4">
                        <p className="text-zinc-300">We've sent a verification code to your email.</p>
                        <div>
                            <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full text-center bg-indigo-500 font-semibold text-white text-sm py-3 rounded-md hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </div>
                )}

                {verificationSuccess && (
                    <div className="p-6 text-center text-white flex flex-col items-center gap-y-4">
                        <CheckCircle className="w-16 h-16 text-green-400" />
                        <h3 className="text-xl font-bold">Verification Successful!</h3>
                        <p className="text-zinc-300">
                            Your account has been verified. You can now log in.
                        </p>
                        {/* This button now updates the global state to open the login modal */}
                        <Button 
                            className="w-full bg-indigo-500 hover:bg-indigo-600"
                            onClick={() => setActiveModal('login')}
                        >
                            Login to Continue
                        </Button>
                    </div>
                )}

                {accountType==="company" && (
                <div className="flex items-center justify-center px-4">
                    <div className="w-full max-w-md space-y-3">
                        {/* Company name */}
                        <div>
                            <label className="text-sm text-white mb-2 block">Company Name</label>
                            <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                                <input
                                type="text"
                                placeholder="Enter your company name"
                                className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm text-white mb-2 block">Email Address</label>
                            <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                                <Mail className="w-5 h-5 mr-2" />
                                <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
                                />
                            </div>
                        </div>

                        {/* Company Size */}
                        <div>
                            <label className="text-sm text-white mb-2 block">Company Size</label>
                            <Select>
                                <SelectTrigger className="w-full text-white">
                                    <SelectValue placeholder="Select company size" className="text-white" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-700 border border-zinc-400 text-white">
                                    <SelectItem value="default" disabled>Select company size</SelectItem>
                                    <SelectItem value="1-10">1–10 employees</SelectItem>
                                    <SelectItem value="11-50">11–50 employees</SelectItem>
                                    <SelectItem value="51-200">51–200 employees</SelectItem>
                                    <SelectItem value="201-1000">201–1000 employees</SelectItem>
                                    <SelectItem value="1000+">1000+ employees</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                        

                        {/* Password */}
                        <div>
                            <label className="text-sm text-white mb-2 block">Password</label>
                            <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                                <Lock className="w-5 h-5 mr-2" />
                                <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
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

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm text-white mb-2 block">Confirm Password</label>
                            <div className="flex items-center px-3 py-2 bg-zinc-600 rounded-md text-zinc-300 justify-center focus-within:ring-2 focus-within:ring-indigo-500">
                                <Lock className="w-5 h-5 mr-2" />
                                <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
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
                            <button className="w-full text-center bg-indigo-500 font-semibold text-white text-sm py-3 rounded-md">Create Account</button>
                            <div className="text-center text-zinc-400 text-sm">
                                Already have an account? <a href="https://example.com" class="text-indigo-500 hover:underline">Sign In</a>
                            </div>
                        </div>

                    </div>
                </div>
                )}

            </form>
          </div>

        </DialogContent>
    </Dialog>
  )
}
