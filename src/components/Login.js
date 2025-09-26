import React, { useState } from "react";
import { FaGoogle, FaUser, FaLock, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail } =
    useAuth();

  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (isSignup) {
        const res = await signUpWithEmail(email, password);
        if (res?.user) {
          alert("Account created! Please select a role after login.");
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (res?.user) {
          navigate("/register"); // redirect to registration/home after login
        }
      }
    } catch (err) {
      alert(err.message || "Auth error");
    } finally {
      setProcessing(false);
    }
  };

  const handleGoogle = async () => {
    setProcessing(true);
    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        navigate("/register");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: "#f1f5f8",
        backgroundImage: "url('/background-pattern.png')",
        backgroundSize: "cover",
      }}
    >
      <div
        className="card shadow p-4"
        style={{ minWidth: 320, maxWidth: 360, borderRadius: 16 }}
      >
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleEmailSubmit}>
          <div className="input-group mb-3">
            <span className="input-group-text bg-white">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Username"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text bg-white">
              <FaUser />
            </span>
            <input
              type="email"
              placeholder="Email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text bg-white">
              <FaLock />
            </span>
            <input
              type="password"
              placeholder="Password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-2"
            disabled={processing}
          >
            {isSignup ? "Create Account" : "Login"}
          </button>
        </form>

        <button
          onClick={handleGoogle}
          className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
          disabled={processing}
        >
          <FaGoogle /> Continue with Google
        </button>

        <p className="text-center mt-3 small text-muted">
          Create us will add account
        </p>
      </div>
    </div>
  );
}
