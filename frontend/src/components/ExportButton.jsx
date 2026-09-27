import React, { useState } from 'react';
import { exportCSV } from '../services/api';
import { Download, Loader2 } from 'lucide-react';

export default function ExportButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await exportCSV();

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `price_tracker_scrape_history_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV: ' + (err.message || err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export CSV History
        </>
      )}
    </button>
  );
}
