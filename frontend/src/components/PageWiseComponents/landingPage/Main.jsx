import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

export default function Main() {

    const items = [
        {
            icon: "material-symbols:code",
            title: "Real-time Code Collaboration",
            description: "Write code together in real-time with syntax highlighting and live cursors"
        },
        {
            icon: "octicon:people-24",
            title: "Group Problem Solving",
            description: "Create or join groups to tackle DSA problems from Leetcode, Codeforces, and Codechef"
        },
        {
            icon: "basil:video-outline",
            title: "Integrated Video Calls",
            description: "Communicate face-toface while coding with built-in video conferencing"
        },
        {
            icon: "circum:pen",
            title: "Interactive Whiteboard",
            description: "Draaw diagrams and explain algorithms with ExcaliDraw support"
        },
        {
            icon: "hugeicons:ai-chat-02",
            title: "AI-Powered Hints",
            description: "Get contextual hints and guidance from our intelligent AI assistant"
        },
        
    ];
    return(
        <div className="flex flex-col">

            {/* Section 1 */}
            <div className="flex flex-col gap-y-7 w-full pb-28">
                <div className="text-gray-300 font-semibold text-2xl text-center pt-24">
                    The ultimate collaborative platform for solving Data structures and <br/>
                    Algorithms problems with your team in real-time 
                </div>
                <div className="flex gap-x-4 justify-center">
                    <div className="flex gap-x-2 justify-center items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-zinc-400">Real-time collaboration</span>
                    </div>
                    <div className="flex gap-x-2 justify-center items-center">
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-zinc-400">Integrated video calls</span>
                    </div>
                    <div className="flex gap-x-2 justify-center items-center">
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-zinc-400">AI-powered hints</span>
                    </div>
                    <div className="flex gap-x-2 justify-center items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-zinc-400">Interactive whiteboard</span>
                    </div>
                </div>
                <div className="flex gap-x-4 justify-center">
                    <div className="py-3 px-6 flex gap-x-2 text-base font-normal items-center bg-indigo-500 rounded-md cursor-pointer transform transition duration-300 ease-in-out hover:bg-indigo-600 hover:scale-105">
                        <div className="text-white">Start Coding Now</div>
                        <Icon icon="maki:arrow" width="14" height="14" className="text-white" />
                    </div>

                    <div className="py-3 px-6 flex gap-x-2 text-base font-normal items-center bg-none border border-indigo-500 rounded-md cursor-pointer transform transition duration-300 ease-in-out text-indigo-500 hover:text-white">
                        <Icon icon="mdi-light:play" width="30" height="30" className="" />
                        <div className="">Watch Demo</div>
                    </div>
                </div>
                <div className="flex flex-col justify-center gap-y-2">
                    <div className="text-gray-300 text-center w-full">Join thousands of developers already collaborating</div>
                    <div className="flex justify-center gap-x-4">
                        <div className="flex gap-x-2 justify-center items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-zinc-400">Free to start</span>
                        </div>
                        <div className="flex gap-x-2 justify-center items-center">
                            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-zinc-400">No credit card required</span>
                        </div>
                        <div className="flex gap-x-2 justify-center items-center">
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-zinc-400">Setup in 30 seconds</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2 */}
             <div className="grid grid-cols-3 grid-rows-2 gap-6 pb-28">
                {items.map((item, index) => (
                    <div key={index} className="flex flex-col gap-y-2 bg-zinc-700 p-6 rounded-lg cursor-pointer hover:bg-zinc-600 transform transition duration-300 ease-in-out">
                        <Icon icon={item.icon} width="32" height="32" className="text-indigo-500" />
                        <div className="text-base font-semibold text-white">{item.title}</div>
                        <div className="text-sm font-normal text-gray-400">{item.description}</div>
                    </div>
                ))}
            </div>

            {/* Section 3 */}
            <div className="flex flex-col gap-y-5 items-center justify-center pb-28">
                <div className="text-white font-bold text-3xl text-center">Ready to revolutionize your coding sessions?</div>
                <div className="text-gray-300 text-base text-center">Join thousands of developers already collaborating on CodeCollab</div>
                <div className="bg-white text-indigo-500 font-semibold px-4 py-3 cursor-pointer rounded-md text-center w-fit flex justify-center items-center hover:bg-gray-100 transform transition duration-300 ease-in-out">Get Started for Free</div>
            </div>
        </div>
    );
}