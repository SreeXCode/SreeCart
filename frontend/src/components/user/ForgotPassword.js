import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Spinner } from 'react-bootstrap';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/password/forgot',
        { email },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Reset link sent successfully');
        setEmail("")
        const token = response.data.resetToken;

        setTimeout(() => {
          if (token) {
            // navigate(`/password/reset/${token}`);
          }
          setLoading(false);
        }, 2000); // Delay to allow toast to show
      } else {
        setLoading(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="row wrapper w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5">
          <form className="shadow-lg p-4 bg-white rounded" onSubmit={handleSubmit}>
            <h1 className="mb-4 text-center">Forgot Password</h1>

            <div className="form-group">
              <label htmlFor="email_field">Enter Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              id="forgot_password_button"
              type="submit"
              className="btn btn-primary btn-block py-2 mt-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border"  />
                  <span className='mx-2'>Sending...</span>
                </>
              ) : (
                'Send Email'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
