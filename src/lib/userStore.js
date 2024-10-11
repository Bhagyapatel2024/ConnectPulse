import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // Adjust the import path as needed

// Zustand store for managing user state
export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,

  // Fetch user info based on user ID
  fetchUserInfo: async (uid) => {
    if (!uid) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    set({ isLoading: true }); // Set loading state to true
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        console.warn("No user found for the provided UID.");
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching user info: ", err);
      set({ currentUser: null, isLoading: false });
    }
  },

  // Clear user data
  clearUser: () => set({ currentUser: null, isLoading: false }),
}));
