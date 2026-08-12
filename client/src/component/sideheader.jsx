import React from "react";

import { MdKeyboardArrowUp } from "react-icons/md";

import Gochatimage from "../assets/Gochat.png";

const Sideheader = () => {
  return (
    <>
      <div>
        <div className="w-full h-21 ps-12  bg-white flex items-center">
          <img
            src={Gochatimage}
            alt="chatlogo"
            className="w-48 p-3  h-20 items-center "
            
          />
          <div className="text-black space-x-11 px-16">
            <nav className="flex  gap-8 text-black text-[18.5px] space-x-2.5 items-center pt-2">
              <div className="relative inline-block group">
                {/* Features */}
                <span
                  className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
          text-black
          transition-all duration-300
          hover:border-green-500
          hover:text-green-500
          inline-flex items-center gap-1
        "
                >
                  Features
                  <span className="text-l transition-transform duration-300 group-hover:-rotate-180">
                    <MdKeyboardArrowUp />
                  </span>
                </span>

                {/* Dropdown directly below Features */}
                <div
                  className="
                  text-[17px]
          absolute
          left-0
          top-full
          z-50
          mt-2
          w-56

          rounded-4xl
          border
          border-gray-100
          bg-white
          p-2
          shadow-lg

          invisible
          translate-y-15
          opacity-0

          transition-all
          duration-300
          ease-out

          group-hover:visible
          group-hover:translate-y-0
          group-hover:opacity-100
        "
                >
                  <a
                    href="https://www.whatsapp.com/calling"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-black transition-all duration-300 hover:border-green-500 hover:text-green-500"
                  >
                    Calling
                  </a>

                  <a
                    href="https://www.whatsapp.com/messaging"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-black transition-all duration-300 hover:border-green-500 hover:text-green-500"
                  >
                    Messaging
                  </a>

                  <a
                    href="https://www.whatsapp.com/groups"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-black transition-all duration-300 hover:border-green-500 hover:text-green-500"
                  >
                    Groups
                  </a>

                  <a
                    href="https://www.whatsapp.com/channels"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-black transition-all duration-300 hover:border-green-500 hover:text-green-500"
                  >
                    Channels
                  </a>

                  <a
                    href="https://www.whatsapp.com/meta-ai"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-black transition-all duration-300 hover:border-green-500 hover:text-green-500"
                  >
                    Meta AI
                  </a>

                  <a
                    href="https://www.whatsapp.com/status"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-black transition-all duration-300 hover:border-green-500 hover:text-green-500"
                  >
                    Status
                  </a>

                  <a
                    href="https://www.whatsapp.com/security"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-black transition-all duration-300 hover:border-green-500 hover:text-green-500"
                  >
                    Security
                  </a>

                  <a
                    href="https://www.whatsapp.com/whatsapp-plus"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-black transition-all duration-300 hover:border-green-500 hover:text-green-500"
                  >
                    WhatsApp Plus
                  </a>
                </div>
              </div>

              <span
                className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
           text-black
          transition-all duration-300
          hover:border-green-500
          hover:text-green-500
        "
              >
                Privacy
              </span>

              <span
                className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
           text-black
          transition-all duration-300
          hover:border-green-500
          hover:text-green-500
        "
              >
                Blog
              </span>

              <span
                className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
           text-black
          transition-all duration-300
          hover:border-green-500
          hover:text-green-500
        "
              >
                Apps
              </span>

              <span
                className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
           text-black
          transition-all duration-300
          hover:border-green-500
          hover:text-green-500
        "
              >
                Help Center
              </span>

              <span
                className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
           text-black
          transition-all duration-300
          hover:border-green-500
          hover:text-green-500
        "
              >
                For Bussiness
              </span>
            </nav>
          </div>
          <div>
            <button
  className="
    group
    relative
    overflow-hidden
    rounded-full
    border-2 border-black
    bg-white
    px-9 py-2.5
    font-medium
    text-green-500
    transition-all duration-300
  "
>
  {/* Green fill */}
  <span
    className="
      absolute inset-0
      origin-left
      scale-x-0
      bg-green-500
      transition-transform duration-300 ease-out
      group-hover:scale-x-100
    "
  />

  {/* Text */}
  <span
    className="
      relative z-10
      transition-colors duration-300
      group-hover:text-black
    "
  >
    Login
  </span>
</button>
          </div>
        </div>
      </div>


      
    </>
  );
};

export default Sideheader;
