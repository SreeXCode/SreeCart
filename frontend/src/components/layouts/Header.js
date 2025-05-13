import Search from "./Search";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../middlewares/AuthContext";
import { DropdownButton, Dropdown, Image } from "react-bootstrap";
import axios from "axios";
import { toast } from 'react-toastify';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { Authenticated, user, checkAuth } = useContext(AuthContext);
    const [CartItems, setCartItems] = useState(0); // Store the number of cart items
    const [loading, setLoading] = useState(true);  // Loading state for cart

    // Call checkAuth immediately when the component mounts
    useEffect(() => {
        console.log("Path:", location.pathname);
        checkAuth();
    }, [location.pathname]);

    // Fetch cart items after authentication
    useEffect(() => {
        if (Authenticated) {
            fetchCart();
        }
    }, [Authenticated]);

    const fetchCart = async () => {
        setLoading(true);  // Set loading to true before fetching data
        try {
            const res = await axios.get('http://localhost:8000/cart', { withCredentials: true });
            setCartItems(res.data.cartItems.length);  // Set the cart item count
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);  // Set loading to false after fetch completes
        }
    };

    const handleLogout = async () => {
        try {
            const res = await axios.post('http://localhost:8000/logout', {}, { withCredentials: true });
            toast.success("Logged out successfully!", { position: "top-center" });
            checkAuth();
            if (res.data.success) {
                navigate('/login');
            }
        } catch (error) {
            toast.error("Logout failed. Try again!", { position: "top-center" });
        }
    };

    return (
        <nav className="navbar row">
            <div className="col-12 col-md-3">
                <div className="navbar-brand rounded-pill">
                    <Link to="/">
                        <img width="150px" src="/images/logo.png" className="rounded" style={{ height: "50px" }} />
                    </Link>
                </div>
            </div>

            <div className="col-12 col-md-6 mt-2 mt-md-0">
                <Search />
            </div>

            <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">
                {Authenticated ? (
                    <>
                        <Dropdown className="d-inline">
                            <Dropdown.Toggle variant="default text-white pr-5" id="dropdown-basic">
                                <figure className="avatar avatar-nav">
                                    <Image width="50px" src={user.avatar ?? './images/default_avatar.png'} />
                                </figure>
                                <span>{user.name}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleLogout} className="text-danger">Logout</Dropdown.Item>
                                <Dropdown.Item onClick={() => navigate('/profile')}>Profile</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Link to="/cart" style={{ textDecoration: 'none' }}>
                            <span id="cart" className="ml-3">Cart</span>
                            <span className="ml-1" id="cart_count">{loading ? 'Loading...' : CartItems}</span>
                        </Link>
                    </>
                ) : (
                    <Link to="/login" className="btn" id="login_btn">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Header;
