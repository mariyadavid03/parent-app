import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getFirestore, query, collection, where, getDocs, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import ParentHeader from "../components/ParentHeader";
import "./ChildPagesStyle.css";

const db = getFirestore();

const FilteringConfig = () => {
  const { childId } = useParams();
  const [activeTab, setActiveTab] = useState("list");
  const [sensitivityLevel, setSensitivityLevel] = useState("Medium");
  const [urlList, setUrlList] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoryConfig, setCategoryConfig] = useState([]);
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newUrlType, setNewUrlType] = useState("Blocked"); 
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch URL list
  useEffect(() => {
    const fetchUrlList = async () => {
      try {
        const q = query(collection(db, "url list"), where("childId", "==", childId));
        const querySnapshot = await getDocs(q);
        const urls = [];
        querySnapshot.forEach((doc) => {
          urls.push(doc.data());
        });
        setUrlList(urls);
      } catch (error) {
        console.error("Error fetching URL list:", error);
      }
    };
    fetchUrlList();
  }, [childId]);

  // Filter URLs based on selected filter type
  const filteredUrls = urlList.filter((urlItem) => {
    if (filterType === "Blocked") {
      return !urlItem.isAllowed;
    } else if (filterType === "Allowed") {
      return urlItem.isAllowed;
    }
    return true;
  });

  // Fetch categories and their configurations
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch only categories where display is true
        const categoryQuery = query(
          collection(db, "category"),
          where("display", "==", true)
        );
        const categorySnapshot = await getDocs(categoryQuery);
        const allCategories = [];
        categorySnapshot.forEach((doc) => {
          allCategories.push({ id: doc.id, ...doc.data() });
        });
        setCategories(allCategories);
  
        const categoryConfigQuery = query(
          collection(db, "category configuration"),
          where("childId", "==", childId)
        );
        const categoryConfigSnapshot = await getDocs(categoryConfigQuery);
        const configData = [];
        categoryConfigSnapshot.forEach((doc) => {
          configData.push({ id: doc.id, ...doc.data() });
        });
        setCategoryConfig(configData);
      } catch (error) {
        console.error("Error fetching categories or category config:", error);
      }
    };
    fetchCategories();
  }, [childId]);


  const handleAddUrl = async () => {
    if (!newUrl) return;
  
    setIsSubmitting(true);
    try {
      // Extract domain from URL
      let domain = "";
      try {
        domain = new URL(newUrl).hostname.replace('www.', '');
      } catch (e) {
        domain = newUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      }
  
      await addDoc(collection(db, "url list"), {
        childId,
        url: newUrl,
        domain,
        isAllowed: newUrlType === "Allowed",
        createdAt: new Date().toISOString()
      });
  
      const q = query(collection(db, "url list"), where("childId", "==", childId));
      const querySnapshot = await getDocs(q);
      const urls = [];
      querySnapshot.forEach((doc) => {
        urls.push(doc.data());
      });
      setUrlList(urls);
  
      setNewUrl("");
      setNewUrlType("Blocked");
      setShowAddUrlModal(false);
    } catch (error) {
      console.error("Error adding URL:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = async (e, categoryId) => {
    const selectedValue = e.target.value;
    const isBlocked = selectedValue === "Blocked"; 

    try {
      const existingConfig = categoryConfig.find(
        (config) => config.categoryId === categoryId && config.childId === childId
      );

      if (existingConfig) {
        const categoryRef = doc(db, "category configuration", existingConfig.id);
        await updateDoc(categoryRef, { isBlocked });

      } else {
        await addDoc(collection(db, "category configuration"), {
          categoryId,
          childId,
          isBlocked,
        });
      }

      
      const updatedConfig = categoryConfig.map((config) =>
        config.categoryId === categoryId && config.childId === childId
          ? { ...config, isBlocked }
          : config
      );
      if (!existingConfig) {
        updatedConfig.push({ categoryId, childId, isBlocked });
      }
      setCategoryConfig(updatedConfig);
    } catch (error) {
      console.error("Error updating category configuration:", error);
    }



  };

  const handleDeleteUrl = async (urlId) => {
    if (!window.confirm("Are you sure you want to delete this URL?")) return;
    
    try {
      const q = query(
        collection(db, "url list"),
        where("childId", "==", childId),
        where("url", "==", urlId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const deletePromises = querySnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        
        setUrlList(prev => prev.filter(item => item.url !== urlId));
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      alert("Failed to delete URL");
    }
  };

  return (
    <div>
      <ParentHeader />
      <button className="back-btn" onClick={() => navigate(-1)}>
        {"<"}
      </button>
      <div className="filtering-container">
        <h2>Filtering Configuration</h2>
        <p>
          <strong>Sensitivity Level:</strong> {sensitivityLevel}
        </p>

        <div className="tab-section">
          <div className="tabs">
            <button
              className={activeTab === "list" ? "active" : ""}
              onClick={() => setActiveTab("list")}
            >
              List
            </button>
            <button
              className={activeTab === "categories" ? "active" : ""}
              onClick={() => setActiveTab("categories")}
            >
              Categories
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "list" && (
              <div>
                <h3>Blocked URLs</h3>
                <div className="filter-dropdown">
                  <label>Filter by Type:</label>
                  <select
                    onChange={(e) => setFilterType(e.target.value)}
                    value={filterType}
                    className="select-btn"
                  >
                    <option value="All">All</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Allowed">Allowed</option>
                  </select>
                </div>
                <div className="url-list-header">
                  <button 
                    className="add-url-btn" 
                    onClick={() => setShowAddUrlModal(true)}
                  >
                    + Add URL
                  </button>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>URL</th>
                      <th>Domain</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUrls.length > 0 ? (
                      filteredUrls.map((urlItem, index) => (
                        <tr key={index}>
                          <td>{urlItem.url}</td>
                          <td>{urlItem.domain}</td>
                          <td>{urlItem.isAllowed ? "Allowed" : "Blocked"}</td>
                          <td>
                            <button 
                              className="delete-url-btn"
                              onClick={() => handleDeleteUrl(urlItem.url)}
                              title="Delete URL"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">No URLs found for this child.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "categories" && (
              <div>
                <h3>Category Filters</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => {
                      const categoryConfigData = categoryConfig.find(
                        (config) => config.categoryId === category.id && config.childId === childId
                      );
                      const isBlocked = categoryConfigData ? categoryConfigData.isBlocked : false;

                      return (
                        <tr key={category.id}>
                          <td>{category.categoryName}</td>
                          <td>
                            <select
                              value={isBlocked ? "Blocked" : "Allowed"}
                              onChange={(e) => handleCategoryChange(e, category.id)}
                            >
                              <option value="Allowed">Allowed</option>
                              <option value="Blocked">Blocked</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add URL Modal */}
      {showAddUrlModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New URL</h2>
            <div className="modal-form-group">
              <label>URL:</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="modal-form-group">
              <label>Type:</label>
              <select
                value={newUrlType}
                onChange={(e) => setNewUrlType(e.target.value)}
              >
                <option value="Blocked">Blocked</option>
                <option value="Allowed">Allowed</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button
                className="save-btn"
                onClick={handleAddUrl}
                disabled={isSubmitting || !newUrl}
              >
                {isSubmitting ? "Adding..." : "Add URL"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddUrlModal(false);
                  setNewUrl("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilteringConfig;