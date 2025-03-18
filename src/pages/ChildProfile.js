import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAccessRequests, getWebActivities } from "../firebase";

const ChildProfile = () => {
  const { childId, childName } = useParams(); // Get the child ID from URL
  const [activeTab, setActiveTab] = useState("menu");
  const [webActivities, setWebActivities] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "access-requests") {
          const requests = await getAccessRequests(childId);
          setAccessRequests(requests);
        }
        if (activeTab === "web-activities") {
          const activities = await getWebActivities(childId);
          setWebActivities(activities);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab, childId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Child Profile: {childName}</h1>

      <div className="menu space-y-2">
        <button
          className="p-2 bg-blue-500 text-white rounded-md w-full"
          onClick={() => setActiveTab("access-requests")}
        >
          Access Requests
        </button>
        <button
          className="p-2 bg-gray-500 text-white rounded-md w-full"
          onClick={() => setActiveTab("web-activities")}
        >
          Web Activities
        </button>
        <button
          className="p-2 bg-green-500 text-white rounded-md w-full"
          onClick={() => setActiveTab("filtering")}
        >
          Filtering Configuration
        </button>
      </div>

      {/* Content for selected tab */}
      <div className="mt-4">
        {activeTab === "access-requests" && (
          <div>
            <h2 className="text-lg font-semibold">Access Requests</h2>
            {accessRequests.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {accessRequests.map((request) => (
                  <li key={request.id} className="p-3 border rounded bg-gray-100">
                    <p><strong>Type:</strong> {request.alertType}</p>
                    <p><strong>Content:</strong> {request.content}</p>
                    <p><strong>Status:</strong> {request.status}</p>
                    <p><strong>Time:</strong> {new Date(request.timestamp.seconds * 1000).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No access requests.</p>
            )}
          </div>
        )}
        
        {activeTab === "web-activities" && (
          <div>
            <h2 className="text-lg font-semibold">Web Activities</h2>
            {webActivities.length > 0 ? (
              <table className="table-auto w-full border-collapse mt-2">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Activity Type</th>
                    <th className="border px-4 py-2">Domain</th>
                    <th className="border px-4 py-2">Timestamp</th>
                    <th className="border px-4 py-2">URL</th>
                  </tr>
                </thead>
                <tbody>
                  {webActivities.map((activity, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{activity.activityType}</td>
                      <td className="border px-4 py-2">{activity.domain}</td>
                      <td className="border px-4 py-2">{new Date(activity.timestamp.seconds * 1000).toLocaleString()}</td>
                      <td className="border px-4 py-2">{activity.url}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No web activities found.</p>
            )}
          </div>
        )}
        
        {activeTab === "filtering" && <p>Filtering configuration settings coming soon...</p>}
      </div>
    </div>
  );
};

export default ChildProfile;
