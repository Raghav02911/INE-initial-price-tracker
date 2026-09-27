import React, { useState, useRef } from 'react';
import { searchProducts, trackProduct } from '../services/api';
import { Search, PlusCircle, CheckCircle, Loader2, Package } from 'lucide-react';

export default function SearchProduct({ onProductAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const searchTimeout = useRef(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedProduct(null);
    setSelectedOption('');
    setFeedback(null);

    if (val.trim().length < 1) {
      setResults([]);
      return;
    }

    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        setLoading(true);
        const { data } = await searchProducts(val);
        setResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setQuery(product.name);
    setResults([]);
    if (product.options && product.options.length > 0) {
      setSelectedOption(product.options[0]);
    }
  };

  const handleTrack = async () => {
    if (!selectedProduct || !selectedOption) {
      setFeedback({ type: 'error', message: 'Please select a product option.' });
      return;
    }

    try {
      setTrackingLoading(true);
      setFeedback(null);
      await trackProduct(
        selectedProduct.id,
        selectedProduct.name,
        selectedOption
      );
      setFeedback({
        type: 'success',
        message: `Successfully tracked "${selectedProduct.name}" (${selectedOption})`
      });
      setQuery('');
      setSelectedProduct(null);
      setSelectedOption('');
      if (onProductAdded) onProductAdded();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to track product. Please try again.'
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-slate-700" />
        <h2 className="text-lg font-semibold text-slate-900">Add Product to Track</h2>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search products in INE catalog..."
          value={query}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}

        {/* Dropdown Results */}
        {results.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
            {results.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{prod.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{prod.options.length} variant(s) available</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-800 rounded">
                  ₹{prod.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Selected Product</span>
            <p className="text-sm font-semibold text-slate-900">{selectedProduct.name}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Variant / Option
            </label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {selectedProduct.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTrack}
            disabled={trackingLoading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {trackingLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding Product...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Start Tracking Price
              </>
            )}
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
