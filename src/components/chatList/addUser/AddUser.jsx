import React, { useState } from "react";
import "./addUser.css";
import { db } from "../../../lib/firebase"; // Adjusted path
import { collection, query, where, getDocs, setDoc, serverTimestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useUserStore(); // Renamed currentUser to storeUser

  const handleAdd = async () => {
 
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
  
    try {
    
      const newChatRef = doc(chatRef);
      const timestamp = serverTimestamp(); // Get the server timestamp
  
      // Set the new chat document with the createdAt timestamp
      await setDoc(newChatRef, {
        createdAt: timestamp, // Set the timestamp for chat creation
        messages: [],
      });
  
      // Update the chat lists for both users with the new chat reference
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(), // Use the timestamp for the updatedAt field
        }),
      });
  
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(), // Use the timestamp for the updatedAt field
        }),
      });
  
      console.log("Chat added successfully!");
    } catch (err) {
      console.log("Error adding chat: ", err);
      setError("Failed to add chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    setLoading(true);

    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Ensure to get user ID from the document data
        const foundUser = querySnapshot.docs[0];
        console.log("User found: ", foundUser.data()); // Log found user data
        setUser({ id: foundUser.id, ...foundUser.data() });
      } else {
        console.log("User not found");
        setUser(null); // Reset user state if no user is found
      }
    } catch (err) {
      console.log("Error fetching user: ", err);
      setError("Error searching for user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Enter username" 
          name="username" 
          aria-label="Username" 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Display error if any */}
      {error && <p className="error">{error}</p>}

      {/* Show user details if user is found */}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="User avatar" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
