import React, { useState } from "react";
import { userData } from "../../public/dummy.js";
import Chatting from "../component/Chatting.jsx";

const chatPage = () => {
  const [chatPage, setChatPage] = useState(userData);

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isOpenChat, setIsOpenChat] = useState(false);
  return (
    <>
      <div className="flex   ">
        <div className=" w-3/17 text-center bg-amber-200">
          

          {userData.map((user, idx) => (
            <div
              className="cursor-pointer"
              key={idx}
              onClick={() => (setSelectedFriend(user), setIsOpenChat(true))}
            >
              {user.name}
            </div>
          ))}
        </div>
        <div className=" border w-14/17">
          {selectedFriend ? (
            <Chatting selectedFriend={selectedFriend} />
          ) : (
            <div>select a Friend to start a chat</div>
          )}
        </div>
      </div>
    </>
  );
};

export default chatPage;
