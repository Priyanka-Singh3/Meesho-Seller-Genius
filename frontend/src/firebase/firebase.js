

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCrX9D7weGDqA8UEJoRE1tLRJBgVaHB2Uc",
  authDomain: "meesho-seller-genius.firebaseapp.com",
  projectId: "meesho-seller-genius",
  storageBucket: "meesho-seller-genius.firebasestorage.app",
  messagingSenderId: "558900400833",
  appId: "1:558900400833:web:14dd80ff8fe41ee098fa40",
  measurementId: "G-TPNGVQXCBV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
