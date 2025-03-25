import { useState } from "react";
import './style.css';
import { signUp } from "../firebase";
import { useNavigate } from "react-router-dom";
import sendVerificationEmail from "./emailService";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const Signup = ({ onSignupSuccess }) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); 
  const navigate = useNavigate();
  const db = getFirestore();
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(otp);
    try {
      await sendVerificationEmail(email, otp);
      alert("Verification email sent! Check your inbox.");
      setStep(2); 
    } catch (err) {
      alert("Invalid email or failed to send verification. Try again.");
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (verificationCode === generatedCode) {
      setStep(3); 
    } else {
      alert("Incorrect verification code. Try again.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signUp(email, password, name);
      await addDoc(collection(db, "user"), {
        email: email,
        name: name,
      });
      
      onSignupSuccess(user);
      navigate("/dashboard"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="form-section">
        <h1 className="heading">ChildSafe</h1>
        <h2 className="text-xl font-bold">
          {step === 1
            ? "Enter your email"
            : step === 2
            ? "Verify your email"
            : "Create your account"}
        </h2>
        {error && <p className="text-red-500">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border"
              required
            />
            <button type="submit" className="p-2 bg-green-500 text-white w-1/2">
              Send Verification Email
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="p-2 border"
              required
            />
            <button type="submit" className="p-2 bg-green-500 text-white w-1/2">
              Verify Code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="nameEnter"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border"
              required
            />
            <button type="submit" className="p-2 bg-green-500 text-white w-1/2">
              Sign Up
            </button>
            <p onClick={() => navigate("/login")} className="text-blue-500 cursor-pointer">
              Go to Login
            </p>
          </form>
        )}
      </div>
      <div className="color-section">
        <img src="/assets/3813579.jpg" alt="Background" className="background-image" />
      </div>
    </div>
  );
};

export default Signup;