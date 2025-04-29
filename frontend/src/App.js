import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Footer from './components/layouts/Footer';
import Header from './components/layouts/Header';
import { HelmetProvider } from 'react-helmet-async'
import Home from './components/Home';
import ProductDetails from './components/product/ProductDetail';
import ProductSearch from './components/product/ProductSearch';



function App() {
  return (
    <Router>
      <div className="App">
        <HelmetProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/search/:keyword" element={<ProductSearch />} />

          </Routes>
          <Footer />
        </HelmetProvider>
      </div>
    </Router>

  );
}

export default App;
