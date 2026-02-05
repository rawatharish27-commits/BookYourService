import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createService, getCategories, getSubCategories, getZones, getTemplatesBySubCategory } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
// Add PlusCircle to imports
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldAlert, PlusCircle } from 'lucide-react';
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

  // 🛡️ PHASE 6: KYC GATE
  useEffect(() => {
    if (user && user.verificationStatus !== 'LIVE') {
        alert("You must be fully verified and 'LIVE' to create new service offers.");
        navigate('/provider');
    }
  }, [user, navigate]);

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
        const subs = await getSubCategories(Number(formData.categoryId));
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
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-bold transition-all group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1" /> Back
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600">
                <PlusCircle className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Offer Service</h2>
                <p className="text-gray-500 font-medium">Expand your professional portfolio.</p>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Zone */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Service Location Zone</label>
            <select
              className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 appearance-none shadow-inner"
              value={formData.zoneId}
              onChange={e => setFormData({...formData, zoneId: e.target.value})}
            >
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}, {z.city}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Category</label>
                <select
                  className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 appearance-none shadow-inner"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* SubCategory */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sub-Category</label>
                <select
                  className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 appearance-none shadow-inner"
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
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Service Standard Type</label>
            <select
                className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 appearance-none shadow-inner"
                value={formData.templateId}
                onChange={e => setFormData({...formData, templateId: e.target.value})}
                disabled={templates.length === 0}
            >
                {templates.length === 0 && <option>No services available in this category</option>}
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selectedTemplate && (
                <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        {selectedTemplate.description}
                    </p>
                </div>
            )}
          </div>

          {/* Price Override */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Custom Pricing (₹)</label>
            <div className="relative">
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-gray-900 shadow-inner text-xl"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold">₹</span>
            </div>
            {selectedTemplate && (
                <div className="flex gap-6 mt-4 px-2">
                    <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase">Suggested</span><span className="text-sm font-black text-gray-700">₹{selectedTemplate.base_price}</span></div>
                    <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase">Min Limit</span><span className="text-sm font-black text-gray-700">₹{selectedTemplate.min_price}</span></div>
                    <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase">Max Limit</span><span className="text-sm font-black text-gray-700">₹{selectedTemplate.max_price}</span></div>
                </div>
            )}
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex items-start gap-4">
             <CheckCircle className="w-6 h-6 text-indigo-600 mt-0.5 shrink-0" />
             <div className="text-sm text-indigo-900 font-medium leading-relaxed">
                 <p className="font-black uppercase text-[10px] tracking-widest mb-1">Marketplace Standard</p>
                 <p>Selecting a catalog template ensures clients receive standardized service quality. Your custom price will be reviewed by admins.</p>
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-lg"
          >
            Submit for Approval
          </button>
        </form>
      </div>
    </div>
  );
};