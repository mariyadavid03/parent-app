import { useState } from "react";
import { getAuth } from "firebase/auth";
import { addChildProfile } from "../firebase";
import { useNavigate } from "react-router-dom";

const AddChild = () => {
  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!childName.trim()) {
      setError("Child name cannot be empty.");
      return;
    }
    if (!dob.trim()) {
      setError("Date of birth cannot be empty.");
      return;
    }

    try {
      await addChildProfile(user.uid, childName, dob); // Pass DOB to function
      navigate("/dashboard"); // Redirect to dashboard after adding
    } catch (error) {
      setError("Failed to add child. Try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Add Child Profile</h1>
      <form onSubmit={handleAddChild} className="space-y-3">
      <input
          type="text"
          placeholder="Enter Child Name"
          className="p-2 border rounded w-full"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
        />
        <input
          type="date"
          className="p-2 border rounded w-full"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="p-2 bg-blue-500 text-white rounded-md">
          Add Child
        </button>
      </form>
    </div>
  );
};

export default AddChild;
