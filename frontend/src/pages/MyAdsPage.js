import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyAdsPage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyAdsPage() {
  const [ads, setAds] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAds();
  }, [page]);

  const fetchAds = () => {
    axios
      .get(`http://localhost:8080/api/ads/my-ads?page=${page}&size=8`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAds(res.data);
          setTotalPages(1);
        } else {
          setAds(res.data.content || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(() => {
        setError("Eroare la încărcarea anunțurilor.");
      });
  };

const handleDelete = (e, adId) => {
  e.stopPropagation();

  const toastId = toast.info(
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p>Ștergi acest anunț?</p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          style={{ backgroundColor: "#d33", color: "#fff", padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={async () => {
            try {
              await axios.delete(`http://localhost:8080/api/ads/${adId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchAds();
              toast.dismiss(toastId);
              toast.success("Anunț șters cu succes!");
            } catch {
              toast.dismiss(toastId);
              toast.error("Ștergerea anunțului a eșuat.");
            }
          }}
        >
          Da
        </button>
        <button
          style={{ backgroundColor: "#ccc", padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={() => toast.dismiss(toastId)}
        >
          Anulează
        </button>
      </div>
    </div>,
    {
      autoClose: false,
      closeOnClick: false,
    }
  );
};

  const handleEdit = (e, adId) => {
    e.stopPropagation();
    navigate(`/edit-ad/${adId}`);
  };

  return (
    <div className="search-results-container">
            <h1 className="myads-title">Anunțurile tale</h1>

      {error && <p className="error">{error}</p>}

      {ads.length === 0 ? (
        <p style={{ textAlign: "center" }}>Nu ai niciun anunț publicat.</p>
      ) : (
        <div className="results-wrapper">
          <div className="search-grid">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="search-card"
                onClick={() => navigate(`/ad/${ad.id}`)}
              >
                {ad.photos?.[0]?.imageUrl ? (
                  <img src={ad.photos[0].imageUrl} alt={ad.title} />
                ) : (
                  <div className="placeholder">Fără imagine</div>
                )}

                <div className="card-details">
                  <h3>{ad.title}</h3>
                  <p>{ad.price} RON</p>
                  <span>{ad.location || "Locație necunoscută"}</span>
                </div>

                <div className="ad-buttons">
                  <button
                    className="edit-button"
                    onClick={(e) => handleEdit(e, ad.id)}
                  >
                    Editează
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) => handleDelete(e, ad.id)}
                  >
                    Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Înapoi
            </button>
            <span>
              Pagina {page} din {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Înainte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
