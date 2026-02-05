
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createService, getCategories, getSubCategories, getZones, getTemplatesBySubCategory } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { Category, SubCategory, Zone, ServiceTemplate } from '../../types';

export const CreateService: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryId: '',
    templateId: '',
    zoneId: '',
    price: ''
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);

  useEffect(() => {
    const init = async () => {
        const [cats, z] = await Promise.all([getCategories(), getZones()]);
        setCategories(cats);
        setZones(z);
        if (cats.length > 0) setFormData(prev => ({ ...prev, categoryId: String(cats[0].id) }));
        if (z.length > 0) setFormData(prev => ({ ...prev, zoneId: String(z[0].id) }));
    };
    init();
  }, []);

  // Fetch SubCategories when Category changes
  useEffect(() => {
    if (!formData.categoryId) return;
    const fetchSub = async () => {
        const subs = await getSubCategories(Number(formData.categoryId)); // Note: ID type might need check if UUID
        setSubCategories(subs);
        if (subs.length > 0) {
            setFormData(prev => ({ ...prev, subCategoryId: String(subs[0].id) }));
        } else {
            setFormData(prev => ({ ...prev, subCategoryId: '' }));
            setTemplates([]);
        }
    };
    fetchSub();
  }, [formData.categoryId]);

  // Fetch Templates when SubCategory changes
  useEffect(() => {
      if (!formData.subCategoryId) return;
      const fetchTemplates = async () => {
          const tmpls = await getTemplatesBySubCategory(formData.subCategoryId);
          setTemplates(tmpls);
          if (tmpls.length > 0) {
              setFormData(prev => ({ ...prev, templateId: tmpls[0].id }));
              setSelectedTemplate(tmpls[0]);
          } else {
              setFormData(prev => ({ ...prev, templateId: '' }));
              setSelectedTemplate(null);
          }
      };
      fetchTemplates();
  }, [formData.subCategoryId]);

  // Update selected template obj for UI hints
  useEffect(() => {
      const tmpl = templates.find(t => t.id === formData.templateId);
      setSelectedTemplate(tmpl || null);
      if (tmpl) {
          setFormData(prev => ({ ...prev, price: String(tmpl.base_price) }));
      }
  }, [formData.templateId, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
        await createService({
          template_id: formData.templateId,
          zone_id: Number(formData.zoneId),
          price: Number(formData.price)
        });

        alert('Service Created! It is now pending Admin Approval.');
        navigate('/provider');
    } catch (e: any) {
        alert("Error creating service: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer a Service</h2>
        <p className="text-gray-500 mb-6">Select from our standard catalog to start earning.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Zone</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.zoneId}
              onChange={e => setFormData({...formData, zoneId: e.target.value})}
            >
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}, {z.city}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* SubCategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.subCategoryId}
                  onChange={e => setFormData({...formData, subCategoryId: e.target.value})}
                  disabled={subCategories.length === 0}
                >
                  {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
              </div>
          </div>

          {/* Service Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.templateId}
                onChange={e => setFormData({...formData, templateId: e.target.value})}
                disabled={templates.length === 0}
            >
                {templates.length === 0 && <option>No services available in this category</option>}
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selectedTemplate && (
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                    {selectedTemplate.description}
                </p>
            )}
          </div>

          {/* Price Override */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Price ($)</label>
            <input
              required
              type="number"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
            {selectedTemplate && (
                <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-gray-500">Base Price: <b>${selectedTemplate.base_price}</b></span>
                    <span className="text-gray-500">Min: <b>${selectedTemplate.min_price}</b></span>
                    <span className="text-gray-500">Max: <b>${selectedTemplate.max_price}</b></span>
                </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
             <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
             <div className="text-sm text-blue-800">
                 <p className="font-bold">Standard Catalog Enforcement</p>
                 <p>You are selecting a standardized service. This ensures customers know exactly what they are booking. Your custom price will be shown to customers in your zone.</p>
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Create Service Offer
          </button>
        </form>
      </div>
    </div>
  );
};
