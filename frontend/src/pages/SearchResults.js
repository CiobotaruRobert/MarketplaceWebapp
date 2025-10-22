import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SearchResults.css";
import SearchBar from "../components/SearchBar";

export default function SearchResults() {
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!query) return;

    const params = new URLSearchParams();
    params.append("q", query);
    if (selectedCategory) params.append("categoryId", selectedCategory);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    params.append("page", page);
    params.append("size", 8);

    axios
      .get(`http://localhost:8080/api/ads/search?${params.toString()}`)
      .then((res) => {
        const ads = Array.isArray(res.data.content) ? res.data.content : [];
        setResults(ads);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => {
        setError("Eroare la căutare.");
      });
  }, [query, selectedCategory, minPrice, maxPrice, page]);

  const handleReset = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <div className="search-results-container">
      <SearchBar />

      <div className="filters">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Toate categoriile</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Preț minim"
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="number"
          placeholder="Preț maxim"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            setPage(1);
          }}
        />

        <button onClick={handleReset}>Reset</button>
      </div>

      {error && <p className="error">{error}</p>}

      {results.length === 0 ? (
        <p>Niciun rezultat găsit.</p>
      ) : (
        <div className="results-wrapper">
          <div className="search-grid">
            {results.map((ad) => (
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
