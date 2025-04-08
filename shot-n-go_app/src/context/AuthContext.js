// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase'; // ton fichier firebase.js

// Créer le contexte
export const AuthContext = createContext();

// Fournisseur du contexte
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Suivi de l'état de l'utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // met à jour l'état de l'utilisateur
      setLoading(false); // arrêt de la phase de chargement
    });

    return () => unsubscribe(); // nettoyer l'abonnement quand le composant est démonté
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Afficher un indicateur de chargement
  }

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
