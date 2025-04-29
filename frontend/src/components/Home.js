import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Link } from "react-router-dom";
import Pagination from 'react-js-pagination';

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    console.log('products', products)

    const [currentPage, setCurrentPage] = useState(1);
    console.log('currentPage', currentPage)
    const [productCount, setProductCount] = useState(0); // <-- NEW
    const [resPerPage, setResPerPage] = useState(0); // default 8 per page (or you can wait from API)



    // const setCurrentPageNo = (pageNo) => {
    //     setCurrentPage(pageNo)
    // }


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/products?pageNo=${currentPage}`, {
                    withCredentials: true
                });
        
                console.log('response', response.data)
                setProducts(response.data.products);
                setProductCount(response.data.count); // <-- NEW
                setResPerPage(response.data.resPerPage); // <-- set resPerPage dynamically
                setCurrentPage(response.data.currentPage)
            } catch (error) {
                setError(error.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    },[currentPage]);


    return (
        <>
            <Helmet>
                <title>Buy Best Product - Sree Cart</title>
                <meta name="description" content="Your favorite online store!" />
            </Helmet>

            <h1 id="products_heading" className='text-center'>Latest Smart Phones</h1>

            <section id="products" className="container mt-5">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden"></span>
                        </div>
                    </div>
                ) : error ? (
                    <h2>Error: {error}</h2>
                ) : (
                    <div className="row">
                        {products.map((product) => (
                            <div className="col-sm-12 col-md-6 col-lg-3 my-3" key={product._id}>
                                <div className="card p-3 rounded">
                                    <img
                                        className="card-img-top mx-auto"
                                        src={product.images[0].image}
                                        alt={product.name}

                                    />
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">
                                            <Link to={`/product/${product._id}`}> {product.name} </Link>
                                        </h5>
                                        <div className="ratings mt-auto">
                                            <div className="rating-outer">
                                                <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
                                            </div>
                                            <span id="no_of_reviews">({product.numOfReviews} Reviews)</span>
                                        </div>
                                        <p className="card-text">₹{product.price}</p>
                                        <Link to={`/product/${product._id}`} id="view_btn" className="btn btn-block">
                                            View Details
                                        </Link>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {productCount > 0 && productCount > resPerPage ?
                <div className='d-flex justify-content-center mt-5'>
                    <Pagination
                        activePage={currentPage}
                        onChange={setCurrentPage}
                        totalItemsCount={productCount}
                        itemsCountPerPage={resPerPage}
                        nextPageText={'Next'}
                        firstPageText={'First'}
                        lastPageText={'Last'}
                        itemClass={'page-item'} // bootstap class
                        linkClass={'page-link'} // bootstap class


                    />
                </div> : null}
        </>
    );
}

export default Home;
