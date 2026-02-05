
import React, { useEffect, useState } from 'react';
import { getSystemConfigs, updateSystemConfig } from '../../services/api';
import { Settings, Save, AlertCircle } from 'lucide-react';

export const SystemConfig: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
        const data = await getSystemConfigs();
        setConfigs(data);
        setLoading(false);
    } catch (e) { console.error(e); }
  };

  const handleSave = async (key: string, value: string) => {
      try {
          await updateSystemConfig(key, value);
          alert("Config updated");
      } catch (e) { alert("Failed to update"); }
  };

  if (loading) return <div className="p-8">Loading configs...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <h3 className="font-bold text-gray-800">Platform Rules (System Config)</h3>
        </div>
        <div className="p-6 space-y-6">
            <div className="bg-yellow-50 p-3 rounded-lg flex gap-2 text-sm text-yellow-800 mb-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Changing these values affects the entire platform immediately. Proceed with caution.</p>
            </div>

            {configs.map((conf) => (
                <div key={conf.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex-1">
                        <label className="font-bold text-gray-700 block text-sm">{conf.key}</label>
                        <p className="text-xs text-gray-500">{conf.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            defaultValue={conf.value} 
                            className="border border-gray-300 rounded px-3 py-2 w-32 md:w-48 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            onBlur={(e) => {
                                if(e.target.value !== conf.value) handleSave(conf.key, e.target.value);
                            }}
                        />
                        <button className="text-indigo-600 hover:text-indigo-800 p-2" title="Auto-saves on blur">
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
