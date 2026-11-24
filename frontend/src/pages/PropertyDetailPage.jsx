import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "./propertyData";
import "./PropertyDetailPage.css";

const FAVORITES_URL = "http://localhost:5000/api/favorites";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function getImages(property) {
  const imageList = Array.isArray(property.images)
    ? property.images
    : Array.isArray(property.image_urls)
      ? property.image_urls
      : [];
  const images = imageList
    .map((image) =>
      typeof image === "string" ? image : image?.url || image?.image_url,
    )
    .filter(Boolean);

  return images.length ? images : property.image_url ? [property.image_url] : [];
}

function getRoomCount(rooms) {
  if (rooms == null) return "— beds";
  if (rooms === 0) return "Studio";
  return `${rooms} ${rooms === 1 ? "bed" : "beds"}`;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const routeProperty =
    String(location.state?.property?.id) === id
      ? location.state.property
      : null;
  const [property, setProperty] = useState(routeProperty || null);
  const [loading, setLoading] = useState(!routeProperty);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(
    Boolean(routeProperty?.is_favorite),
  );
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProperty() {
      if (routeProperty) setProperty(routeProperty);
      setLoading(!routeProperty);

      try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Loading listing failed (HTTP ${response.status}).`);
        }

        setProperty(data);
        setIsFavorite(Boolean(data.is_favorite));
        setError("");
      } catch (loadError) {
        if (loadError.name !== "AbortError" && !routeProperty) {
          setProperty(null);
          setError(loadError.message || "Could not load this listing.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProperty();
    return () => controller.abort();
  }, [id, routeProperty]);

  const images = property ? getImages(property) : [];
  const galleryImages = images.length ? images : [null];
  const activeImageIndex = Math.min(currentImageIndex, galleryImages.length - 1);
  const isForRent = property?.type === "rent";

  function showImage(index) {
    setCurrentImageIndex(
      (index + galleryImages.length) % galleryImages.length,
    );
  }

  async function toggleFavorite() {
    if (!property) return;

    if (!user) {
      setSaveMessage("Log in with a personal account to save this listing.");
      return;
    }
    if (user.role !== "user") {
      setSaveMessage("Only personal accounts can save listings.");
      return;
    }

    setSaving(true);
    setSaveMessage("");
    try {
      const response = await fetch(
        `${FAVORITES_URL}/${encodeURIComponent(property.id)}`,
        {
          method: isFavorite ? "DELETE" : "POST",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Log in with a personal account to save this listing."
            : `Could not update saved listing (HTTP ${response.status}).`,
        );
      }
      setIsFavorite(!isFavorite);
      setSaveMessage(isFavorite ? "Removed from saved listings." : "Listing saved.");
    } catch (saveError) {
      setSaveMessage(saveError.message || "Could not update saved listing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="property-detail-page">
      <div aria-hidden="true" className="property-detail-background">
        <div className="property-detail-background__black" />
        <svg
          className="property-detail-background__pattern"
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

      <main className="property-detail-main">
        <Link className="property-detail-back" to="/listings">
          &larr; Back to listings
        </Link>

        {loading && !property && (
          <p className="property-detail-message">Loading listing…</p>
        )}
        {!loading && !property && (
          <section className="property-detail-message" role="alert">
            <p>{error || "This listing could not be found."}</p>
          </section>
        )}

        {property && (
          <div className="property-detail-layout">
            <section className="property-gallery" aria-label="Property photos">
              <div className="property-gallery__main">
                {galleryImages[activeImageIndex] ? (
                  <img
                    src={galleryImages[activeImageIndex]}
                    alt={`${property.title}, photo ${activeImageIndex + 1}`}
                  />
                ) : (
                  <div className="property-gallery__placeholder">
                    No image available
                  </div>
                )}
              </div>

              <div className="property-gallery__controls">
                <button
                  type="button"
                  className="property-gallery__arrow property-gallery__arrow--previous"
                  aria-label="Previous photo"
                  disabled={galleryImages.length < 2}
                  onClick={() => showImage(activeImageIndex - 1)}
                />
                <div className="property-gallery__thumbnails">
                  {galleryImages.map((image, index) => (
                    <button
                      type="button"
                      key={image || `placeholder-${index}`}
                      className={`property-gallery__thumbnail${index === activeImageIndex ? " is-active" : ""}`}
                      aria-label={`Show photo ${index + 1}`}
                      aria-pressed={index === activeImageIndex}
                      onClick={() => showImage(index)}
                    >
                      {image ? (
                        <img src={image} alt="" />
                      ) : (
                        <span>No photo</span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="property-gallery__arrow property-gallery__arrow--next"
                  aria-label="Next photo"
                  disabled={galleryImages.length < 2}
                  onClick={() => showImage(activeImageIndex + 1)}
                />
              </div>

              <div
                className="property-gallery__dots"
                role="group"
                aria-label={`Photo ${activeImageIndex + 1} of ${galleryImages.length}`}
              >
                {galleryImages.map((image, index) => (
                  <button
                    type="button"
                    key={image || `dot-${index}`}
                    className={index === activeImageIndex ? "is-active" : ""}
                    aria-label={`Show photo ${index + 1}`}
                    aria-current={index === activeImageIndex ? "true" : undefined}
                    onClick={() => showImage(index)}
                  />
                ))}
              </div>
            </section>

            <aside className="property-detail-card">
              <span className="property-card__badge">
                {isForRent ? "For rent" : "For sale"}
              </span>
              <p className="property-detail-card__price">
                {formatPrice(property.price)}
                {isForRent && <span> / month</span>}
              </p>
              <h1 className="property-detail-card__title">{property.title}</h1>
              <p className="property-detail-card__location">
                {[property.address, property.city_name].filter(Boolean).join(", ") ||
                  "Address unavailable"}
              </p>
              <p className="property-detail-card__kind">
                {property.property_type || "Type unavailable"}
              </p>
              <div className="property-detail-card__details">
                <span>{getRoomCount(property.rooms)}</span>
                <span>
                  {property.bathrooms == null
                    ? "— baths"
                    : `${property.bathrooms} baths`}
                </span>
                <span>
                  {property.area_m2 == null ? "—" : `${property.area_m2} m²`}
                </span>
              </div>

              <section className="property-detail-card__description">
                <h2>Description</h2>
                <p>{property.description || "No description provided."}</p>
              </section>

              <div className="property-detail-card__save-area">
                <button
                  type="button"
                  className="property-detail-card__save"
                  disabled={saving || authLoading}
                  onClick={toggleFavorite}
                >
                  {saving
                    ? "Saving…"
                    : isFavorite
                      ? "Saved listing"
                      : "Save listing"}
                </button>
                {saveMessage && (
                  <p className="property-detail-card__save-message" role="status">
                    {saveMessage}
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
