import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Link, useParams } from "react-router-dom";
import Pagination from 'react-js-pagination';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

function ProductSearch() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { keyword } = useParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [productCount, setProductCount] = useState(0);
    const [resPerPage, setResPerPage] = useState(8); // default 8 (you can change)

    const [priceRange, setPriceRange] = useState([10000, 100000]);  // Actual filter used in API
    const [tempPriceRange, setTempPriceRange] = useState([10000, 100000]);  // Live slider value

    const categories = ['Smart Phones', 'Laptops', 'Television', 'Smart Watch', 'Ear Buds'];
    const [selectedCategory, setSelectedCategory] = useState(''); // Track selected category
    // Function to handle category click
    const handleCategoryClick = (category) => {
        setSelectedCategory(category); // Update selected category
    };

    const HandleWithTooltip = (node, { dragging, value, index }) => {
        return (
            <Tooltip
                key={index}
                overlay={`₹${value}`}
                visible={dragging}
                placement="top"
            >
                {node}
            </Tooltip>
        );
    };

    const SetPageNumber = (pageNo) => {
        setCurrentPage(pageNo)
    }
    useEffect(() => {
        const handleKeywordChange = async () => {
            // Optional: await something here
            setCurrentPage(1);
        };
        handleKeywordChange();
    }, [keyword, priceRange, selectedCategory]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const [minPrice, maxPrice] = priceRange;

                const response = await axios.get(`http://localhost:8000/products`, {
                    params: {
                        keyword,
                        pageNo: currentPage,
                        'price[gte]': minPrice,
                        'price[lte]': maxPrice,
                        category: selectedCategory
                    },
                    withCredentials: true
                });

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
    }, [keyword, currentPage, priceRange, selectedCategory]); // ✅ only fetch when priceRange changes

    return (
        <>
            <div>
                <Helmet>
                    <title>Buy Best Product - Sree Cart</title>
                    <meta name="description" content="Your favorite online store!" />
                </Helmet>

                <h1 id="products_heading" className='mt-3 mb-3 text-center'>Products for: {keyword || 'All'}</h1>


                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden"></span>
                        </div>
                    </div>
                ) : error ? (
                    <h2>Error: {error}</h2>
                ) : (

                    <div className='container-fluid'>
                        <div className="row">

                            <div className="col-sm-12 col-md-4 col-lg-3">
                                {/* Price Filter */}
                                <div className="px-5 py-4 bg-light rounded">
                                    <h5 className="mb-3 text-center">Filter by Price Range</h5>

                                    <Slider
                                        className='container-fluid'
                                        range
                                        min={10000}
                                        max={100000}
                                        marks={{ 10000: "₹10K", 100000: "₹1L" }}
                                        value={tempPriceRange}
                                        onChange={(value) => setTempPriceRange(value)}
                                        handleRender={HandleWithTooltip} // ✅ correct prop name
                                    />

                                </div>
                                <button
                                    className="w-75 d-flex justify-content-center align-items-center mx-auto btn btn-warning mt-3"
                                    onClick={() => setPriceRange(tempPriceRange)} // this will trigger API fetch
                                >
                                    Apply Filter
                                </button>

                                <hr className="mt-4 border border-warning" />

                                {/* Category Filter */}
                                <div className="container-fluid">
                                    <h3 className="text-center">Categories</h3>
                                    <ul>
                                        {categories.map((category, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleCategoryClick(category)}
                                                style={{ cursor: 'pointer', fontWeight: selectedCategory === category ? 'bold' : 'normal' }}
                                            >
                                                {category}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Column 2: Product List */}
                            <div className="col-sm-12 col-md-8 col-lg-9">
                                <div className="row">
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <div className="col-sm-12 col-md-6 col-lg-3 " key={product._id}>
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
                                        <h4 className="text-center">No products found!</h4>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                )}


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

            </div>
        </>
    );
}

export default ProductSearch;
