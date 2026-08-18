import React, { useState } from "react";

import { MdKeyboardArrowUp } from "react-icons/md";

import Gochatimage from "../assets/Gochat.png";
import { MdOutlineWhatsapp } from "react-icons/md";

const Sideheader = () => {
 const [selectedTheme, setSelectedTheme] = useState("light");

  const handleThemeChange = (e) => {
    const theme = e.target.value;
    setSelectedTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  };
  
  return (
    <>
      <div className="top-0  sticky z-99">
        <div className="w-full h-21 ps-12 text-warning-content  bg-primary flex items-center">
          <h1 className="font-semibold flex text-2xl items-center font-serif   text-warning-content">
            <MdOutlineWhatsapp className="text-3xl font-extrabold" />
            go.chat
          </h1>
          <div className="text-warning-content space-x-11 px-16">
            <nav className="flex  gap-8 text-primary-content space-x-2.5 items-center text-l pt-2">
              <div className="relative inline-block group text-primary-content text-xl font-serif">
                {/* Features */}
                <span
                  className=" 
          cursor-pointer
          border-b-2 border-transparent
          pb-2
       text-base-content
          transition-all duration-300
          hover:bg-primary
          hover:text-primary-content
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
 bg-accent
text-xl font-serif
          rounded-4xl
          border
          border-gray-100
         text-base-content
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
                    className="block border-b-2 border-transparent text-base-content rounded-lg px-4 py-2.5  transition-all duration-300  hover:border-neutral-content hover:text-neutral-content"
                  >
                    Calling
                  </a>

                  <a
                    href="https://www.whatsapp.com/messaging"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-base-content transition-all duration-300  hover:border-neutral-content hover:text-neutral-content"
                  >
                    Messaging
                  </a>

                  <a
                    href="https://www.whatsapp.com/groups"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-base-content transition-all duration-300 hover:border-neutral-content hover:text-neutral-content"
                  >
                    Groups
                  </a>

                  <a
                    href="https://www.whatsapp.com/channels"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-base-content transition-all duration-300  hover:border-neutral-content hover:text-neutral-content"
                  >
                    Channels
                  </a>

                  <a
                    href="https://www.whatsapp.com/meta-ai"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-base-content transition-all duration-300  hover:border-neutral-content hover:text-neutral-content"
                  >
                    Meta AI
                  </a>

                  <a
                    href="https://www.whatsapp.com/status"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-base-content transition-all duration-300  hover:border-neutral-content hover:text-neutral-content"
                  >
                    Status
                  </a>

                  <a
                    href="https://www.whatsapp.com/security"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-base-content transition-all duration-300  hover:border-neutral-content hover:text-neutral-content"
                  >
                    Security
                  </a>

                  <a
                    href="https://www.whatsapp.com/whatsapp-plus"
                    className="block border-b-2 border-transparent rounded-lg px-4 py-2.5 text-base-content transition-all duration-300  hover:border-neutral-content hover:text-neutral-content"
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
          text-xl font-serif
        text-base-content
          transition-all duration-300
           hover:border-neutral-content hover:text-neutral-content
        "
              >
                Privacy
              </span>

              <span
                className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
          text-xl font-serif
          text-base-content
          transition-all duration-300
          hover:border-neutral-content hover:text-neutral-content
        "
              >
                Blog
              </span>

              <span
                className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
        text-base-content   text-xl font-serif
          transition-all duration-300
          hover:border-neutral-content hover:text-neutral-content
        "
              >
                Apps
              </span>

              <span
                className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
        text-base-content text-xl font-serif
          transition-all duration-300
          hover:border-neutral-content hover:text-neutral-content
        "
              >
                Help Center
              </span>

              <span
                className="
          cursor-pointer
          border-b-2 border-transparent
          pb-2
           text-base-content
        
          transition-all duration-300 text-xl font-serif
          hover:border-neutral-content hover:text-neutral-content
        "
              >
                For Bussiness
              </span>
              {/* for theme  */}

              <select
                className=" select select-bordered rounded-3xl items-center w-30 h-11 font-serif ms-3  mb-2.5   bg-accent text-black text-xl"
                name="theme"
                id="theme"
                value={selectedTheme}
                onChange={handleThemeChange}
              >
                <option disabled value="Theme">
                  {" "}
                  Theme
                </option>
                <option value="light">light</option>
                <option value="dark">Dark</option>
                <option value="black">Black</option>
                <option value="claude">Claude</option>
                <option value="corporate">Corporate</option>
                <option value="gibhli">Gibhli</option>
                <option value="gourmet">Gourmet</option>
                <option value="luxury">Luxury</option>
                <option value="mintifly">Mintifly</option>
                <option value="pastel">Pastel</option>
                <option value="perplexiy">Perplexity</option>
                <option value="shadcn">Shadcn</option>
                <option value="slack">Slack</option>
                <option value="spotify">Spotify</option>
                <option value="valorant">Valorant</option>
                <option value="vscode">Vscode</option>
              </select>
            </nav>
          </div>

          <div>
            <button
              className="
    group
    relative
    overflow-hidden
    rounded-full
     bg-accent
    
    px-9 py-2.5
    font-medium
    hover:border-neutral-content hover:text-neutral-content
    transition-all duration-300
  "
            >
              {/* Text */}
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sideheader;
