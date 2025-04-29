import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Link, useParams } from "react-router-dom";
import Pagination from 'react-js-pagination';

function ProductSearch() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { keyword } = useParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [productCount, setProductCount] = useState(0);
    const [resPerPage, setResPerPage] = useState(8); // default 8 (you can change)

    const SetPageNumber = (pageNo) =>{
        setCurrentPage(pageNo)
    }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
    
                // If keyword changes, reset page first before fetching
                const pageNo = 1;
                setCurrentPage(pageNo);
    
                const response = await axios.get(`http://localhost:8000/products?keyword=${keyword}&pageNo=${pageNo}`, {
                    withCredentials: true
                });
    
                console.log('response', response.data);
    
                setProducts(response.data.products);
                setProductCount(response.data.count);
                setResPerPage(response.data.resPerPage);
    
            } catch (error) {
                setError(error.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
    
        fetchProducts();
    }, [keyword]);  // ✅ only depend on keyword here
    
    useEffect(() => {
        if (currentPage !== 1) {
            const fetchProducts = async () => {
                try {
                    setLoading(true);
    
                    const response = await axios.get(`http://localhost:8000/products?keyword=${keyword}&pageNo=${currentPage}`, {
                        withCredentials: true
                    });
    
                    console.log('response', response.data);
    
                    setProducts(response.data.products);
                    setProductCount(response.data.count);
                    setResPerPage(response.data.resPerPage);
    
                } catch (error) {
                    setError(error.message || 'Something went wrong');
                } finally {
                    setLoading(false);
                }
            };
    
            fetchProducts();
        }
    }, [currentPage]);  // ✅ only depend on currentPage here
    

    return (
        <>
            <Helmet>
                <title>Buy Best Product - Sree Cart</title>
                <meta name="description" content="Your favorite online store!" />
            </Helmet>

            <h1 id="products_heading" className='text-center'>Products for: {keyword || 'All'}</h1>

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
                        {products.length > 0 ? (
                            products.map((product) => (
                                <div className="col-sm-12 col-md-6 col-lg-3 my-3" key={product._id}>
                                    <div className="card p-3 rounded">
                                        <img
                                            className="card-img-top mx-auto"
                                            src={product.images[0]?.image}
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
                                            <Link to={`/product/${product._id}`} id="view_btn" className="btn btn-block btn-primary">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <h4 className='text-center'>No products found!</h4>
                        )}
                    </div>
                )}
            </section>

            {productCount > 0 && productCount > resPerPage &&
                <div className='d-flex justify-content-center mt-5'>
                    <Pagination
                        activePage={currentPage}
                        onChange={SetPageNumber}
                        totalItemsCount={productCount}
                        itemsCountPerPage={resPerPage}
                        nextPageText={'Next'}
                        prevPageText={'Prev'}
                        firstPageText={'First'}
                        lastPageText={'Last'}
                        itemClass={'page-item'}
                        linkClass={'page-link'}
                    />
                </div>
            }
        </>
    );
}

export default ProductSearch;
