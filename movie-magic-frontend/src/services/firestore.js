// src/services/firestore.js
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "./Firebase";

const db = getFirestore(app);

// Save the user's bio
export async function saveUserBio(uid, bio) {
  console.log('Saving bio for:', uid, 'bio:', bio); 
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { bio }, { merge: true });
}

// Get the user's bio
export async function getUserBio(uid) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return snapshot.data().bio || '';
  }
  return '';
}