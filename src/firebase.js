import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Firebase will give you these values
  apiKey: "AIzaSyBrb-Vo_4r-3NfXlUq-D7X5RUi-0Mfin0s",
  authDomain: "wordle-nerdles.firebaseapp.com",
  projectId: "wordle-nerdles",
  storageBucket: "wordle-nerdles.firebasestorage.app",
  messagingSenderId: "915853501327",
  appId: "1:915853501327:web:33c0c54e421e88874921fa"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
