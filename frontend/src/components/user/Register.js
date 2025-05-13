import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const [avatar, setAvatar] = useState("")
  const [avatarPreview, setAvatarPreview] = useState("/images/default_avatar.png")
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'avatar') {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(file);
          setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);

    if (avatar) {
      data.append('avatar', avatar);
    }

    try {
      const response = await axios.post('http://localhost:8000/register',data,{ withCredentials: true });
    
      if (response.data.success) {
        toast.success('Register successful!');
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Register Failed');
    }
  };

  return (
    <div className="container container-fluid">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="row wrapper">
        <div className="col-10 col-lg-5 mx-auto border rounded p-4">
          <form className="shadow-lg" onSubmit={handleSubmit} encType="multipart/form-data">
            <h1 className="mb-3">Register</h1>

            <div className="form-group">
              <label htmlFor="name_field">Name</label>
              <input
                type="text"
                id="name_field"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email_field">Email</label>
              <input
                type="email"
                id="email_field"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_field">Password</label>
              <input
                type="password"
                id="password_field"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar_upload">Avatar</label>
              <div className="d-flex align-items-center">
                <div>
                  <figure className="avatar mr-3 item-rtl">
                    <img
                      src={avatarPreview}
                      className="rounded-circle"
                      alt="Avatar Preview"
                      width="50"
                      height="50"
                    />
                  </figure>
                </div>
                <div className="custom-file">
                  <input
                    type="file"
                    name="avatar"
                    className="custom-file-input"
                    id="customFile"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  <label className="custom-file-label" htmlFor="customFile">
                    Choose Avatar
                  </label>
                </div>
              </div>
            </div>

            <button
              id="register_button"
              type="submit"
              className="btn btn-primary btn-block py-3"
            >
              REGISTER
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
