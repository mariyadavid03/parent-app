import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDBVSgDTtJWLNNwtg-wBB-NMcu1aTZ0CKo",
  authDomain: "childsafe-content-filter-a369a.firebaseapp.com",
  projectId: "childsafe-content-filter-a369a",
  storageBucket: "childsafe-content-filter-a369a.firebasestorage.app",
  messagingSenderId: "1089115830171",
  appId: "1:1089115830171:web:d60e032dcdd8f537e4d33e",
  measurementId: "G-G0MV7RCV80"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "user", user.uid), { name, email });
    return user;
  } catch (error) {
    console.error("Signup Error:", error.message);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

// Logout function
const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};

// Function to fetch child profiles by parent ID
const getChildProfiles = async (parentId) => {
  try {
    const q = query(collection(db, "child profile"), where("parentId", "==", parentId));
    const querySnapshot = await getDocs(q);
    
    let children = [];
    querySnapshot.forEach((doc) => {
      children.push({ id: doc.id, ...doc.data() });
    });

    return children;
  } catch (error) {
    console.error("Error fetching child profiles:", error);
    return [];
  }
};

// Function to add a new child profile
const addChildProfile = async (childData) => {
  try {
    const docRef = await addDoc(collection(db, "child profile"), childData);
    console.log("Child profile added with ID:", docRef.id);
  } catch (e) {
    console.error("Error adding child profile:", e);
  }
};


const deleteChildProfile = async (childId) => {
  try {
    const childDocRef = doc(db, "child profile", childId);
    await deleteDoc(childDocRef);
    console.log("Child profile deleted:", childId);
  } catch (e) {
    console.error("Error deleting child profile:", e);
  }
};


// Function to fetch web activities for a child
const getWebActivities = async (childId) => {
  try {
    const q = query(collection(db, "browsing activity"), where("childProfile", "==", childId));
    const querySnapshot = await getDocs(q);

    const activities = [];
    querySnapshot.forEach((doc) => {
      const activityData = doc.data();

      // Ensure timestamp is properly converted
      if (activityData.timestamp && activityData.timestamp.toDate) {
        activityData.timestamp = activityData.timestamp.toDate();
      } else if (activityData.timestamp) {
        activityData.timestamp = new Date(activityData.timestamp);
      }

      // Include Firestore document ID for filtering lookup
      activities.push({
        ...activityData,
        browsingActivityId: doc.id,
      });
    });

    return activities;
  } catch (error) {
    console.error("Error fetching web activities:", error);
    return [];
  }
};


const getFilteringActivity = async (browsingActivityId) => {
  try {
    console.log("Fetching filtering activity for ID:", browsingActivityId);

    const q = query(collection(db, "activity filtering"), where("browsingActivityId", "==", browsingActivityId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data(); 
      console.log("Filtering data found:", docData);
      return docData;
    } else {
      console.warn("No filtering activity found for ID:", browsingActivityId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching filtering activity:", error);
    return null;
  }
};


export { auth, db, signUp, login, logout, getChildProfiles, addChildProfile, getWebActivities, getFilteringActivity, deleteChildProfile };