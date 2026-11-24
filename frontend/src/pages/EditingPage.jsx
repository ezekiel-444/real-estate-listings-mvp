import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, CITIES_URL } from "./propertyData";
import "./EditingPage.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_URL_CHARS = 60 * 1024;

async function getErrorMessage(response, fallback) {
  try {
    const data = await response.json();
    if (Array.isArray(data.errors)) return data.errors.join(". ");
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not encode the selected image."));
    reader.readAsDataURL(blob);
  });
}

async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image compression is unavailable in this browser.");

    let scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    for (let sizeAttempt = 0; sizeAttempt < 5; sizeAttempt += 1) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.75, 0.65, 0.55, 0.45]) {
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", quality),
        );
        if (!blob) throw new Error("Could not compress the selected image.");
        if (blob.size * 1.4 > MAX_IMAGE_URL_CHARS) continue;

        const dataUrl = await blobToDataUrl(blob);
        if (dataUrl.length <= MAX_IMAGE_URL_CHARS) return dataUrl;
      }
      scale *= 0.75;
    }

    throw new Error("Could not reduce this image enough to save it.");
  } finally {
    bitmap.close();
  }
}

export default function EditingPage() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef(null);
  const imageUrlsRef = useRef(new Set());

  useEffect(
    () => () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      imageUrlsRef.current.clear();
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadCities() {
      try {
        const response = await fetch(CITIES_URL, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            await getErrorMessage(response, `Loading cities failed (HTTP ${response.status}).`),
          );
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The cities response has an unexpected format.");
        }
        setCities(data);
        if (data.length === 0) {
          setError("No cities are available. An admin must add a city before a listing can be saved.");
        }
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "Could not load cities.");
        }
      } finally {
        if (!controller.signal.aborted) setCitiesLoading(false);
      }
    }

    loadCities();
    return () => controller.abort();
  }, []);

  const handleImageSelection = (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please select image files only.");
      event.currentTarget.value = "";
      return;
    } else if (file.size > MAX_IMAGE_BYTES) {
      setImageError("The selected image must be 5 MB or less.");
      event.currentTarget.value = "";
      return;
    } else {
      setImageError("");
    }

    imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    imageUrlsRef.current.clear();
    const url = URL.createObjectURL(file);
    imageUrlsRef.current.add(url);
    setImagePreviews([{ file, name: file.name, url }]);
    event.currentTarget.value = "";
  };

  const removeImagePreview = (url) => {
    URL.revokeObjectURL(url);
    imageUrlsRef.current.delete(url);
    setImagePreviews((current) =>
      current.filter((preview) => preview.url !== url),
    );
    setImageError("");
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        title: formData.get("title").trim(),
        city_id: Number(formData.get("city_id")),
        address: formData.get("address").trim(),
        price: Number(formData.get("price")),
        area_m2: Number(formData.get("area_m2")),
        rooms: Number(formData.get("bedrooms")),
        type: formData.get("status"),
        description: formData.get("description").trim(),
        image_url: imagePreviews[0]
          ? await compressImage(imagePreviews[0].file)
          : null,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, `Saving listing failed (HTTP ${response.status}).`),
        );
      }

      navigate("/listings");
    } catch (saveError) {
      setError(saveError.message || "Could not save this listing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="editing-page">
      <div aria-hidden="true" className="editing-background">
        <div className="editing-background__black" />
        <svg
          className="editing-background__pattern"
          viewBox="0 0 1440 1080"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          {Array.from({ length: 300 }, (_, index) => (
            <circle
              key={index}
              cx={(index % 20) * 72 + 36}
              cy={Math.floor(index / 20) * 72 + 36}
              r={36}
              stroke="#1A0000"
              strokeWidth={6}
            />
          ))}
        </svg>
      </div>

      <main className="editing-main">
        <form className="listing-card" onSubmit={handleSubmit}>
          <div className="listing-columns">
            <div className="listing-details">
              <div className="listing-field">
                <label htmlFor="listing-title" className="listing-label">Title</label>
                <input
                  id="listing-title"
                  name="title"
                  type="text"
                  placeholder="Property title"
                  className={styles.input}
                  required
                />
              </div>

              <div className="listing-field">
                <p className="listing-label">Location</p>
                <div className="listing-location-fields">
                  <select
                    id="listing-city"
                    name="city_id"
                    aria-label="City"
                    defaultValue=""
                    className={styles.select}
                    required
                    disabled={citiesLoading || cities.length === 0}
                  >
                    <option value="" disabled>
                      {citiesLoading ? "Loading cities…" : "Select a city"}
                    </option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                  <input
                    id="listing-address"
                    name="address"
                    type="text"
                    aria-label="Street address"
                    placeholder="Street address"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className="listing-fields-grid">
                <div className="listing-field listing-field--small">
                  <label htmlFor="listing-price" className="listing-label">Price ($)</label>
                  <input
                    id="listing-price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Price"
                    className={styles.smallInput}
                    required
                  />
                </div>

                <div className="listing-field listing-field--small">
                  <label htmlFor="listing-area" className="listing-label">Area (m²)</label>
                  <input
                    id="listing-area"
                    name="area_m2"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Area"
                    className={styles.smallInput}
                    required
                  />
                </div>

                <div className="listing-field listing-field--small">
                  <label htmlFor="listing-property-type" className="listing-label">Property type</label>
                  <select
                    id="listing-property-type"
                    name="property_type"
                    defaultValue=""
                    className={styles.select}
                    required
                  >
                    <option value="" disabled>Select type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                <div className="listing-field listing-field--small">
                  <label htmlFor="listing-status" className="listing-label">Status</label>
                  <select
                    id="listing-status"
                    name="status"
                    defaultValue=""
                    className={styles.select}
                    required
                  >
                    <option value="" disabled>Select status</option>
                    <option value="sale">For sale</option>
                    <option value="rent">For rent</option>
                  </select>
                </div>

                <div className="listing-field listing-field--small">
                  <label htmlFor="listing-bedrooms" className="listing-label">Bedrooms</label>
                  <select
                    id="listing-bedrooms"
                    name="bedrooms"
                    defaultValue=""
                    className={styles.select}
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="0">Studio</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div className="listing-field listing-field--small">
                  <label htmlFor="listing-bathrooms" className="listing-label">Bathrooms</label>
                  <select
                    id="listing-bathrooms"
                    name="bathrooms"
                    defaultValue=""
                    className={styles.select}
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="1">1</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="listing-media">
              <div className="listing-field">
                <label htmlFor="listing-description" className="listing-label">Description</label>
                <textarea
                  id="listing-description"
                  name="description"
                  rows={6}
                  placeholder="Describe the property"
                  className="listing-description"
                />
              </div>

              <div className="listing-field">
                <p className="listing-label">Images</p>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="listing-file-input"
                  aria-label="Choose listing images"
                  onChange={handleImageSelection}
                />
                <div className="listing-image-gallery">
                  {imagePreviews.map((preview) => (
                    <div className="listing-image-item" key={preview.url}>
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="listing-image-preview"
                      />
                      <button
                        type="button"
                        className="listing-image-remove"
                        aria-label={`Remove ${preview.name}`}
                        title={`Remove ${preview.name}`}
                        onClick={() => removeImagePreview(preview.url)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="listing-image-add"
                    aria-label="Add images"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <span className="listing-image-add__plus" aria-hidden="true">+</span>
                    <span>{imagePreviews.length ? "Change image" : "Add image"}</span>
                  </button>
                </div>
                {imageError && (
                  <p className="listing-image-error" role="alert">{imageError}</p>
                )}
              </div>
            </div>
          </div>

          {error && <p className="listing-form-error" role="alert">{error}</p>}

          <div className="listing-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="listing-button listing-button--cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="listing-button listing-button--save"
              disabled={saving || citiesLoading || cities.length === 0}
            >
              {saving ? "Saving…" : "Save listing"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

const styles = {
  input: "listing-control listing-control--large",
  smallInput: "listing-control listing-control--small",
  select: "listing-control listing-control--small listing-control--select",
};
