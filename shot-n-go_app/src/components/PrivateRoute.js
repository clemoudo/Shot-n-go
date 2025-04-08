import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Récupérer l'état d'authentification

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user } = useAuth(); // Vérifie si l'utilisateur est connecté

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (  // Si l'utilisateur est connecté
          <Component {...props} />
        ) : (  // Sinon, redirection vers la page de login
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
