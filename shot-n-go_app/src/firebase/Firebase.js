import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD4x1rMD5a9nepvkShvuRU4RW2dlYqYVHU",
    authDomain: "shot-n-go-babc8.firebaseapp.com",
    projectId: "shot-n-go-babc8",
    storageBucket: "shot-n-go-babc8.firebasestorage.app",
    messagingSenderId: "320072644625",
    appId: "1:320072644625:web:44ef1cb4372083561c99b0",
    measurementId: "G-XDLR7NBTP3"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
