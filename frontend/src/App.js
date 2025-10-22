import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostAd from "./pages/PostAd.js";
import ViewAd from "./pages/ViewAd";
import Navbar from "./components/Navbar";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatPage from './pages/ChatPage';
import FavoriteAds from './pages/FavoriteAds.js';
import SearchResults from "./pages/SearchResults";
import MyAdsPage from "./pages/MyAdsPage.js";
import UserProfile from "./pages/UserProfile.js";
import EditAd from "./pages/EditAd.js";
import VerifyAccount from "./pages/VerifyAccount.js";
import BuyerForm from "./pages/BuyerForm.js";
import SellerForm from "./pages/SellerForm.js";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PaymentSuccess from "./pages/PaymentSuccess";

function isTokenValid() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export default function App() {

  const isAuthenticated = isTokenValid();

  return (
    <Router>
            <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/favorites" element={<FavoriteAds />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/ad/:id" element={<ViewAd />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/my-ads" element={<MyAdsPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/edit-ad/:id" element={<EditAd />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/buyer-form" element={<BuyerForm />} />
        <Route path="/submit-seller-info" element={<SellerForm />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </Router>
  );
}
