import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import './HeaderStyles.css';

const ParentHeader = () => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        if (showProfileModal && auth.currentUser) {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const userDocRef = doc(db, "user", auth.currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    if (userDocSnap.exists()) {
                        setUserData(userDocSnap.data());
                    } else {
                        console.log("No user document found");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        }
    }, [showProfileModal, auth.currentUser, db]);

    return (
        <div>
            <div className="header-horizontal">
                <div className="header-icons">
                    <img 
                        src="/assets/user-icon.png" 
                        alt="User" 
                        onClick={() => setShowProfileModal(true)}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-modal-header">
                            <h3>User Profile</h3>
                            <button 
                                className="profile-modal-close"
                                onClick={() => setShowProfileModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="profile-modal-body">
                            {loading ? (
                                <p>Loading profile...</p>
                            ) : (
                                <>
                                    <div className="profile-info-item">
                                        <strong>Name:</strong> {userData?.name || "Not set"}
                                    </div>
                                    <div className="profile-info-item">
                                        <strong>Email:</strong> {auth.currentUser?.email || "Not available"}
                                    </div>
                                    <div className="profile-info-item">
                                        <strong>Account Created:</strong> {new Date(auth.currentUser?.metadata.creationTime).toLocaleDateString()}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentHeader;