import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddChild from "./pages/AddChild";
import ChildProfile from "./pages/ChildProfile";


function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="text-center">
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
          <Route path="/signup" element={<Signup onSignupSuccess={setUser} />} />
          <Route path="/" element={user ? <h1>Welcome, {user.email}</h1> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-child" element={<AddChild />} />
          <Route path="/child/:childId/:childName" element={<ChildProfile />} />
          {/* // <Route path="/child/:childId/access-requests" element={<AccessRequests />} />
          // <Route path="/child/:childId/web-activities" element={<WebActivities />} /> */}
        </Routes>
        {user && (
          <button onClick={() => setUser(null)} className="p-2 mt-3 bg-red-500 text-white">
            Logout
          </button>
        )}
      </div>
    </Router>
  );
}

export default App;
