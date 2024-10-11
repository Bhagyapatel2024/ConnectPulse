import "./detail.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { signOut } from "firebase/auth";
import { useChatStore } from "../../lib/chatStore";
import { arrayUnion, arrayRemove, updateDoc, doc } from "firebase/firestore"; // Ensure all necessary imports
import { db } from "../../lib/firebase"; // Import the Firestore database reference

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;
    
    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="Arrow Down" />
          </div>
          <div className="photos">
            {Array(2).fill(null).map((_, index) => (
              <div className="photoItem" key={index}>
                <div className="photoDetail">
                  <img src="./bg.jpg" alt="Shared Photo" />
                  <span>photo_2024</span>
                </div>
                <img src="./download.png" className="icon" alt="Download Icon" />
              </div>
            ))}
          </div>
        </div>

        <button className="button" onClick={() => signOut(auth)}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>

        <button className="button" onClick={handleBlock}>
          <i className="fas fa-ban"></i> 
          {isCurrentUserBlocked ? "You are blocked" : isReceiverBlocked ? "User blocked" : "Block User"}
        </button>
      </div>
    </div>
  );
};

export default Detail;
