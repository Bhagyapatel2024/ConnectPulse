import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import upload from "../../lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [loading, setLoading] = useState(false);

  // Separate form data states for login and registration
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Handle login form input changes
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Handle registration form input changes
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // Handle avatar upload
  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // Register new user
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { username, email, password } = registerData;
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });
      toast.success("Account created!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login existing user
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { email, password } = loginData;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            name="email"
            required
            value={loginData.email}
            onChange={handleLoginChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            required
            value={loginData.password}
            onChange={handleLoginChange}
          />
          <button type="submit" disabled={loading} className="button1">
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img
              src={avatar.url ? avatar.url : "./avatar.png"}
              alt="Avatar Preview"
              style={{ width: "100px", height: "100px", borderRadius: "50%" }}
            />
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />

          <input
            type="text"
            placeholder="Username"
            name="username"
            required
            value={registerData.username}
            onChange={handleRegisterChange}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            required
            value={registerData.email}
            onChange={handleRegisterChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            required
            value={registerData.password}
            onChange={handleRegisterChange}
          />
          <button type="submit" disabled={loading} className="button1">
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
