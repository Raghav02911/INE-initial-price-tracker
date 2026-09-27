import React, { useState } from 'react';
import { History, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ScrapeLog({ logs = [] }) {
  const [showAll, setShowAll] = useState(false);
  const displayLogs = showAll ? logs : logs.slice(0, 8);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Success
          </span>
        );
      case 'retried':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
            Retried
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-semibold text-slate-900">Scrape Attempt Audit Logs</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">{logs.length} attempt(s) recorded</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Timestamp (Local)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Attempt</th>
              <th className="px-4 py-3">Log Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {displayLogs.length > 0 ? (
              displayLogs.map((log) => (
                <tr key={log.id || Math.random()} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600">
                    #{log.attempt_number || 1}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-800">
                    {log.message}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                  No scrape logs available for this product yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {logs.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs font-semibold text-slate-700 hover:text-slate-900 underline transition-colors"
        >
          {showAll ? 'Show Fewer Logs' : `Show All ${logs.length} Log Entries`}
        </button>
      )}
    </div>
  );
}
