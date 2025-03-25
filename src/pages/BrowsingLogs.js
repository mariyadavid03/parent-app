import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWebActivities, getFilteringActivity } from "../firebase";
import ParentHeader from "../components/ParentHeader";
import "./ChildPagesStyle.css";

const extractDomain = (url) => {
  const domain = new URL(url).hostname;
  return domain;
};

const BrowsingLogs = () => {
  const { childId } = useParams();
  const [activeTab, setActiveTab] = useState("web-browsing");
  const [webActivities, setWebActivities] = useState([]);
  const [filteringLogs, setFilteringLogs] = useState([]);
  const navigate = useNavigate();  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activities = await getWebActivities(childId);
        setWebActivities(activities);

        const filteringData = await Promise.all(
          activities.map(async (activity) => {
            try {
              const filteringActivity = await getFilteringActivity(activity.browsingActivityId);
              let filteringStatus = "No"; 
              let status = "Allowed";

              if (filteringActivity) {
                filteringStatus = "Yes"; 
                status = filteringActivity.finalResult === "Blocked" ? "Blocked" : "Allowed"; 
                return {
                  timestamp: activity.timestamp,
                  categoryResult: filteringActivity.categoryResult || "N/A",
                  phishingResult: filteringActivity.phishingResult || "N/A",
                  sentimentResult: filteringActivity.sentimentResult || "N/A",
                  finalResult: filteringActivity.finalResult || "N/A",
                  filteringStatus,  
                  status,  
                };
              }
              return null;
            } catch (error) {
              console.error("Error fetching filtering data:", error);
              return null;
            }
          })
        );


        setFilteringLogs(filteringData.filter((log) => log !== null));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [childId]); 

  return (
    <div>
      <ParentHeader />
      <button className="back-btn" onClick={() => navigate(-1)}>{"<"} </button> {/* Back button */}
      <div className="browsing-logs-container">
        <h2>Browsing Logs</h2>

        <div className="tabs">
          <button className={activeTab === "web-browsing" ? "active" : ""} onClick={() => setActiveTab("web-browsing")}>Web Browsing</button>
          <button className={activeTab === "filtering-logs" ? "active" : ""} onClick={() => setActiveTab("filtering-logs")}>Filtering Logs</button>
        </div>

        <div className="tab-content">
          {activeTab === "web-browsing" && (
            <div>
              <h3>Web Browsing History</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Domain</th>
                    <th>Link</th>
                    <th>Activity Type</th>
                  </tr>
                </thead>
                <tbody>
                  {webActivities.length > 0 ? (
                    webActivities.map((activity, index) => (
                      <tr key={index}>
                        <td>{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : "N/A"}</td>
                        <td>{extractDomain(activity.url)}</td>
                        <td>
                          {activity.url ? (
                            <a href={activity.url} target="_blank" rel="noopener noreferrer">
                              {activity.url.length > 30 ? `${activity.url.slice(0, 30)}...` : activity.url}
                            </a>
                          ) : "N/A"}
                        </td>
                        <td>{activity.activityType || "N/A"}</td>
                        
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>No browsing history available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "filtering-logs" && (
            <div>
              <h3>Filtering Logs</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Category Result</th>
                    <th>Phishing Result</th>
                    <th>Sentiment Result</th>
                    <th>Final Result</th>

                  </tr>
                </thead>
                <tbody>
                  {filteringLogs.length > 0 ? (
                    filteringLogs.map((log, index) => (
                      <tr key={index}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>{log.categoryResult}</td>
                        <td>{log.phishingResult}</td>
                        <td>{log.sentimentResult}</td>
                        <td>{log.finalResult}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center" }}>No filtering logs available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowsingLogs;
