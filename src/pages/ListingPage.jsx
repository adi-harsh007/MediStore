import React, { useState, useEffect } from 'react';
import { s, COLORS, API } from '../utils/theme';
import ProductCard from '../components/ProductCard';

export default function ListingPage({ setPage, setSelectedProduct, onAddToCart, categoryData, wishlist, toggleWishlist, selectedCat, setSelectedCat }) {
  const dynamicCategories = ["All", ...categoryData.map(c => c.name)];
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [rxFilter, setRxFilter] = useState(false);
  const [inStockFilter, setInStockFilter] = useState(false);

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Debounced search term for fetching
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchFilteredProducts = (pageNum = 1) => {
    setLoading(true);
    const query = new URLSearchParams({
      page: pageNum,
      limit: 12,
      sort,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(selectedCat !== "All" && { category: selectedCat }),
      ...(rxFilter && { rxFilter: "true" }),
      ...(inStockFilter && { inStockFilter: "true" })
    });

    fetch(`${API}/api/products?${query}`)
      .then(res => res.json())
      .then(data => {
        const formatted = (data.products || []).map(p => ({
          ...p,
          tags: [p.prescriptionRequired ? "Rx Only" : "OTC"],
          prescription: p.prescriptionRequired
        })).filter(p => p.isActive !== false);

        if (pageNum === 1) {
          setProducts(formatted);
        } else {
          setProducts(prev => {
            const newProducts = formatted.filter(newP => !prev.some(p => p.id === newP.id));
            return [...prev, ...newProducts];
          });
        }
        setTotalCount(data.total || formatted.length);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFilteredProducts(1);
  }, [debouncedSearch, selectedCat, rxFilter, inStockFilter, sort]);

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
            Dispensary Formulary
          </div>
          <h1 style={{ ...s.sectionTitle, fontSize: 30, marginBottom: 4 }}>
            {selectedCat === "All" ? "All Medicines" : selectedCat}
          </h1>
          <p style={{ ...s.sectionSub, marginBottom: 0 }}>
            Showing {products.length}{totalCount > 0 ? ` of ${totalCount}` : ""} formulations {loading && "· Updating..."}
          </p>
        </div>

        {selectedCat !== "All" && (
          <button
            onClick={() => setSelectedCat("All")}
            style={{
              background: COLORS.primaryLight, color: COLORS.primary,
              border: `1px solid ${COLORS.borderStrong}`, borderRadius: 8,
              padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer"
            }}
          >
            Clear Category: {selectedCat} ✕
          </button>
        )}
      </div>

      <div style={s.listingLayout}>
        <div style={s.filterSidebar}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
            <div style={s.filterTitle}>Therapeutic Class</div>
            {dynamicCategories.map(cat => {
              const active = selectedCat === cat;
              return (
                <div
                  key={cat}
                  style={{ ...s.filterOption, color: active ? COLORS.primary : COLORS.textMuted, fontWeight: active ? 700 : 500 }}
                  onClick={() => setSelectedCat(cat)}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 5,
                    border: `1.5px solid ${active ? COLORS.primary : COLORS.borderStrong}`,
                    background: active ? COLORS.primary : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: COLORS.primaryInk, fontSize: 10, fontWeight: 900, flexShrink: 0
                  }}>
                    {active ? "✓" : ""}
                  </div>
                  {cat}
                </div>
              );
            })}

            <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 16, paddingTop: 16 }}>
              <div style={s.filterTitle}>Dispensing Filters</div>
              <div
                style={{ ...s.filterOption, color: rxFilter ? COLORS.primary : COLORS.textMuted }}
                onClick={() => setRxFilter(!rxFilter)}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 5,
                  border: `1.5px solid ${rxFilter ? COLORS.primary : COLORS.borderStrong}`,
                  background: rxFilter ? COLORS.primary : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: COLORS.primaryInk, fontSize: 10, fontWeight: 900, flexShrink: 0
                }}>
                  {rxFilter ? "✓" : ""}
                </div>
                Prescription Only
              </div>
              <div
                style={{ ...s.filterOption, color: inStockFilter ? COLORS.primary : COLORS.textMuted }}
                onClick={() => setInStockFilter(!inStockFilter)}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 5,
                  border: `1.5px solid ${inStockFilter ? COLORS.primary : COLORS.borderStrong}`,
                  background: inStockFilter ? COLORS.primary : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: COLORS.primaryInk, fontSize: 10, fontWeight: 900, flexShrink: 0
                }}>
                  {inStockFilter ? "✓" : ""}
                </div>
                In Stock Only
              </div>
            </div>
          </div>
        </div>

        <div style={s.listingMain}>
          <div style={s.listingHeader}>
            <div style={s.searchBox}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: COLORS.primary }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                style={s.searchInput}
                placeholder="Search medicine name (e.g. Dolo, Metformin)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 14, padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            <select style={s.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Sort: Most Popular</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="discount">Sort: Best Discount</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {products.length === 0 && !loading ? (
            <div style={s.emptyCart}>
              <div style={{ marginBottom: 14, color: COLORS.primary }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 17, color: COLORS.text }}>No matching formulations</div>
              <div style={{ fontSize: 13.5, marginTop: 6, color: COLORS.textMuted }}>Try adjusting your search keyword or clearing active filters</div>
            </div>
          ) : (
            <div className="ms-prod-grid-3">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => { setSelectedProduct(p); setPage("detail"); }}
                  onAddToCart={onAddToCart}
                  isWishlisted={wishlist?.some(w => w.id === p.id)}
                  onToggleWishlist={() => toggleWishlist(p)}
                />
              ))}
            </div>
          )}

          {currentPage < totalPages && (
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button
                style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.borderStrong}`,
                  borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", color: COLORS.primary
                }}
                onClick={() => fetchFilteredProducts(currentPage + 1)}
                disabled={loading}
              >
                {loading ? "Loading..." : `Load More Formulations (${products.length} / ${totalCount})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
