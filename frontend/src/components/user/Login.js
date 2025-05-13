import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { AuthContext } from '../middlewares/AuthContext';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { checkAuth } = useContext(AuthContext); // Access checkAuth function from context

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/login', { email, password }, { withCredentials: true })
      if (response.data.success) {
        toast.success('Login successful!');
        // Immediately update authentication context after login

        setTimeout(()=>checkAuth(),3000) ; // Call checkAuth to update the state in AuthContext
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="container container-fluid">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="row wrapper ">
        <div className="col-10 col-lg-5 mx-auto border rounded p-4">
          <form className="shadow-lg" onSubmit={handleSubmit}>
            <h1 className="mb-3">Login</h1>

            <div className="form-group">
              <label htmlFor="email_field">Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_field">Password</label>
              <input
                type="password"
                id="password_field"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Link to="/password/forgot" className="float-right mb-4">
              Forgot Password?
            </Link>

            <button
              id="login_button"
              type="submit"
              className="btn btn-primary btn-block py-3"
            >
              LOGIN
            </button>

            <Link to="/register" className="float-right mt-3">
              New User?
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
