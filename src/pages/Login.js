import { useState } from "react";
import './style.css';


import { login } from "../firebase";
import { useNavigate } from "react-router-dom";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      onLoginSuccess(user);
      navigate("/dashboard"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="form-section">
      <h1 className="heading">ChildSafe</h1>
      <h2 className="text-xl font-bold">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
          <button type="submit" className="submit-btn">Login</button>
          <p onClick={() => navigate("/signup")} className="to-signup">Go to Signup</p>
        </form>
        
      </div>
      <div className="color-section">
        <img src="/assets/3813123.jpg" alt="Background" className="background-image" />
      </div>
    </div>
  );
};

export default Login;
