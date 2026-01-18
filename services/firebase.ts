import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { Ticket } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyBdX3b9ETTjQhm7rp7b6ksKkyDS73NirwE",
  authDomain: "vigilante-d09be.firebaseapp.com",
  projectId: "vigilante-d09be",
  storageBucket: "vigilante-d09be.firebasestorage.app",
  messagingSenderId: "485517267312",
  appId: "1:485517267312:web:7480db80c997bf9109bfb5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Firebase Auth Error:", error);
    if (error.code === 'auth/unauthorized-domain') {
      alert("ERRO DE DOMÍNIO: Este domínio (" + window.location.hostname + ") não está autorizado no Console do Firebase. Adicione-o em Autenticação > Definições > Domínios Autorizados.");
    } else {
      alert("Falha na autenticação: " + (error.message || "Erro desconhecido"));
    }
    throw error;
  }
};

export const logout = () => signOut(auth);

/**
 * Uploads an image to Firebase Storage and returns the public download URL.
 */
export const uploadImage = async (file: File, userId: string): Promise<string> => {
  const storageRef = ref(storage, `reports/${userId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const createTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'tickets'), {
    ...ticketData,
    createdAt: serverTimestamp()
  });
};

/**
 * Subscribes to tickets with robust error handling.
 */
export const subscribeToTickets = (
  callback: (tickets: Ticket[]) => void, 
  onError: (error: any) => void,
  userId?: string
) => {
  let q;
  try {
    if (userId) {
      q = query(
        collection(db, 'tickets'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'tickets'), 
        orderBy('createdAt', 'desc')
      );
    }
    
    return onSnapshot(q, (snapshot) => {
      const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];
      callback(tickets);
    }, (error) => {
      console.warn("Firestore Subscription Error (Expected if not logged in or restricted):", error.message);
      onError(error);
    });
  } catch (error) {
    console.error("Critical Firestore Query Error:", error);
    onError(error);
    return () => {};
  }
};