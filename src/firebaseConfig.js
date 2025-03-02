import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCkQdd39qGBDuKLnyI-LEBx6zHwACgv1nU",
  authDomain: "safe-truck-782cc.firebaseapp.com",
  databaseURL: "https://safe-truck-782cc-default-rtdb.firebaseio.com", 
  projectId: "safe-truck-782cc",
  storageBucket: "safe-truck-782cc.appspot.com",
  messagingSenderId: "143701882065",
  appId: "1:143701882065:web:1156a36dbc968de7cac1f0",
  measurementId: "G-2YMME9ZN8F"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app); 

export { database };