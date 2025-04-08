import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  // Fonction pour récupérer le token Firebase de l'utilisateur
  const getToken = async () => {
    if (!auth.currentUser) throw new Error("Utilisateur non connecté");
    return await auth.currentUser.getIdToken();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ currentUser, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}
