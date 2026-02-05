import React, { useEffect, useState } from 'react';
import { Category, SubCategory } from '../../types';
import { getAllCategoriesAdmin, createCategory, createSubCategory, toggleCategoryStatus } from '../../services/api';
import { Plus, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<(Category & {is_active: boolean})[]>([]);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newCatName, setNewCatName] = useState('');
  const [newSubName, setNewSubName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
        const data = await getAllCategoriesAdmin();
        setCategories(data as any);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newCatName.trim()) return;
      try {
          await createCategory({ name: newCatName, description: 'Created by Admin' });
          setNewCatName('');
          fetchCategories();
      } catch(e) { alert("Error creating category"); }
  };

  const handleToggleCat = async (cat: any) => {
      try {
          await toggleCategoryStatus(cat.id, !cat.is_active);
          fetchCategories();
      } catch(e) { alert("Error updating status"); }
  };

  const handleCreateSub = async (catId: number) => {
      const name = prompt("Enter Sub-Category Name:");
      if (!name) return;
      try {
          await createSubCategory({ category_id: catId, name });
          alert("Sub-category created! (Note: View logic for subs not fully expanded in this admin view yet)");
      } catch(e) { alert("Error creating sub-category"); }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Category Management</h3>
            <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="New Category Name" 
                    className="border rounded px-3 py-1 text-sm"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                />
                <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add
                </button>
            </form>
        </div>

        {loading ? <div className="p-8 text-center">Loading...</div> : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map(cat => (
                        <tr key={cat.id} className={!cat.is_active ? "bg-gray-50 opacity-60" : ""}>
                            <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">/services/{cat.slug || '...'}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {cat.is_active ? 'ACTIVE' : 'DISABLED'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button onClick={() => handleToggleCat(cat)} className="text-gray-500 hover:text-gray-800" title="Toggle Status">
                                    {cat.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                                <button onClick={() => handleCreateSub(cat.id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold border border-indigo-200 px-2 py-1 rounded">
                                    + Sub
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
  );
};
