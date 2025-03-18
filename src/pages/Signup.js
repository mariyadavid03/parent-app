import { useState } from "react";
import { signUp } from "../firebase";
import { useNavigate } from "react-router-dom";

const Signup = ({ onSignupSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signUp(email, password, name);
      onSignupSuccess(user);
      navigate("/"); // Redirect after signup
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-bold">Sign Up</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border" required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 border" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 border" required />
        <button type="submit" className="p-2 bg-green-500 text-white">Sign Up</button>
      </form>
      <button onClick={() => navigate("/login")} className="p-2 mt-3 bg-gray-500 text-white">Go to Login</button>
    </div>
  );
};

export default Signup;
