import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyAsProvider, getOnboardingStatus, submitKYC, requestGoLive } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle, FileText, Upload, Lock, 
  ShieldCheck, ArrowRight, UserPlus, FileCheck, Rocket, ChevronRight, Info, Clock
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Seo from '../../components/seo/Seo';

export const ProviderOnboarding: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Application Form
    const [bio, setBio] = useState('');
    
    // KYC Form
    const [docType, setDocType] = useState('GOVT_ID');
    const [docUrl, setDocUrl] = useState('');

    const fetchStatus = useCallback(async (isInitialLoad = false) => {
        try {
            const data = await getOnboardingStatus();
            setStatus(data);
            
            if (data.approval_status === 'LIVE') {
                startTransition(async () => {
                    if (isInitialLoad || user?.verificationStatus !== 'LIVE') {
                        await refreshUser();
                    }
                    navigate('/provider', { replace: true });
                });
            }
        } catch (e: any) {
            setStatus(null);
        } finally {
            setLoading(false);
        }
    }, [navigate, refreshUser, user?.verificationStatus]);

    useEffect(() => {
        if (user) {
            fetchStatus(true);
        }
    }, [user, fetchStatus]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await applyAsProvider(bio);
            await refreshUser();
            await fetchStatus();
            showToast("Application submitted! Next step: KYC.", "success");
        } catch (e: any) {
            showToast(e.response?.data?.message || "Failed to apply", "error");
        }
    };

    const handleKYC = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docUrl) return;
        try {
            await submitKYC(docType, docUrl);
            showToast("Document uploaded successfully", "success");
            await fetchStatus();
        } catch (e: any) {
            showToast(e.response?.data?.message, "error");
        }
    };

    const handleGoLive = async () => {
        try {
            await requestGoLive();
            startTransition(async () => {
                await refreshUser();
                showToast("Congratulations! You are now LIVE.", "success");
                navigate('/provider', { replace: true });
            });
        } catch (e: any) {
            showToast(e.response?.data?.message, "error");
        }
    };

    if (loading || isPending) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!status) {
        return (
            <div className="max-w-4xl mx-auto mt-12 mb-20 px-4">
                <Seo title="Become a Professional" description="Join the marketplace and start offering your services." />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div>
                            <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Partner Program</span>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 leading-tight">Turn your skills into <span className="text-indigo-600">Earnings.</span></h1>
                            <p className="text-gray-500 mt-4 text-lg">Join 5000+ experts who have built successful service businesses on our platform.</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { icon: ShieldCheck, title: "Verified Trust", desc: "Build instant credibility with our verified badge." },
                                { icon: Rocket, title: "Fast Payouts", desc: "Get paid directly to your wallet after every job." },
                                { icon: Lock, title: "Secure Workflow", desc: "Masked calling and secure payment escrow." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                                        <item.icon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Start Application</h2>
                        <form onSubmit={handleApply} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tell us about your experience</label>
                                <textarea 
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 h-40 resize-none transition-all"
                                    placeholder="e.g., I have 5 years of experience in AC repair and maintenance..."
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 bg-indigo-50 rounded-2xl flex gap-3 text-xs font-bold text-indigo-700">
                                <Info className="w-5 h-5 shrink-0" />
                                <p>By submitting, you agree to our Service Provider Terms and undergo a background verification process.</p>
                            </div>

                            <button type="submit" className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-3">
                                Submit Application <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    const steps = [
        { id: 'REGISTERED', label: 'Registered', icon: UserPlus },
        { id: 'KYC_SUBMITTED', label: 'KYC Verification', icon: FileText },
        { id: 'APPROVED', label: 'Admin Approval', icon: FileCheck },
        { id: 'LIVE', label: 'Go Live', icon: Rocket }
    ];

    const currentStatusIdx = steps.findIndex(s => s.id === status.approval_status);
    const visualIdx = status.approval_status === 'KYC_UNDER_REVIEW' ? 1 : (currentStatusIdx === -1 ? 0 : currentStatusIdx);

    return (
        <div className="max-w-5xl mx-auto mt-10 px-4 pb-20">
            <Seo title="Onboarding Progress" description="Complete your profile to start receiving bookings." />
            
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Onboarding <span className="text-indigo-600">Progress</span></h1>
                    <p className="text-gray-500 mt-1 font-medium">Complete these steps to unlock your provider dashboard.</p>
                </div>
                <div className="hidden md:block">
                    <span className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-gray-700">
                        Status: <span className="text-indigo-600 uppercase ml-1">{status.approval_status.replace('_', ' ')}</span>
                    </span>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-10 overflow-x-auto">
                <div className="flex items-center justify-between min-w-[600px]">
                    {steps.map((step, idx) => {
                        const isDone = idx < visualIdx;
                        const isCurrent = idx === visualIdx;
                        const isLast = idx === steps.length - 1;

                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center gap-3 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDone ? 'bg-green-500 text-white shadow-lg shadow-green-100' : isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 text-gray-400'}`}>
                                        {isDone ? <CheckCircle className="w-7 h-7" /> : <step.icon className="w-7 h-7" />}
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`}>{step.label}</span>
                                </div>
                                {!isLast && (
                                    <div className="flex-1 h-1 mx-4 rounded-full bg-gray-100 overflow-hidden">
                                        <div className={`h-full bg-green-500 transition-all duration-1000`} style={{ width: isDone ? '100%' : '0%' }}></div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-indigo-600" /> Identity Verification
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Required for security and trust.</p>
                            </div>
                            {visualIdx > 1 && (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Verified</span>
                            )}
                        </div>
                        
                        {visualIdx >= 1 ? (
                            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                    <FileCheck className="w-6 h-6 text-indigo-600" />
                                </div>
                                {status.approval_status === 'KYC_UNDER_REVIEW' || status.approval_status === 'KYC_SUBMITTED' ? (
                                <div>
                                    <p className="font-bold text-indigo-900">Documents Submitted</p>
                                    <p className="text-xs text-indigo-700">We are currently reviewing your identity documents. This takes 24-48 hours.</p>
                                </div>
                                ) : (
                                <div>
                                    <p className="font-bold text-indigo-900">Verified Professional</p>
                                    <p className="text-xs text-indigo-700">Your documents have been approved by our audit team.</p>
                                </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleKYC} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Document Type</label>
                                        <select 
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={docType}
                                            onChange={e => setDocType(e.target.value)}
                                        >
                                            <option value="GOVT_ID">Government ID (Passport/ID)</option>
                                            <option value="BANK_PROOF">Address Proof (Bill/Bank)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Document Link</label>
                                        <input 
                                            type="text"
                                            required
                                            placeholder="Paste document link here"
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={docUrl}
                                            onChange={e => setDocUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all">
                                    <Upload className="w-5 h-5" /> Upload Document
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="text-lg font-black mb-4">Pro Tip: Building Trust</h3>
                        <p className="text-white/80 text-sm leading-relaxed mb-6">
                            Providers with clear bios and high-quality verification documents are 3x more likely to be selected by premium clients.
                        </p>
                        <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                            Read Success Guide <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Go-Live Checklist</h2>
                        <div className="space-y-6">
                            {[
                                { label: "KYC Document Uploaded", status: status.kyc_count > 0, action: null },
                                { label: "Admin Identity Approval", status: status.approval_status === 'APPROVED' || status.approval_status === 'LIVE', action: null },
                                { label: "Create First Service Offer", status: parseInt(status.service_count) > 0, action: () => navigate('/provider/create-service') },
                                { label: "Set Regular Availability", status: parseInt(status.avail_count) > 0, action: () => navigate('/provider/availability') }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${item.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <span className={`text-sm font-bold ${item.status ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</span>
                                    </div>
                                    {!item.status && item.action && (
                                        <button onClick={item.action} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Complete</button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100">
                             <button 
                                onClick={handleGoLive}
                                disabled={status.approval_status !== 'APPROVED' || parseInt(status.service_count) === 0 || parseInt(status.avail_count) === 0}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${status.approval_status === 'LIVE' ? 'bg-green-100 text-green-700 cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none'}`}
                             >
                                 {status.approval_status === 'LIVE' ? (
                                     <> <CheckCircle className="w-6 h-6" /> You are LIVE </>
                                 ) : (
                                     <> <Rocket className="w-6 h-6" /> Request Go-Live </>
                                 )}
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};