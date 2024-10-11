import { useState, useRef, useEffect } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import EmojiPicker from "emoji-picker-react"; // Ensure this is installed
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";
import upload from "../../lib/upload";
import "./chat.css";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);
  const [img, setImg] = useState({ file: null, url: "" });
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const endRef = useRef(null);

  // Scroll to the bottom of the chat when it loads
  useEffect(() => {
    if (chat) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  // Fetch chat data from Firestore if chatId exists
  useEffect(() => {
    if (!chatId) return; // Ensure chatId is valid

    const chatDocRef = doc(db, "chats", chatId);
    const unSub = onSnapshot(chatDocRef, (res) => {
      setChat(res.data());
    });

    return () => unSub(); // Cleanup subscription when chatId changes
  }, [chatId]);

  // Handle emoji selection
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  // Handle sending messages
  const handleSend = async () => {
    if (text === "" && !img.file) return; // Prevent sending empty messages

    try {
      let imgUrl = null;
      if (img.file) {
        imgUrl = await upload(img.file); // Upload image if present
      }

      const messageData = {
        senderId: currentUser.id,
        text,
        createdAt: new Date(),
        ...(imgUrl && { img: imgUrl }), // Include image URL if exists
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(messageData),
      });

      // Update user chats with the last message
      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, { chats: userChatsData.chats });
          }
        }
      });
    } catch (err) {
      console.log(err); // Log error for debugging
    } finally {
      // Reset input and image state
      setImg({ file: null, url: "" });
      setText("");
    }
  };

  // Handle image selection
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  return (
    <div className="chat">
      {/* Top section: User details and action icons */}
      <div className="top">
        <div className="user">
          <img
            src={user?.avatar || "./avatar.png"}
            alt="User Avatar"
            style={{ cursor: "pointer" }}
          />
          <div className="texts" style={{ cursor: "pointer" }}>
            <span>{user?.username}</span>
            <p>Online</p>
          </div>
        </div>
        <div className="icons">
          <img
            src="./info.png"
            alt="Info Icon"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Center section: Chat messages */}
      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message.createdAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        {/* End reference to scroll */}
        <div ref={endRef}></div>
      </div>

      {/* Bottom section: Input, emoji picker, and send button */}
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="Image Icon" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
          <img src="./camera.png" alt="Camera Icon" />
          <img src="./mic.png" alt="Mic Icon" />
        </div>

        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />

        <div className="emoji">
          <img
            src="./emoji.png"
            alt="Emoji Icon"
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && <EmojiPicker onEmojiClick={handleEmoji} />} {/* Ensure EmojiPicker is displayed */}
        </div>

        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          &gt; Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
