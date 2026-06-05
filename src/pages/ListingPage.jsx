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
        const formatted = data.products.map(p => ({
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
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFilteredProducts(1);
  }, [debouncedSearch, selectedCat, rxFilter, inStockFilter, sort]);

  return (
    <div style={s.page}>
      <h1 style={{ ...s.sectionTitle, fontSize: 28, marginBottom: 4 }}>All Medicines</h1>
      <p style={s.sectionSub}>Showing {products.length} products {loading && "(Loading...)"}</p>
      <div style={s.listingLayout}>
        <div style={s.filterSidebar}>
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
            <div style={s.filterTitle}>Categories</div>
            {dynamicCategories.map(cat => (
              <div key={cat} style={{ ...s.filterOption, color: selectedCat === cat ? COLORS.primary : COLORS.text }}
                onClick={() => setSelectedCat(cat)}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selectedCat === cat ? COLORS.primary : COLORS.border}`, background: selectedCat === cat ? COLORS.primary : "transparent", flexShrink: 0 }} />
                {cat}
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 16, paddingTop: 16 }}>
              <div style={s.filterTitle}>Filters</div>
              <div style={{ ...s.filterOption }} onClick={() => setRxFilter(!rxFilter)}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${rxFilter ? COLORS.primary : COLORS.border}`, background: rxFilter ? COLORS.primary : "transparent", flexShrink: 0 }} />
                Prescription Only
              </div>
              <div style={{ ...s.filterOption }} onClick={() => setInStockFilter(!inStockFilter)}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${inStockFilter ? COLORS.primary : COLORS.border}`, background: inStockFilter ? COLORS.primary : "transparent", flexShrink: 0 }} />
                In Stock Only
              </div>
            </div>
          </div>
        </div>

        <div style={s.listingMain}>
          <div style={s.listingHeader}>
            <div style={s.searchBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: COLORS.textMuted }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input style={s.searchInput} placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select style={s.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Best Discount</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          {products.length === 0 && !loading
            ? <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textMuted }}>
              <div style={{ marginBottom: 16, color: COLORS.border }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div style={{ fontWeight: 600 }}>No products found</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Try a different search or category</div>
            </div>
            : <div style={{ ...s.prodGrid, gridTemplateColumns: "repeat(3, 1fr)" }}>
              {products.map(p => (
                <ProductCard key={p.id} product={p}
                  onClick={() => { setSelectedProduct(p); setPage("detail"); }}
                  onAddToCart={onAddToCart}
                  isWishlisted={wishlist?.some(w => w.id === p.id)}
                  onToggleWishlist={() => toggleWishlist(p)}
                />
              ))}
            </div>
          }
          {currentPage < totalPages && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button 
                style={{ background: "#fff", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", color: COLORS.text }}
                onClick={() => fetchFilteredProducts(currentPage + 1)}
                disabled={loading}
              >
                Load More Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
