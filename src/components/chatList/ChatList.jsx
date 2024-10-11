import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { db } from "../../lib/firebase"; // Firebase initialized here
import { doc, onSnapshot, getDoc, collection, query, where, updateDoc } from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore"; // Assuming you have this hook to get chat context

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore(); // Assuming you have this function to change chat

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const items = res.data().chats;
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId); // Fixed typo here
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.data(); // Corrected variable name
        return { ...item, user };
      });
      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChatsRef = doc(db, "userchats", currentUser.id);
    const userChatsSnapshot = await getDoc(userChatsRef);
    if (userChatsSnapshot.exists()) {
      const userChatsData = userChatsSnapshot.data();
      const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chat.chatId);

      if (chatIndex !== -1) {
        userChatsData.chats[chatIndex].isSeen = true; // Set message seen status
        userChatsData.chats[chatIndex].updatedAt = Date.now(); // Update timestamp

        await updateDoc(userChatsRef, { chats: userChatsData.chats });
      }
      changeChat(chat.chatId, chat.user); // Change the chat context
    }
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="Search" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Add"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {chats.length > 0 ? (
        chats.map((chat) => (
          <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat.isSeen ? "transparent" : "#5183fe",
            cursor: "pointer", // Add cursor pointer here
          }}
        >
        
            <div className="user">
              <img src={chat.user?.avatar || "./avatar.png"} alt="User Avatar" />
              <div className="texts">
                <span>{chat.user?.username || "Unknown User"}</span>
                <p>{chat.lastMessage || "No messages yet"}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No chats available</p>
      )}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
