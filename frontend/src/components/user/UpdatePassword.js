import React, { useState } from "react";
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";

function UpdatePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const HandleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put('http://localhost:8000/password/change',
                { oldPassword, newPassword },
                { withCredentials: true })
            if (response.data.success) {
                toast.success(response.data.message || "Password changed successfully");
                setOldPassword("");
                setNewPassword("");
            } else {
                toast.error(response.data.message || "Failed to change password");
            }
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "An error occurred";
            toast.error(message);
        }
    }


    return (
        <div className="container py-5">
            <ToastContainer position="top-center" autoClose={2000} />
            <div className="row wrapper justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                    <form onSubmit={HandleSubmit} className="shadow p-4 rounded bg-white">
                        <h2 className="text-center mb-4">Update Password</h2>

                        <div className="mb-3">
                            <label htmlFor="old_password_field" className="form-label">
                                Old Password
                            </label>
                            <input
                                type="password"
                                id="old_password_field"
                                className="form-control"
                                placeholder="Enter old password"
                                name="oldPassword"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="new_password_field" className="form-label">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="new_password_field"
                                className="form-control"
                                placeholder="Enter new password"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn update-btn w-100 mt-3">
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UpdatePassword;
