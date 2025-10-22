import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import "./PostAd.css";
import { jwtDecode } from "jwt-decode";
import "./EditAd.css";

export default function EditAd() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = jwtDecode(token)?.userId;
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

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/ads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const ad = res.data;
              console.log("Loaded ad data:", ad);

        setTitle(ad.title);
        setDescription(ad.description);
        setPrice(ad.price);
        setLocation(ad.location);
        setCategory(String(ad.category?.id || ""));
        setExistingImages(ad.photos || []);
      })
      .catch(() => {
        setError("Failed to load ad data.");
      });
  }, [id, token]);

  const onDrop = (acceptedFiles) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: true,
  });

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("location", location)
    formData.append("category", category);

    images.forEach((image) => {
      formData.append("images", image);
    });

    const existingImageIds = existingImages.map((img) => img.id);
    formData.append("existingImageIds", JSON.stringify(existingImageIds));

    try {
      await axios.put(`http://localhost:8080/api/ads/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/");
    } catch {
      setError("Eroare la modificarea anunțului. Vă rugăm să reîncercați.");
    }
  };

return (
  <div className="editad-page">
    <div className="editad-container">
      <h2 className="editad-title">Editează anunț</h2>
      {error && <p className="editad-error">{error}</p>}
      <form onSubmit={handleSubmit} className="editad-form">
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


        {existingImages.length > 0 && (
          <div className="images-preview-container">
            {existingImages.map((img, idx) => (
              <div key={img.id || idx} className="image-thumb">
                <img src={img.imageUrl} alt="existing" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(idx)}
                  className="remove-image-btn"
                  title="Șterge imagine"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label>Imagini</label>
          <div {...getRootProps()} className="image-dropzone">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Trage imaginile aici...</p>
            ) : (
              <p>Trage imaginile aici, sau apasă pentru a selecta fișiere</p>
            )}
          </div>

          <div className="images-preview-container">
            {images.map((file, idx) => (
              <div key={idx} className="image-thumb">
                <img src={URL.createObjectURL(file)} alt="preview" />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="remove-image-btn"
                  title="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="postad-button">
          Actualizează anunț
        </button>
      </form>
    </div>
  </div>
);
}
