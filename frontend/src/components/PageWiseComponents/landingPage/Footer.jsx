import React from 'react';
import { Icon } from '@iconify/react';

export default function Footer() {

    return (
        <div className=''>
            {/* Top */}
            <div className="text-white flex flex-col gap-y-4 justify-between bg-zinc-800 items-center">

                <div className="flex justify-between items-center w-full">
                    {/* Icon */}
                    <div className="flex justify-between items-center gap-x-1">
                        <div className="bg-indigo-500 rounded-md p-0.5">
                            <Icon icon="material-symbols:code-rounded" width="16" height="16"  className='text-white' />
                        </div>
                        <div className="text-sm font-semibold text-white">CodeCollab</div>
                    </div>
                    

                    {/* Social Media */}
                    <div className="flex justify-between gap-x-2">
                        <Icon icon="ri:github-line" width="24" height="24" className='text-white' />
                        <Icon icon="meteor-icons:twitter" width="24" height="24"  className='text-white'  />
                        <Icon icon="uit:linkedin-alt" width="24" height="24"  className='text-white'  />
                    </div>
                </div>

                {/* All rights reserved */}
                <div className="flex justify-between items-center pb-8 pt-4">
                    <div className="text-white text-xs flex gap-x-1 items-center">
                        <Icon icon="tdesign:copyright" width="12" height="12"  className='text-white'/> 
                        <div className="">2024 CodeCollab. All rights reserved.</div>
                    </div>
                </div>

            </div>
        </div>
    );
}