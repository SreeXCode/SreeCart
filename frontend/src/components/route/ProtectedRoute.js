// components/middlewares/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../middlewares/AuthContext';
import Spinner from 'react-bootstrap/Spinner'; 

const ProtectedRoute = ({ children }) => {
  const { Authenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden"></span>
        </Spinner>
      </div>
    );
  }

  if (!Authenticated) {
    return <Navigate to="/login" />
  }

  return children;

};
export default ProtectedRoute;
