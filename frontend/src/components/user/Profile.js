import { useState, useEffect } from "react"
import { useNavigate ,Link } from "react-router-dom"
import { Spinner } from 'react-bootstrap'
import axios from 'axios'


function Profile() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:8000/myprofile', { withCredentials: true })
                if (response.data.success) {
                    setUser(response.data.user)
                }
                
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false)
            }

        }
        fetchProfile()
    }, [])

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden"></span>
                </Spinner>
            </div>
        );
    }

    return (
        <>
            <div class="container container-fluid">
                <h2 className="mt-5 text-center text-md-left">My Profile</h2>
                <div className="row  wrapper justify-content-around mt-5 user-info">
                    <div className="col-12 col-md-3 text-center text-md-left">
                        <figure className="avatar avatar-profile mx-auto">
                            <img className="rounded-circle img-fluid" src={user.avatar} alt='' />
                        </figure>
                        <Link to="/profile/update" id="edit_profile" className="btn btn-primary btn-block my-5 mx-auto" style={{ maxWidth: "200px" }}>
                            Edit Profile
                        </Link>
                    </div>


                    <div className="col-12 col-md-5 px-4 mt-4">
                        <h4 className="mb-2">Full Name</h4>
                        <p className="mb-3">{user.name}</p>

                        <h4 className="mb-2">Email Address</h4>
                        <p className="mb-4">{user.email}</p>

                        <h4 className="mb-2">Joined</h4>
                        <p className="mb-4">{String(user.createdAt).substring(0, 10)}</p>

                        <a href="#" className="btn btn-danger btn-block mb-3">
                            My Orders
                        </a>

                        <Link to="/profile/update/password" className="btn btn-primary btn-block">
                            Change Password
                        </Link>
                    </div>

                </div>
            </div>


        </>
    )
}
export default Profile;


