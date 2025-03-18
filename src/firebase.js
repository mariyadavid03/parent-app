// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc 
} from "firebase/firestore";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBVSgDTtJWLNNwtg-wBB-NMcu1aTZ0CKo",
  authDomain: "childsafe-content-filter-a369a.firebaseapp.com",
  projectId: "childsafe-content-filter-a369a",
  storageBucket: "childsafe-content-filter-a369a.firebasestorage.app",
  messagingSenderId: "1089115830171",
  appId: "1:1089115830171:web:d60e032dcdd8f537e4d33e",
  measurementId: "G-G0MV7RCV80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sign up function
const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Save user data (email and name) to Firestore
    await setDoc(doc(db, "user", user.uid), { name, email });
    return user;
  } catch (error) {
    console.error("Signup Error:", error.message);
    throw error;
  }
};

// Login function
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
const addChildProfile = async (parentId, childName, dob) => {
  try {
    const docRef = await addDoc(collection(db, "child profile"), {
      parentId,
      childName,
      dob,  
      lastActive: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding child profile:", error);
    return null;
  }
};

// Function to fetch access requests for a specific child
const getAccessRequests = async (childProfileId) => {
  try {
    const q = query(collection(db, "access requests"), where("childProfileId", "==", childProfileId));
    const querySnapshot = await getDocs(q);
    
    let requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    return requests;
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return [];
  }
};

// Function to fetch web activities for a child
const getWebActivities = async (childId) => {
  const db = getFirestore();
  const q = query(collection(db, "browsingActivity"), where("childProfile", "==", childId));
  const querySnapshot = await getDocs(q);
  const activities = [];
  
  querySnapshot.forEach((doc) => {
    activities.push(doc.data());
  });

  return activities;
};

export { auth, db, signUp, login, logout, getChildProfiles, addChildProfile, getAccessRequests, getWebActivities };