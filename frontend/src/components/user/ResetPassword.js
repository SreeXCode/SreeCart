import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/password/reset/${token}`,
        { password, confirmPassword },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Password reset successfully');
        setPassword("")
        setConfirmPassword("")

        // Delay navigation for toast to show
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="row wrapper w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5">
          <form className="shadow-lg p-4 bg-white rounded" onSubmit={handleSubmit}>
            <h1 className="mb-4 text-center">New Password</h1>

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

            <div className="form-group">
              <label htmlFor="confirm_password_field">Confirm Password</label>
              <input
                type="password"
                id="confirm_password_field"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="new_password_button"
              type="submit"
              className="btn btn-primary btn-block py-2 mt-3"
              disabled={loading}
            >
              {loading ? 'Setting...' : 'Set Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
