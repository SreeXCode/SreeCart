import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Carousel } from 'react-bootstrap'

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = async () => {
        try {
            // Optional: get JWT token if you're using it from localStorage or cookies
            const response = await axios.post(
                'http://localhost:8000/cart/add',
                {
                    productId: product._id,
                    quantity: quantity
                },
                {
                    withCredentials: true // if your backend uses cookie-based auth
                }
            );

            alert(response.data.message || "Item added to cart!");

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message);
            } else {
                alert("Failed to add item to cart");
            }
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/product/${id}`, {
                    withCredentials: true
                });
                setProduct(response.data.SingleProduct);
            } catch (error) {
                setError(error.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden"></span>
                </div>
            </div>
        );
    }

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <Helmet>
                <title>{product.name}</title>
            </Helmet>
            <div className="row f-flex justify-content-around mb-5">
                <div className="col-12 col-lg-5 img-fluid" id="product_image">

                    <Carousel pause="hover">
                        {product.images && product.images.length > 0 && product.images.map(image =>
                            <Carousel.Item key={image._id}>
                                <img
                                    className="d-block mx-auto img-fluid"
                                    src={image.image}
                                    alt={product.name}
                                    style={{
                                        height: 'auto',        // allow height to adjust naturally
                                        maxHeight: '400px',     // limit max height
                                        width: '100%',          // full width inside container
                                        maxWidth: '350px'       // max width control
                                    }}
                                />
                            </Carousel.Item>
                        )}
                    </Carousel>


                </div>

                <div className="col-12 col-sm-10 col-md-8 col-lg-5 mt-5 px-5 mx-auto">
                    <h3>{product.name}</h3> {/* dynamic name */}
                    <p id="product_id">product id : {product._id}</p> {/* dynamic product ID */}

                    <hr />

                    <div className="rating-outer">
                        <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
                    </div>
                    <span id="no_of_reviews">({product.numOfReviews} Reviews)</span>

                    <hr />

                    <p id="product_price">₹{product.price}</p>

                    <div className="stockCounter d-inline">

                        <span
                            className={`btn btn-danger minus ${quantity <= 1 ? 'disabled' : ''}`}
                            onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : prev))}
                        >
                            -
                        </span>

                        <input
                            type="number"
                            className="form-control count d-inline"
                            value={quantity}
                            readOnly
                        />

                        <span
                            className={`btn btn-primary plus ${quantity >= product.stock ? 'disabled' : ''}`}
                            onClick={() => setQuantity(prev => (prev < product.stock ? prev + 1 : prev))}
                        >
                            +
                        </span>

                    </div>

                    <button
                        type="button"
                        id="cart_btn"
                        className="btn btn-primary d-inline ml-4"
                        disabled={product.stock === 0}
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>


                    <hr />

                    <p>Status:
                        <span id="stock_status" className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </p>

                    <hr />

                    <h4 className="mt-2">Description:</h4>
                    <p>{product.description}</p> {/* dynamic description */}

                    <hr />

                    <p id="product_seller" className="mb-3">Sold by: <strong>{product.seller}</strong></p>

                    <button
                        id="review_btn"
                        type="button"
                        className="btn btn-primary mt-4"
                        data-toggle="modal"
                        data-target="#ratingModal"
                    >
                        Submit Your Review
                    </button>

                    {/* Modal code stays same */}
                </div>
            </div>
        </>
    );
}

export default ProductDetails;
