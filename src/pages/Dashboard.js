import React, { useEffect, useState } from "react";
import './DashboardStyle.css';
import { getAuth, signOut } from "firebase/auth"; 
import { getChildProfiles, deleteChildProfile } from "../firebase"; 
import { useNavigate } from "react-router-dom";
import ParentHeader from "../components/ParentHeader";

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

  const handleDeleteChild = async (childId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this child profile?");
    if (confirmDelete) {
      try {
        await deleteChildProfile(childId);
        const childProfiles = await getChildProfiles(user.uid);
        setChildren(childProfiles);
      } catch (error) {
        console.error("Error deleting child profile:", error);
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <div>
      <ParentHeader />
      <div className="dashboard-page">
        <div className="top-card">
          <div className="greeting">
            <p>Good Day {user?.displayName}</p>
          </div>
          <div className="time-date">
            <p className="time">{new Date().toLocaleTimeString()}</p>
            <p className="date">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="top-picture">
            <img src="/assets/top-picture.png" alt="Family" />
          </div>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="overview-card">
          <div className="overview-header">
            <p className="dash-title">Your Kids at a Glance</p>
            <button
              className="add-child-btn"
              onClick={() => navigate("/add-child")}
            >
              Add Child Profile
            </button>
          </div>

          <div className="child-grid">
            {children.length > 0 ? (
              children.map((child) => (
                <div
                  key={child.id}
                  className="child-card"
                  onClick={() =>
                    navigate(`/child/${child.id}/${encodeURIComponent(child.childName)}`)
                  }
                >
                  <div
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleDeleteChild(child.id);
                    }}
                  >
                    <img src="/assets/bin-icon.png" alt="Delete" />
                  </div>
                  <img src="/assets/img-profile.png" alt="Child Profile" />
                  <div className="child-info">
                    <p className="child-name">{child.childName}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center">No child profiles found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
