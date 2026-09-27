import React, { useState } from 'react';
import ProductDetail from './ProductDetail';
import { stopTrackingProduct, triggerScrapeRunNow } from '../services/api';
import { Play, Trash2, ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function TrackedProductsList({ products = [], onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [scrapingId, setScrapingId] = useState(null);
  const [batchScraping, setBatchScraping] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStopTracking = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to stop tracking this product?')) {
      try {
        await stopTrackingProduct(id);
        if (onRefresh) onRefresh();
      } catch (err) {
        alert('Error stopping tracking: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleRunBatchScrape = async () => {
    try {
      setBatchScraping(true);
      await triggerScrapeRunNow();
      alert('✓ Batch scrape completed successfully for all products!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Scrape run error: ' + (err.response?.data?.error || err.message));
    } finally {
      setBatchScraping(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No Tracked Products Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Use the search tool to find products from the INE store catalog and add them to your automated price tracking queue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tracked Products ({products.length})</h2>
          <p className="text-xs text-slate-500">Automated price checks occur every 2 hours</p>
        </div>

        <button
          onClick={handleRunBatchScrape}
          disabled={batchScraping}
          className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm"
        >
          <Play className={`w-3.5 h-3.5 ${batchScraping ? 'animate-spin' : ''}`} />
          {batchScraping ? 'Running Batch Scrape...' : 'Run Scraper Now'}
        </button>
      </div>

      <div className="space-y-3">
        {products.map((product) => {
          const isExpanded = expandedId === product.id;

          return (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:border-slate-300"
            >
              <div
                onClick={() => toggleExpand(product.id)}
                className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {product.product_name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {product.selected_option}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Last Scraped:{' '}
                      {product.last_scraped_at
                        ? new Date(product.last_scraped_at).toLocaleString()
                        : 'Never'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-400">ID: {product.store_product_id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => handleStopTracking(product.id, e)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Stop tracking product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-200 p-6 bg-slate-50/30">
                  <ProductDetail
                    productId={product.id}
                    productName={product.product_name}
                    optionName={product.selected_option}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
