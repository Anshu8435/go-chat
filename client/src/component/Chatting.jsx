import React, { useEffect, useState } from "react";
import { chatData, userData } from "../../public/dummy";

const Chatting = ({ selectedFriend, currentUser }) => {
  const [filteredChatData, setFilteredChatData] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [sender, setSender] = useState("");

  useEffect(() => {
    setFilteredChatData(() => {
      chatData.filter(
        (chat) =>
          (chat.senderId === 1 && chat.receiverId === selectedFriend.id) ||
          (chat.receiverId === 1 && chat.senderId === selectedFriend.id),
      );

      setSender(() => userData.find((user) => user.id == currentUser));
      setReceiver(() =>
        userData.find((user) => user.id == selectedFriend.filteredChatData),
      );
    }, [selectedFriend]);
  });
  return (
    <>
      <div>
        <div>
          <div className="border p-2 ">{selectedFriend?.name || "no chat"}</div>
        </div>

        <div className=" p-3 flex flex-col gap-3">
          <div className="h-[70vh] w-full card"></div>
          <div className="h-full inpit flex gap-3 p-3">
            <textarea type="text" className="input outline-0" />
            <button>send</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatting;
