import { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import { AuthContext } from "../middlewares/AuthContext";
import { useContext } from "react";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [totalUnits, setTotalUnits] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);  // Fix the typo here
    const {Authenticated, user, checkAuth} = useContext(AuthContext);
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [discount, setDiscount] = useState(0);


    const CheckOutHandler = ()=>{
        if(Authenticated){
            navigate('/shipping') 
        }
        else{
            navigate('/login')
        }
    }

    const applyCoupon = async () => {
        try {
            const res = await axios.post('http://localhost:8000/cart/apply-coupon', {
                code: couponCode
            }, { withCredentials: true });

            if (res.data.valid) {
                setDiscount(res.data.discountAmount);  // e.g., 100 or 10% converted
                setCouponMessage(`Coupon applied! You saved ₹${res.data.discountAmount}`);
            } else {
                setDiscount(0);
                setCouponMessage("Invalid or expired coupon.");
            }
        } catch (error) {
            console.error("Error applying coupon:", error);
            setCouponMessage("Something went wrong while applying the coupon.");
        }
    };


    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axios.get('http://localhost:8000/cart', { withCredentials: true });
                setCartItems(res.data.cartItems);
                updateTotals(res.data.cartItems);
            } catch (error) {
                console.error("Error fetching cart:", error);
            } finally {
                setLoading(false);  // Set loading to false when fetch completes
            }
        };
        fetchCart();
    }, []);

    const updateTotals = (items) => {
        const units = items.reduce((sum, item) => sum + item.quantity, 0);
        const price = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        setTotalUnits(units);
        setTotalPrice(price.toFixed(2));
    };

    const handleQuantityChange = async (productId, type) => {
        const updatedCart = cartItems.map(item => {
            if (item._id === productId) {
                let newQuantity = item.quantity;
                if (type === 'inc') {
                    if (item.quantity < item.stock) newQuantity += 1;
                    else alert(`Only ${item.stock} item(s) in stock.`);
                } else if (type === 'dec') {
                    if (item.quantity > 1) newQuantity -= 1;
                    else alert("Quantity cannot be less than 1.");
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        });

        setCartItems(updatedCart);
        updateTotals(updatedCart);

        // Send update to backend
        try {
            const item = updatedCart.find(i => i._id === productId);
            await axios.post('http://localhost:8000/cart/update', {
                productId,
                quantity: item.quantity
            }, { withCredentials: true });
        } catch (err) {
            console.error("Failed to update quantity:", err);
        }
    };

    const handleRemoveItem = async (productId) => {
        const updatedCart = cartItems.filter(item => item._id !== productId);
        setCartItems(updatedCart);
        updateTotals(updatedCart);

        try {
            await axios.post('http://localhost:8000/cart/remove', { productId }, { withCredentials: true });
        } catch (err) {
            console.error("Failed to remove item:", err);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" variant="warning" />
            </div>
        );
    }

    return (
        <div className="container container-fluid">
            {cartItems.length === 0 ? (
                <h2 className="mt-5 text-center">Your Cart is Empty</h2>
            ) : (
                <>
                    <h2 className="mt-5">
                        Your Cart: <b>{cartItems.length} {cartItems.length === 1 ? "item" : "items"}</b>
                    </h2>

                    <div className="row d-flex justify-content-between">
                        <div className="col-12 col-lg-8">
                            <hr />
                            {cartItems.map((item, index) => (
                                <div className="cart-item" key={index}>
                                    <div className="row align-items-center text-center text-lg-left">
                                        <div className="col-4 col-lg-3">
                                            <img
                                                src={item.images[0].image}
                                                alt={item.name}
                                                height="90"
                                                width="115"
                                            />
                                        </div>

                                        <div className="col-5 col-lg-3">
                                            <Link to={`/product/${item._id}`}>{item.name}</Link>
                                        </div>

                                        <div className="col-4 col-lg-2 mt-2 mt-lg-0">
                                            <p className="mb-0">₹{item.price.toFixed(2)}</p>
                                        </div>

                                        <div className="col-6 col-lg-3 mt-2 mt-lg-0">
                                            <div className="stockCounter d-flex align-items-center justify-content-center">
                                                <span className="btn btn-danger minus"
                                                    onClick={() => handleQuantityChange(item._id, 'dec')}>-</span>
                                                <input
                                                    type="number"
                                                    className="form-control count mx-2"
                                                    value={item.quantity}
                                                    readOnly
                                                    style={{ width: "60px", textAlign: "center" }}
                                                />
                                                <span className="btn btn-primary plus"
                                                    onClick={() => handleQuantityChange(item._id, 'inc')}>+</span>
                                            </div>
                                        </div>

                                        <div className="col-2 col-lg-1 mt-2 mt-lg-0">
                                            <i className="fa fa-trash btn btn-danger"
                                                onClick={() => handleRemoveItem(item._id)}></i>
                                        </div>
                                    </div>
                                    <hr />

                                    
                                </div>

                            ))}

                            {/*Coupon Input*/}
                                    <div className="col container">

                                        <div className="mt-4">
                                            <label htmlFor="coupon" className="form-label">Have a coupon?</label>
                                            <div className="input-group w-50">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="coupon"
                                                    placeholder="Enter coupon code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                />
                                                <button
                                                    className="btn btn-outline-success mx-3"
                                                    onClick={applyCoupon}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            {couponMessage && <small className="text-success">{couponMessage}</small>}
                                        </div>

                                    </div>
                        </div>

                        <div className="col-12 col-lg-3 my-4">
                            <div className="card shadow rounded-4 border-0">
                                <div className="card-body">
                                    <h5 className="card-title text-center mb-4">Order Summary</h5>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Sub Total</span>
                                            <span>₹{totalPrice}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Total Units</span>
                                            <span>₹{totalUnits}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Shipping</span>
                                            <span className="text-success">Free</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Discount</span>
                                            <span className="text-danger">- ₹{discount.toFixed(2)}</span>

                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Tax (5%)</span>
                                            <span>₹{(totalPrice * 0.05).toFixed(2)}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between fw-bold fs-6 border-top pt-3">
                                            <span>Total Price</span>
                                            {/* <span>₹{(parseFloat(totalPrice) * 1.05).toFixed(2)}</span> */}
                                            <span>₹{((parseFloat(totalPrice) - discount) * 1.05).toFixed(2)}</span>

                                        </li>
                                    </ul>

                                    <button className="btn btn-success w-100 mt-4 rounded-pill" onClick={CheckOutHandler}>
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>
                        </div>






                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
