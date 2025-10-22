import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [ads, setAds] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found, skipping favorite fetch.");
    return;
  }

  axios
    .get("http://localhost:8080/api/ads/favorites/ids", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      if (Array.isArray(res.data)) {
        setFavoriteIds(new Set(res.data));
      }
    })
    .catch((err) => {
      console.error("Failed to load favorite IDs", err);
    });
}, []);


const toggleFavorite = (adId, isFavorited) => {
  const url = `http://localhost:8080/api/ads/${adId}/favorite`;
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };

  if (isFavorited) {
    axios
      .delete(url, config)
      .then(() => {
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(adId);
          return newSet;
        });
      })
      .catch((err) => {
        console.error("Error toggling favorite", err);
      });
  } else {
    axios
      .post(url, {}, config)
      .then(() => {
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(adId);
          return newSet;
        });
      })
      .catch((err) => {
        console.error("Error toggling favorite", err);
      });
  }
};



useEffect(() => {
  axios
    .get("http://localhost:8080/api/categories")
    .then((res) => {
      console.log("Fetched categories:", res.data);
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      }
    })
    .catch(() => console.error("Failed to load categories"));
}, []);



useEffect(() => {
  axios.get("http://localhost:8080/api/ads")
    .then((res) => {
      if (Array.isArray(res.data)) {
        setAds(res.data.reverse());
      } else {
        setError("Format invalid.");
      }
    })
    .catch(() => setError("Eroare la încărcarea anunțurilor."));
}, []);



  return (
    <div className="home-container">
      <h1 className="home-title">Anunțuri recente</h1>
      <SearchBar />


      <div className="categories-container">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`category-button ${selectedCategory === cat.name ? "active" : ""}`}
          onClick={() => setSelectedCategory(cat.name)}
        >
          <img src={cat.iconUrl || "/default-icon.png"} alt="" className="category-icon" />
          {cat.name}
        </button>
      ))}
      {selectedCategory && (
        <button className="category-clear" onClick={() => setSelectedCategory(null)}>
          X Filtre
        </button>
      )}
    </div>


      {error && <p className="home-error">{error}</p>}

      {!Array.isArray(ads) ? (
        <p>Se încarcă...</p>
      ) : ads.length === 0 ? (
        <p className="home-empty">Momentan nu există anunțuri disponibile.</p>
      ) : (
        <div className="ad-grid">
                  {ads
            .filter((ad) =>
              selectedCategory ? ad.category?.name === selectedCategory : true
            )
            .map((ad) => (
              <div
                key={ad.id}
                className="ad-card"
                onClick={() => navigate(`/ad/${ad.id}`)}
              >
                {ad.photos && ad.photos.length > 0 ? (
                  <img
                    src={ad.photos[0].imageUrl}
                    alt={ad.title}
                    className="ad-image"
                  />
                ) : (
                  <div className="ad-image ad-image-placeholder">
                    Imagine indisponibilă
                  </div>
                )}
                <div className="ad-info">
                  <h2 className="ad-title">{ad.title}</h2>
                  <p className="ad-price">{ad.price} RON</p>
                  <p className="ad-location">
                    {ad.location || "Locație necunoscută"}
                  </p>
                  <button
                    className="favorite-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(ad.id, favoriteIds.has(ad.id));
                    }}
                  >
                    {favoriteIds.has(ad.id) ? (
                      <FaHeart color="red" size={20} />
                    ) : (
                      <FaRegHeart color="gray" size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
