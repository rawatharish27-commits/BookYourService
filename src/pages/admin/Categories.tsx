import React, { useEffect, useState } from 'react';
import { Category } from '../../types';
import { getAllCategoriesAdmin, createCategory, toggleCategoryStatus } from '../../services/api';
import { Plus, Eye, EyeOff, Edit3, Globe, Search, Layers } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => { fetchCats(); }, []);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const data = await getAllCategoriesAdmin();
      setCategories(data);
    } catch (e) {
      showToast("Failed to load catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (cat: any) => {
    try {
      await toggleCategoryStatus(cat.id, !cat.is_active);
      showToast(`Category ${cat.is_active ? 'Disabled' : 'Enabled'}`, "success");
      fetchCats();
    } catch (e) { showToast("Status update failed", "error"); }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Taxonomy</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">SEO Slug</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="p-20 text-center text-gray-400 font-bold italic animate-pulse">Index scanning...</td></tr>
            ) : filtered.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                      {cat.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-900">{cat.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold max-w-xs truncate">{cat.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-mono text-gray-500">/{cat.slug}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${cat.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {cat.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-indigo-600" title="SEO Settings"><Globe className="w-4 h-4" /></button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600" title="Edit Metadata"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleToggle(cat)} className="p-2 text-gray-400 hover:text-gray-900">
                      {cat.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};