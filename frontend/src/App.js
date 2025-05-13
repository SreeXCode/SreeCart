import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Footer from './components/layouts/Footer';
import Header from './components/layouts/Header';
import { HelmetProvider } from 'react-helmet-async'
import Home from './components/Home';
import ProductDetails from './components/product/ProductDetail';
import ProductSearch from './components/product/ProductSearch';
import Login from './components/user/Login';
import Register from './components/user/Register';
import { AuthProvider } from './components/middlewares/AuthContext';
import Profile from './components/user/Profile';
import ProtectedRoute from './components/route/ProtectedRoute';
import UpdateProfile from './components/user/UpdateProfile';
import UpdatePassword from './components/user/UpdatePassword';
import ForgotPassword from './components/user/ForgotPassword';
import ResetPassword from './components/user/ResetPassword';
import Cart from './components/cart/Cart';
import Shipping from './components/cart/Shipping';



function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <HelmetProvider>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/search/:keyword" element={<ProductSearch />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProtectedRoute>  <Profile />  </ProtectedRoute>  } />
              <Route path="/profile/update" element={<ProtectedRoute> <UpdateProfile/> </ProtectedRoute>} />
              <Route path="/profile/update/password" element={<ProtectedRoute> <UpdatePassword/> </ProtectedRoute>} />
              <Route path='/password/forgot' element={<ForgotPassword/> } />
              <Route path='/password/reset/:token' element={<ResetPassword/> } />
              <Route path='/cart' element={<Cart /> } />
              <Route path='/shipping' element={<Shipping /> } />
            </Routes>
            <Footer />
          </HelmetProvider>
        </div>
      </AuthProvider>
    </Router>

  );
}

export default App;
