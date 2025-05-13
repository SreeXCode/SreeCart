import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../middlewares/AuthContext'
import axios from 'axios'
import { toast , ToastContainer} from 'react-toastify'
import { useNavigate } from 'react-router-dom';

function UpdateProfile() {

    const { user , checkAuth } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('http://localhost:8000/uploads/user/default_avatar.png');
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth(); // Call only once
    }, []);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            }
        }
    }, []);


    const ChangeAvatar = async (e) => {
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
        }
    }

    const SubmitHandler = async (e) => {
        e.preventDefault()
        const data = new FormData();

        data.append('name', name);
        data.append('email', email);

        if (avatar) {
            data.append('avatar', avatar);
        }

        try {
            const response = await axios.put('http://localhost:8000/profile/update', data, { withCredentials: true });

            if (response.data.success) {
                toast.success('Profile successfully Updated!');
                setTimeout(() => {
                    navigate('/profile');
                }, 2000); // Match ToastContainer autoClose time
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Updated Failed');
        }

    }

    return (
        <div className="container-container-fluid">
            <ToastContainer position="top-center" autoClose={2000} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form onSubmit={SubmitHandler} className="shadow-lg" encType="multipart/form-data">
                        <h1 className="mt-2 mb-5 text-center">Update Profile</h1>

                        <div className="form-group">
                            <label htmlFor="name_field">Name</label>
                            <input
                                type="text"
                                id="name_field"
                                className="form-control"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                        />
                                    </figure>
                                </div>
                                <div className="custom-file">
                                    <input
                                        type="file"
                                        name="avatar"
                                        className="custom-file-input"
                                        id="customFile"
                                        onChange={ChangeAvatar}
                                    />
                                    <label className="custom-file-label" htmlFor="customFile">
                                        Choose Avatar
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn update-btn btn-block mt-4 mb-3"
                        >
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UpdateProfile
