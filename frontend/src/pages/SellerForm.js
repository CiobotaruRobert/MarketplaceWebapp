import { useState } from "react";
import axios from "axios";
import "./SellerForm.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SellerForm({ onClose }) {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const query = useQuery();
  const orderId = query.get("orderId");
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
      const res = await axios.post("http://localhost:8080/api/orders/submit-seller", {
        orderId,
        sellerAddress: address,
        sellerPhone: phone,
      });

      toast.success("Comanda a fost completată cu succes!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => navigate("/"), 3000);

      onClose?.();
    } catch (err) {
      console.error(err);
      setError("A apărut o eroare la trimitere. Încearcă din nou.");
      toast.error("A apărut o eroare la trimitere.", { autoClose: 4000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="seller-page">
      <div className="seller-container">
        <h2 className="seller-title">Informații livrare - vânzător</h2>

        {error && <div className="seller-error">{error}</div>}

        <form className="seller-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="sellerAddress">Adresă de livrare</label>
            <input
              id="sellerAddress"
              className="form-input"
              type="text"
              placeholder="Strada, număr, oraș"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sellerPhone">Telefon</label>
            <input
              id="sellerPhone"
              className="form-input"
              type="tel"
              placeholder="+40 7xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <button
              type="submit"
              className="seller-button"
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
