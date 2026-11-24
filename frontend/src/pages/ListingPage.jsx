import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ListingPage.css";

import { API_URL } from "./propertyData";
const PAGE_SIZE = 50;
const DISPLAY_PAGE_SIZE = 6;

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function PropertyCard({ property }) {
  const isForRent = property.type === "rent";
  const roomCount =
    property.rooms == null
      ? "— beds"
      : property.rooms === 0
        ? "Studio"
        : `${property.rooms} ${property.rooms === 1 ? "bed" : "beds"}`;

  return (
    <Link
      className="property-card-link"
      to={`/listings/${property.id}`}
      state={{ property }}
    >
      <article className="property-card">
        <div className="property-card__media">
          {property.image_url ? (
            <img
              className="property-card__image"
              src={property.image_url}
              alt={property.title}
            />
          ) : (
            <div className="property-card__image-placeholder">
              No image available
            </div>
          )}
          <span className="property-card__badge">
            {isForRent ? "For rent" : "For sale"}
          </span>
        </div>
        <div className="property-card__body">
          <p className="property-card__price">
            {formatPrice(property.price)}
            {isForRent && <span> / month</span>}
          </p>
          <h2 className="property-card__title">{property.title}</h2>
          <p className="property-card__location">
            {[property.address, property.city_name].filter(Boolean).join(", ") ||
              "Address unavailable"}
          </p>
          <p className="property-card__kind">
            {property.property_type || "Type unavailable"}
          </p>
          <div className="property-card__details">
            <span>{roomCount}</span>
            <span>
              {property.bathrooms == null ? "— baths" : `${property.bathrooms} baths`}
            </span>
            <span>{property.area_m2 == null ? "—" : `${property.area_m2} m²`}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function ListingPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");

  function updateFilter(setFilter, event) {
    setFilter(event.target.value);
    setCurrentPage(1);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadPage(page) {
      const response = await fetch(
        `${API_URL}?page=${page}&limit=${PAGE_SIZE}`,
        { signal: controller.signal },
      );
      if (!response.ok) {
        let message = `Loading listings failed (HTTP ${response.status}).`;
        try {
          const errorData = await response.json();
          message = errorData.error || message;
        } catch {
          // Keep the HTTP status message when the server does not return JSON.
        }
        throw new Error(message);
      }

      const data = await response.json();
      if (!Array.isArray(data.items)) {
        throw new Error("The listings response has an unexpected format.");
      }
      return data;
    }

    async function loadProperties() {
      setLoading(true);

      try {
        const firstPage = await loadPage(1);
        const allProperties = [...firstPage.items];
        const totalPages = Math.max(1, Number(firstPage.pages) || 1);

        for (let page = 2; page <= totalPages; page += 1) {
          const nextPage = await loadPage(page);
          allProperties.push(...nextPage.items);
        }

        setProperties(allProperties);
        setError("");
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setProperties([]);
          setError(loadError.message || "Could not load listings.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProperties();
    return () => controller.abort();
  }, []);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    const min = minBudget === "" ? null : Number(minBudget);
    const max = maxBudget === "" ? null : Number(maxBudget);

    return properties.filter((property) => {
      const matchesSearch =
        !query ||
        [property.address, property.city_name, property.title]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      const matchesType = !type || property.type === type;
      const matchesMin = min === null || property.price >= min;
      const matchesMax = max === null || property.price <= max;

      return matchesSearch && matchesType && matchesMin && matchesMax;
    });
  }, [properties, search, type, minBudget, maxBudget]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / DISPLAY_PAGE_SIZE),
  );
  const currentProperties = filteredProperties.slice(
    (currentPage - 1) * DISPLAY_PAGE_SIZE,
    currentPage * DISPLAY_PAGE_SIZE,
  );

  return (
    <div className="listings-page">
      <div aria-hidden="true" className="listings-background">
        <div className="listings-background__black" />
        <svg
          className="listings-background__pattern"
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

      <main className="listings-main">
        <h1 className="listings-heading">Find your next home</h1>

        <section className="listings-filter-panel" aria-label="Filter listings">
          <div className="listings-filters">
            <div className="listing-filter listing-filter--search">
              <label htmlFor="listing-search">Address or city</label>
              <input
                id="listing-search"
                type="search"
                placeholder="Search by address or city"
                value={search}
                onChange={(event) => updateFilter(setSearch, event)}
              />
            </div>

            <div className="listing-filter listing-filter--type">
              <label htmlFor="listing-type-filter">Property type</label>
              <select
                id="listing-type-filter"
                value={type}
                onChange={(event) => updateFilter(setType, event)}
              >
                <option value="">All types</option>
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
              </select>
            </div>

            <div className="listing-filter listing-filter--budget">
              <label htmlFor="minimum-budget">Min budget ($)</label>
              <input
                id="minimum-budget"
                type="number"
                min="0"
                placeholder="No minimum"
                value={minBudget}
                onChange={(event) => updateFilter(setMinBudget, event)}
              />
            </div>

            <div className="listing-filter listing-filter--budget">
              <label htmlFor="maximum-budget">Max budget ($)</label>
              <input
                id="maximum-budget"
                type="number"
                min="0"
                placeholder="No maximum"
                value={maxBudget}
                onChange={(event) => updateFilter(setMaxBudget, event)}
              />
            </div>
          </div>
        </section>

        <div className="listings-results-heading" aria-live="polite">
          <h2>Properties</h2>
          {!loading && properties.length > 0 && !error && (
            <span>
              Showing {filteredProperties.length} of {properties.length} listings
            </span>
          )}
        </div>

        {loading && <p className="listings-message">Loading listings…</p>}
        {!loading && error && (
          <p className="listings-message" role="alert">{error}</p>
        )}
        {!loading && filteredProperties.length === 0 && (
          !error && <p className="listings-message">No listings match your filters.</p>
        )}
        {!loading && !error && filteredProperties.length > 0 && (
          <div className="property-list">
            {currentProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
        {!loading && !error && (
          <nav className="listing-pagination" aria-label="Listing pages">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}