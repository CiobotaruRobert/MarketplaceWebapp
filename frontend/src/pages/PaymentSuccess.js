import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./PaymentSuccess.css";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!orderId || hasRun.current) return;

    hasRun.current = true;

    axios.post("http://localhost:8080/api/orders/mark-paid", { orderId })
      .then(() => {
        toast.success("Plata a fost realizată cu succes!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => navigate("/"), 1500);
      })
      .catch(err => {
        console.error(err);
        toast.error("A apărut o eroare la procesarea plății.", { autoClose: 4000 });
        setTimeout(() => navigate("/"), 4000);
      });
  }, [orderId, navigate]);

  return (
    <div className="payment-processing-page">
      <div className="payment-processing-container">
        <div className="spinner"></div>
        <h2>Procesăm plata...</h2>
        <p>Te rugăm să nu închizi această pagină.</p>
      </div>
    </div>
  );
}
