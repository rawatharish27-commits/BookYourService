import React, { useState, useEffect } from 'react';
import { db } from '../../services/DatabaseService';
import { SystemConfig, Category } from '../../types';
import { CATEGORIES } from '../../constants';

const AdminSystemConfig: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(db.getConfig());
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const loadData = () => {
      setConfig(db.getConfig());
      setCategories(CATEGORIES);
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateConfig = async (updates: Partial<SystemConfig>) => {
    setIsLoading(true);
    try {
      db.updateConfig(updates);
      setConfig(prev => ({ ...prev, ...updates }));
      setMessage({ type: 'success', text: 'Configuration updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update configuration.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    // Note: In a real implementation, this would update the database
    // For now, we'll just show the UI change
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, isEnabled: !cat.isEnabled } : cat
    ));
    setMessage({ type: 'success', text: 'Category status updated (Note: This is a UI preview. Database update not implemented yet.)' });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Platform Settings */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Platform Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Global Platform Fee (%)</label>
              <input
                type="number"
                value={config.globalPlatformFee}
                onChange={(e) => setConfig(prev => ({ ...prev, globalPlatformFee: parseFloat(e.target.value) || 0 }))}
                onBlur={(e) => updateConfig({ globalPlatformFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.1"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Auto-matching Enabled</label>
                <p className="text-xs text-slate-500">Automatically assign providers to bookings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoMatchingEnabled}
                  onChange={(e) => updateConfig({ autoMatchingEnabled: e.target.checked })}
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">AI Kill Switch</label>
                <p className="text-xs text-slate-500">Disable all AI-powered features</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aiKillSwitch}
                  onChange={(e) => updateConfig({ aiKillSwitch: e.target.checked })}
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Schema Version</label>
              <input
                type="text"
                value={config.schemaVersion}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">Database schema version (read-only)</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">System Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">AI Features:</span>
                  <span className={`font-medium ${config.aiKillSwitch ? 'text-red-600' : 'text-green-600'}`}>
                    {config.aiKillSwitch ? 'Disabled' : 'Enabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Auto-matching:</span>
                  <span className={`font-medium ${config.autoMatchingEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {config.autoMatchingEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Platform Fee:</span>
                  <span className="font-medium text-blue-600">{config.globalPlatformFee}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Service Categories ({categories.length})</h3>
          <div className="text-sm text-slate-500">
            {categories.filter(c => c.isEnabled).length} enabled • {categories.filter(c => !c.isEnabled).length} disabled
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <div className="font-medium text-slate-900">{category.name}</div>
                  <div className="text-sm text-slate-500">{category.providerType}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={category.isEnabled}
                  onChange={() => toggleCategory(category.id)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  category.isEnabled
                    ? 'bg-green-600 peer-focus:ring-green-300'
                    : 'bg-slate-200 peer-focus:ring-slate-300'
                }`}></div>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-amber-600 mt-0.5">⚠️</span>
            <div>
              <h4 className="text-sm font-medium text-amber-800">Category Management</h4>
              <p className="text-sm text-amber-700 mt-1">
                Categories are currently managed through the constants file. Adding/removing categories requires code changes.
                The toggles above control visibility in the app but don't persist to the database yet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{db.getUsers().length}</div>
            <div className="text-sm text-slate-600">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{db.getBookings().length}</div>
            <div className="text-sm text-slate-600">Total Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">₹{db.getLedger().reduce((sum, entry) => sum + entry.amount, 0).toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Transaction Volume</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemConfig;