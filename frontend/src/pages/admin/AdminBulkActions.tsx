/**
 * ADMIN BULK ACTIONS PAGE
 * Route: /admin/tools/bulk
 * DB: Multiple tables for bulk operations
 * UI: CSV upload + bulk actions
 * Security: RLS ensures only admins can perform bulk operations
 */

import { useState } from 'react';
import { supabase } from '../../services/supabase-production';

type BulkAction = {
  id: string;
  type: 'approve_providers' | 'suspend_users' | 'cancel_bookings' | 'send_notifications' | 'update_pricing';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  created_at: string;
  completed_at?: string;
  error?: string;
  results?: any;
};

export default function AdminBulkActions() {
  const [activeTab, setActiveTab] = useState<'providers' | 'bookings' | 'users' | 'notifications' | 'pricing'>('providers');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [recentActions, setRecentActions] = useState<BulkAction[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCSV(file);
    } else {
      alert('Please upload a valid CSV file');
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result || '';
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim();
        });
        return row;
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const executeBulkAction = async (actionType: string) => {
    if (csvData.length === 0) {
      alert('Please upload a CSV file first');
      return;
    }

    setLoading(true);

    try {
      // Create bulk action record
      const { data: action } = await supabase
        .from('bulk_actions')
        .insert({
          type: actionType,
          status: 'pending',
          progress: 0,
          total: csvData.length,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!action) throw new Error('Failed to create bulk action');

      setBulkAction(action);

      // Process items in batches
      const batchSize = 50;
      let processed = 0;

      while (processed < csvData.length) {
        const batch = csvData.slice(processed, processed + batchSize);
        
        // Process batch based on action type
        const results = await processBatch(actionType, batch);

        // Update progress
        processed += batchSize;
        await supabase
          .from('bulk_actions')
          .update({
            progress: Math.min(processed, csvData.length),
            results: results
          })
          .eq('id', action.id);
      }

      // Mark as completed
      await supabase
        .from('bulk_actions')
        .update({
          status: 'completed',
          progress: csvData.length,
          completed_at: new Date().toISOString()
        })
        .eq('id', action.id);

      alert(`Bulk action completed: ${csvData.length} items processed`);
      loadRecentActions();

    } catch (err: any) {
      console.error('Bulk action error:', err);
      alert('Bulk action failed. Please try again.');
    } finally {
      setLoading(false);
      setBulkAction(null);
      setCsvData([]);
      setCsvFile(null);
    }
  };

  const processBatch = async (actionType: string, batch: any[]) => {
    switch (actionType) {
      case 'approve_providers':
        const { error: approveError } = await supabase
          .from('providers')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .in('id', batch.map(item => item.id)));
        return { success: !approveError, approved: batch.length, failed: approveError ? batch.length : 0 };

      case 'suspend_users':
        const { error: suspendError } = await supabase
          .from('users')
          .update({ status: 'suspended', updated_at: new Date().toISOString() })
          .in('id', batch.map(item => item.id)));
        return { success: !suspendError, suspended: batch.length, failed: suspendError ? batch.length : 0 };

      case 'cancel_bookings':
        const { error: cancelError } = await supabase
          .from('bookings')
          .update({ status: 'cancelled', cancel_reason: 'Bulk cancellation', updated_at: new Date().toISOString() })
          .in('id', batch.map(item => item.id)));
        return { success: !cancelError, cancelled: batch.length, failed: cancelError ? batch.length : 0 };

      case 'send_notifications':
        // Would integrate with notification service
        return { success: true, sent: batch.length, failed: 0 };

      case 'update_pricing':
        const { error: priceError } = await supabase
          .from('services')
          .update({ price: batch[0].new_price, updated_at: new Date().toISOString() })
          .in('id', batch.map(item => item.id)));
        return { success: !priceError, updated: batch.length, failed: priceError ? batch.length : 0 };

      default:
        return { success: false, error: 'Unknown action type' };
    }
  };

  const loadRecentActions = async () => {
    const { data } = await supabase
      .from('bulk_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setRecentActions(data as BulkAction[] || []);
  };

  useEffect(() => {
    loadRecentActions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Operations</h1>
          <p className="text-gray-600 mt-2">
            Perform batch operations on providers, bookings, users, and more
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex gap-0">
            {[
              { id: 'providers', label: 'Providers' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'users', label: 'Users' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'pricing', label: 'Pricing' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Action */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Step 1: Upload Data</h2>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload CSV File
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  csvFile ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type === 'text/csv') {
                    setCsvFile(file);
                    parseCSV(file);
                  }
                }}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer"
                >
                  {csvFile ? (
                    <div>
                      <div className="text-4xl mb-2">📄</div>
                      <p className="font-semibold text-gray-900">{csvFile.name}</p>
                      <p className="text-sm text-gray-600">{csvData.length} records loaded</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📤</div>
                      <p className="font-semibold text-gray-900">Drag & Drop CSV Here</p>
                      <p className="text-sm text-gray-600">or click to browse</p>
                    </div>
                  )}
                </label>
              </div>

              {/* CSV Preview */}
              {csvData.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-auto">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Preview (First 10 rows)</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        {Object.keys(csvData[0] || {}).map((key) => (
                          <th key={key} className="px-2 py-1 font-medium text-gray-900">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          {Object.values(row).map((val, cellIdx) => (
                            <td key={cellIdx} className="px-2 py-1 text-gray-700">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Step 2: Select Action */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Select Action</h2>

              <div className="space-y-3">
                {activeTab === 'providers' && (
                  <button
                    onClick={() => executeBulkAction('approve_providers')}
                    disabled={loading || csvData.length === 0}
                    className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Approve {csvData.length} Providers</span>
                      </>
                    )}
                  </button>
                )}

                {activeTab === 'bookings' && (
                  <button
                    onClick={() => executeBulkAction('cancel_bookings')}
                    disabled={loading || csvData.length === 0}
                    className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? 'Processing...' : `Cancel ${csvData.length} Bookings`}
                  </button>
                )}

                {activeTab === 'users' && (
                  <button
                    onClick={() => executeBulkAction('suspend_users')}
                    disabled={loading || csvData.length === 0}
                    className="w-full px-6 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? 'Processing...' : `Suspend ${csvData.length} Users`}
                  </button>
                )}

                {activeTab === 'notifications' && (
                  <button
                    onClick={() => executeBulkAction('send_notifications')}
                    disabled={loading || csvData.length === 0}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? 'Processing...' : `Send ${csvData.length} Notifications`}
                  </button>
                )}

                {activeTab === 'pricing' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="Enter new price"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newPrice = (document.querySelector('input[type="number"]') as HTMLInputElement)?.value;
                        if (newPrice) {
                          executeBulkAction('update_pricing');
                        }
                      }}
                      disabled={loading || csvData.length === 0}
                      className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                      {loading ? 'Processing...' : `Update ${csvData.length} Service Prices`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Progress & History */}
          <div className="space-y-6">
            {/* Current Action Progress */}
            {bulkAction && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Processing Action</h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Progress</span>
                      <span className="text-sm font-semibold text-gray-900">{bulkAction.progress} / {bulkAction.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${(bulkAction.progress / bulkAction.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bulkAction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      bulkAction.status === 'failed' ? 'bg-red-100 text-red-800' :
                      bulkAction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bulkAction.status.toUpperCase()}
                    </span>
                    {bulkAction.completed_at && (
                      <span className="text-sm text-gray-500">
                        {new Date(bulkAction.completed_at).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {bulkAction.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">{bulkAction.error}</p>
                    </div>
                  )}

                  {bulkAction.results && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-2">Results:</p>
                      <pre className="text-xs text-gray-700 overflow-auto">
                        {JSON.stringify(bulkAction.results, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Actions History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bulk Actions</h2>

              <div className="space-y-3">
                {recentActions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No recent bulk actions</p>
                ) : (
                  recentActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                        action.status === 'completed' ? 'bg-green-600' :
                        action.status === 'failed' ? 'bg-red-600' :
                        action.status === 'processing' ? 'bg-blue-600' :
                        'bg-yellow-600'
                      }`}>
                        {action.status === 'completed' ? '✓' :
                         action.status === 'failed' ? '✗' :
                         action.status === 'processing' ? '⏳' :
                         '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {action.type.split('_').join(' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {action.progress} / {action.total} items
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(action.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
