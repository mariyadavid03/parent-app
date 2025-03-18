import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getChildProfiles } from "../firebase";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchChildren = async () => {
      if (user) {
        const childProfiles = await getChildProfiles(user.uid);
        setChildren(childProfiles);
      }
      setLoading(false);
    };

    fetchChildren();
  }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Child Profiles</h1>

      {children.length > 0 ? (
        <ul className="space-y-4">
          {children.map((child) => (
            <li 
              key={child.id} 
              className="p-4 border rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
              onClick={() => navigate(`/child/${child.id}/${encodeURIComponent(child.childName)}`)}
            >
              <p className="font-semibold text-lg">{child.childName}</p>
              <p className="text-gray-600">Last Active: {new Date(child.lastActive).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-gray-600 mb-3">No child profiles found.</p>
          <button 
            className="p-2 bg-blue-500 text-white rounded-md" 
            onClick={() => navigate("/add-child")}
          >
            Add Child Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
