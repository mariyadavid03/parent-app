import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getFirestore, query, collection, where, getDocs, updateDoc, getDoc } from "firebase/firestore";
import { getWebActivities } from "../firebase";
import "./ChildProfileStyle.css";
import ParentHeader from "../components/ParentHeader";

const db = getFirestore();

const ChildProfile = () => {
  const { childId, childName } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState(childName);
  const [sensitivityLevel, setSensitivityLevel] = useState("Medium"); 
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [webActivities, setWebActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const q = query(
          collection(db, "message"),
          where("childProfileId", "==", childId)
        );
        const querySnapshot = await getDocs(q);
        const messagesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        messagesData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setMessagesLoading(false);
      }
    };
  
    fetchMessages();
  }, [childId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activities = await getWebActivities(childId);
        setWebActivities(activities);
      } catch (error) {
        console.error("Error fetching data", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [childId]);

  useEffect(() => {
      const fetchSensitivityLevel = async () => {
        try {
          const q = query(collection(db, "filter configuration"), where("childId", "==", childId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const configData = querySnapshot.docs[0].data();
            setSensitivityLevel(configData.sensitivityLevel || "Medium");
          }
        } catch (error) {
          console.error("Error fetching sensitivity level:", error);
        }
      };
      fetchSensitivityLevel();
    }, [childId]);

    const handleSaveChanges = async () => {
      try {
        const childRef = doc(db, "child profile", childId); 
        await updateDoc(childRef, { childName: name });
    
        const childSnapshot = await getDoc(childRef);
        const updatedChildData = childSnapshot.data();
        const updatedChildName = updatedChildData.childName;
    
        const filterConfigRef = query(
          collection(db, "filter configuration"),
          where("childId", "==", childId)
        );
        const filterConfigSnapshot = await getDocs(filterConfigRef);
        if (!filterConfigSnapshot.empty) {
          const filterConfigDoc = filterConfigSnapshot.docs[0];
          await updateDoc(filterConfigDoc.ref, { sensitivityLevel: sensitivityLevel });
        }
    
        setName(updatedChildName);  
        navigate(`/child-profile/${childId}/${updatedChildName}`);
        setShowEditModal(false);
    
        console.log("Updated Name:", updatedChildName);
        console.log("Updated Sensitivity Level:", sensitivityLevel);
      } catch (error) {
        console.error("Error saving changes:", error);
      }
    };

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div>
      <ParentHeader />
      <div className="child-profile-container">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>{"<"} </button> {/* Back button */}
        {/* Child Profile View */}
        <div className="profile-box">
          <img src="/assets/img-profile.png" alt="Child Profile" className="profile-img" />
          <div className="profile-info">
            <h2>{childName}</h2>
            <p><strong>Sensitivity Level:</strong> {sensitivityLevel}</p>
            <button className="edit-btn" onClick={() => setShowEditModal(true)}>Edit</button>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Profile</h2>
              <label>Child Name:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

              <label>Sensitivity Level:</label>
              <select value={sensitivityLevel} onChange={(e) => setSensitivityLevel(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              <div className="modal-buttons">
                <button className="save-btn" onClick={handleSaveChanges}>Save</button>
                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}


        {/* Child Dashboard - Clickable Boxes */}
        <div className="dashboard">

          <div className="dashboard-box" onClick={() => navigate(`/filtering/${childId}`)}>
            <h3>Filtering Configuration</h3>
            <p>Manage filtering rules</p>
          </div>

          <div className="dashboard-box" onClick={() => navigate(`/web-activities/${childId}`)}>
            <h3>Activity Logs</h3>
            <p>{webActivities.length} records logged</p>
          </div>
        </div>

        {/* Alerts Box */}
        <div className="alerts-box">
          <h3>Alerts</h3>
          {messagesLoading ? (
            <p className="loading-text">Loading alerts...</p>
          ) : messages.length === 0 ? (
            <p>No alerts found</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>URL</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td>{new Date(message.timestamp).toLocaleString()}</td>
                    <td>{message.type}</td>
                    <td>{message.title}</td>
                    <td>
                      <a href={message.url} target="_blank" rel="noopener noreferrer">
                        {message.url}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildProfile;
