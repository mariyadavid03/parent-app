import React, { useEffect, useState } from "react";
import './DashboardStyle.css';
import { getAuth } from "firebase/auth";
import { getChildProfiles, addChildProfile } from "../firebase"; // We'll add addChildProfile function
import { useNavigate } from "react-router-dom";
import ParentHeader from "../components/ParentHeader";

const Dashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState("");
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

  const handleAddChild = async () => {
    try {
      const newChild = {
        childName,
        parentId: user.uid,
        dob,
        createdAt: new Date(),
      };
      await addChildProfile(newChild); 

      setShowModal(false);
      setChildName("");
      setDob("");
      
      const childProfiles = await getChildProfiles(user.uid);
      setChildren(childProfiles);
    } catch (error) {
      console.error("Error adding child:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

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
        </div>

        <div className="overview-card">
          <div className="overview-header">
            <p className="dash-title">Your Kids at a Glance</p>
            <button
              className="add-child-btn"
              onClick={() => setShowModal(true)}
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
                  <img src="/assets/img-profile.png" alt="Child Profile" />
                  <div className="child-info">
                    <p className="child-name">{child.childName}</p>
                    <p className="child-last-active">
                      Last Active: {child.lastActive ? new Date(child.lastActive).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center">No child profiles found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Adding a New Child Profile */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Child Profile</h2>
            <label>Child Name:</label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Enter child's name"
            />
            <label>Date of Birth:</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="save-btn" onClick={handleAddChild}>Save</button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
