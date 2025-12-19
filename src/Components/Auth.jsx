import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Auth({ onBack }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      if (isSignUp) {
        alert("Success! Check you email for verification");
      } else {
        navigate("/user");
      }
    }
    setLoading(false);
  };

  return (
    <div className="body-bg" onClick={onBack}>
      <div
        className={`container ${isSignUp ? "right-panel-active" : ""}`}
        id="container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="form-container sign-up-container">
          <form onSubmit={handleAuth}>
            <h1>Create Account</h1>
            <span>Enter your information</span>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="form-container log-in-container">
          <form onSubmit={handleAuth}>
            <h1>Sign In</h1>
            <span>Welcome Back</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Sign In"}
            </button>
            <p onClick={onBack}>← Back to Home</p>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back Friend!</h1>
              <p>Already have an account? Sign in here!</p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello!</h1>
              <p>New here? Join us and start your digital kitchen!</p>
              <button
                className="ghost"
                id="signUp"
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
