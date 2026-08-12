import React from "react";

import Gochatimage from "../assets/Gochat.png";

const Sideheader = () => {
  return (
    <>
      <div className="w-full h-25 ps-9 bg-white">
        <img src={Gochatimage} alt="chatlogo" className="w-55 p-2 h-27 " />
      </div>
    </>
  );
};

export default Sideheader;
