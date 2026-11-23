import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditingPage.css";

export default function EditingPage() {
  const navigate = useNavigate();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageError, setImageError] = useState("");
  const imageInputRef = useRef(null);
  const imageUrlsRef = useRef(new Set());

  useEffect(
    () => () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      imageUrlsRef.current.clear();
    },
    [],
  );

  const handleImageSelection = (event) => {
    const files = Array.from(event.currentTarget.files ?? []);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    setImageError(
      validFiles.length < files.length ? "Please select image files only." : "",
    );

    const previews = validFiles.map((file) => {
      const url = URL.createObjectURL(file);
      imageUrlsRef.current.add(url);
      return { name: file.name, url };
    });

    setImagePreviews((current) => [...current, ...previews]);
    event.currentTarget.value = "";
  };

  const removeImagePreview = (url) => {
    URL.revokeObjectURL(url);
    imageUrlsRef.current.delete(url);
    setImagePreviews((current) =>
      current.filter((preview) => preview.url !== url),
    );
  };

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
        <section className="listing-card">
          <div className="listing-columns">
            <div className="listing-details">
              <div className="listing-field">
                <label
                  htmlFor="listing-title"
                  className="listing-label"
                >
                  Title
                </label>
                <input
                  id="listing-title"
                  name="title"
                  type="text"
                  placeholder="Property title"
                  className={styles.input}
                />
              </div>

              <div className="listing-field">
                <label
                  htmlFor="listing-address"
                  className="listing-label"
                >
                  Address
                </label>
                <input
                  id="listing-address"
                  name="address"
                  type="text"
                  placeholder="Property address"
                  className={styles.input}
                />
              </div>

              <div className="listing-fields-grid">
                <div className="listing-field listing-field--small">
                  <label
                    htmlFor="listing-price"
                    className="listing-label"
                  >
                    Price ($)
                  </label>
                  <input
                    id="listing-price"
                    name="price"
                    type="number"
                    min="0"
                    placeholder="Price"
                    className={styles.smallInput}
                  />
                </div>

                <div className="listing-field listing-field--small">
                  <label
                    htmlFor="listing-area"
                    className="listing-label"
                  >
                    Area (m²)
                  </label>
                  <input
                    id="listing-area"
                    name="area_m2"
                    type="number"
                    min="1"
                    placeholder="Area"
                    className={styles.smallInput}
                  />
                </div>

                <div className="listing-field listing-field--small">
                  <label
                    htmlFor="listing-property-type"
                    className="listing-label"
                  >
                    Property type
                  </label>
                  <select
                    id="listing-property-type"
                    name="property_type"
                    defaultValue=""
                    className={styles.select}
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                <div className="listing-field listing-field--small">
                  <label
                    htmlFor="listing-status"
                    className="listing-label"
                  >
                    Status
                  </label>
                  <select
                    id="listing-status"
                    name="status"
                    defaultValue=""
                    className={styles.select}
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="sale">For sale</option>
                    <option value="rent">For rent</option>
                  </select>
                </div>

                <div className="listing-field listing-field--small">
                  <label
                    htmlFor="listing-bedrooms"
                    className="listing-label"
                  >
                    Bedrooms
                  </label>
                  <select
                    id="listing-bedrooms"
                    name="bedrooms"
                    defaultValue=""
                    className={styles.select}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="0">Studio</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div className="listing-field listing-field--small">
                  <label
                    htmlFor="listing-bathrooms"
                    className="listing-label"
                  >
                    Bathrooms
                  </label>
                  <select
                    id="listing-bathrooms"
                    name="bathrooms"
                    defaultValue=""
                    className={styles.select}
                  >
                    <option value="" disabled>
                      Select
                    </option>
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
                <label
                  htmlFor="listing-description"
                  className="listing-label"
                >
                  Description
                </label>
                <textarea
                  id="listing-description"
                  name="description"
                  rows={6}
                  placeholder="Describe the property"
                  className="listing-description"
                />
              </div>

              <div className="listing-field">
                <p className="listing-label">
                  Images
                </p>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
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
                    <span className="listing-image-add__plus" aria-hidden="true">
                      +
                    </span>
                    <span>{imagePreviews.length ? "Add more" : "Add images"}</span>
                  </button>
                </div>
                {imageError && (
                  <p className="listing-image-error" role="alert">
                    {imageError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="listing-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="listing-button listing-button--cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              className="listing-button listing-button--save"
            >
              Save listing
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  input: "listing-control listing-control--large",
  smallInput: "listing-control listing-control--small",
  select: "listing-control listing-control--small listing-control--select",
};
