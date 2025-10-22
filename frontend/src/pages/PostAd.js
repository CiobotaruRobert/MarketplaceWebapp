import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import "./PostAd.css";
import { jwtDecode } from "jwt-decode";

export default function PostAd() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const userId = jwtDecode(localStorage.getItem("token"))?.userId;
  const judete = [
    "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud",
    "Botoșani", "Brașov", "Brăila", "Buzău", "Caraș-Severin",
    "Călărași", "Cluj", "Constanța", "Covasna", "Dâmbovița",
    "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara",
    "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți",
    "Mureș", "Neamț", "Olt", "Prahova", "Satu Mare", "Sălaj",
    "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea",
    "Vaslui", "Vâlcea", "Vrancea"
  ];

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const onDrop = (acceptedFiles) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: true,
  });

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.append("userId", userId)
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("location", location)
    formData.append("category", category);

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await axios.post("http://localhost:8080/api/ads/post", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      navigate("/");
    } catch (err) {
      setError("Eroare la publicarea anunțului. Vă rugăm să reîncercați.");
    }
  };

  return (
    <div className="postad-page">
      <div className="postad-container">
        <h2 className="postad-title">Publică un nou anunț</h2>
        {error && <p className="postad-error">{error}</p>}
        <form onSubmit={handleSubmit} className="postad-form">
          <div className="form-group">
            <label>Titlu</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Descriere</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Locație</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              list="judete-list"
              required
              placeholder=""
            />
            <datalist id="judete-list">
              {judete.map((judet) => (
                <option key={judet} value={judet} />
              ))}
            </datalist>
          </div>
          <div className="form-row">
            <div className="form-group price-group">
              <label>Preț</label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <span className="price-currency">RON</span>
              </div>
            </div>


          <div className="form-group category-group">
            <label>Categorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Alege o categorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>


          <div className="form-group">
            <label>Imagini</label>
            <div
              {...getRootProps()}
              style={{
                border: "2px dashed #aaa",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Trage imaginile aici...</p>
              ) : (
                <p>Trage imaginile aici, sau apasă pentru a selecta fișiere</p>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {images.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    width: "100px",
                    height: "100px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      background: "rgba(255, 255, 255, 0.7)",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      width: "20px",
                      height: "20px",
                      padding: 0,
                      fontWeight: "bold",
                      lineHeight: "18px",
                    }}
                    title="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="postad-button">
            Publicare anunț
          </button>
        </form>
      </div>
    </div>
  );
}
