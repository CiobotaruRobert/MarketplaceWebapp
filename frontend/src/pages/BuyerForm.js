import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./BuyerForm.css";

export default function BuyerForm({ ad, buyerId, onClose }) {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PAY_ON_DELIVERY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!address.trim() || !phone.trim()) {
      setError("Te rog completează adresa și numărul de telefon.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:8080/api/orders/submit-buyer", {
        adId: ad.id,
        buyerId,
        buyerAddress: address,
        buyerPhone: phone,
        paymentMethod,
      });

      const order = res.data;

      if (paymentMethod === "PAY_ONLINE" && order.id) {
        const stripeRes = await axios.post("http://localhost:8080/api/orders/create-payment-session", {
          orderId: order.id
        });

        window.location.href = stripeRes.data.url;
        return;
      }

      toast.success("Trimis. Vânzătorul va fi notificat prin email.", {
        position: "top-right",
        autoClose: 3000,
        onClose: () => navigate("/")
      });

      onClose?.();
    } catch (err) {
      console.error(err);
      setError("A apărut o eroare la trimitere. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="buyer-page">
      <div className="buyer-container">
        <h2 className="buyer-title">Informații livrare - cumpărător</h2>

        {error && <div className="buyer-error">{error}</div>}

        <form className="buyer-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="buyerAddress">Adresă de livrare</label>
            <input
              id="buyerAddress"
              className="form-input"
              type="text"
              placeholder="Strada, număr, oraș"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="buyerPhone">Telefon</label>
            <input
              id="buyerPhone"
              className="form-input"
              type="tel"
              placeholder="+40 7xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Metodă plată</label>
            <select
              id="paymentMethod"
              className="form-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="PAY_ON_DELIVERY">Plată la livrare</option>
              <option value="PAY_ONLINE">Plată online</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <button
              type="submit"
              className="buyer-button"
              disabled={submitting || !address || !phone}
            >
              {submitting ? "Se trimite..." : "Trimite"}
            </button>

            <button
              type="button"
              className="postad-button"
              onClick={() => onClose?.()}
            >
              Anulare
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
