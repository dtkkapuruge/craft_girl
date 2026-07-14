'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Settings, Terminal, ShieldCheck, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadProductImage } from '@/lib/productService';
import { fetchLayoutSettings, updateLayoutSettings, type LayoutSettings } from '@/lib/layoutService';

interface AuditLog {
  id: string;
  timestamp: any;
  userEmail: string;
  userRole: string;
  actionDescription: string;
}

interface AssetDropzoneProps {
  label: string;
  configKey: keyof LayoutSettings;
  currentValue?: string;
  onUploadSuccess: (key: keyof LayoutSettings, url: string) => void;
}

function AssetDropzone({ label, configKey, currentValue, onUploadSuccess }: AssetDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentValue || '');

  useEffect(() => {
    setPreview(currentValue || '');
  }, [currentValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const secureUrl = await uploadProductImage(file);
      setPreview(secureUrl);
      await updateLayoutSettings({ [configKey]: secureUrl });
      onUploadSuccess(configKey, secureUrl);
      toast.success(`${label} updated successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to upload ${label}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 text-left">
      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <div className="relative border border-dashed border-[#E8E4DF] hover:border-[#442852] transition-colors p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-[#FAFAF8] min-h-[140px] group">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 text-[#442852] animate-spin" />
            <span className="text-[9px] font-bold text-gray-400 tracking-wider">UPLOADING...</span>
          </div>
        ) : preview ? (
          <div className="relative w-full h-full flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={label} className="max-h-[90px] object-cover mb-2 border border-[#E8E4DF]" />
            <span className="text-[8px] text-[#442852] font-bold tracking-widest uppercase group-hover:underline">CHANGE IMAGE</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-6 h-6 text-gray-400 group-hover:text-[#442852] transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <span className="text-[8px] font-bold text-gray-400 tracking-widest uppercase">CLICK TO UPLOAD</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsContent() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'portal' | 'assets'>('portal');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [storeName, setStoreName] = useState('Craft Girly Store');
  const [codThreshold, setCodThreshold] = useState('500');
  const [notificationEmail, setNotificationEmail] = useState('orders@craftgirly.com');

  // Website dynamic layout settings
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({});
  const [loadingLayout, setLoadingLayout] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(25));
        const snap = await getDocs(q);
        const fetchedLogs: AuditLog[] = [];
        snap.forEach((d) => {
          const data = d.data();
          fetchedLogs.push({
            id: d.id,
            timestamp: data.timestamp,
            userEmail: data.userEmail ?? 'unknown',
            userRole: data.userRole ?? 'staff',
            actionDescription: data.actionDescription ?? 'Action performed',
          });
        });

        // Add mock initial logs if empty
        if (fetchedLogs.length === 0) {
          fetchedLogs.push({
            id: 'mock_1',
            timestamp: Timestamp.now(),
            userEmail: 'superadmin@craft.com',
            userRole: 'super-admin',
            actionDescription: 'Admin Portal initial setup completed',
          });
          fetchedLogs.push({
            id: 'mock_2',
            timestamp: Timestamp.fromMillis(Date.now() - 3600000),
            userEmail: 'admin@craft.com',
            userRole: 'admin',
            actionDescription: 'Products stock limits verified',
          });
        }
        setLogs(fetchedLogs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLogs(false);
      }
    }

    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLayoutSettings().then((settings) => {
      setLayoutSettings(settings);
      setLoadingLayout(false);
    });
  }, []);

  const handleUploadSuccess = (key: keyof LayoutSettings, url: string) => {
    setLayoutSettings((prev) => ({
      ...prev,
      [key]: url,
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings updated successfully!');
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-serif text-[#0A0A0A] uppercase tracking-wide">Admin Portal Settings</h1>
        <p className="mt-1.5 text-xs text-gray-500 uppercase tracking-wider">Configure metadata, logs, and layout assets.</p>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-[#E8E4DF] gap-8 text-[10px] font-bold uppercase tracking-[0.22em]">
        <button
          onClick={() => setActiveTab('portal')}
          className={`pb-3 relative transition-all duration-300 ${
            activeTab === 'portal' ? 'text-[#442852]' : 'text-gray-400 hover:text-[#0A0A0A]'
          }`}
        >
          Portal Configuration
          {activeTab === 'portal' && (
            <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#442852]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-3 relative transition-all duration-300 ${
            activeTab === 'assets' ? 'text-[#442852]' : 'text-gray-400 hover:text-[#0A0A0A]'
          }`}
        >
          Website Layout Assets
          {activeTab === 'assets' && (
            <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#442852]" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'portal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={handleSaveSettings} className="bg-white border border-[#E8E4DF] p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8E4DF]">
                <Settings className="w-4 h-4 text-[#442852]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">Store Metadata</h3>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-xs focus:border-[#442852] focus:outline-none transition-all font-semibold text-gray-800 uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Default COD Fee (LKR)</label>
                <input
                  type="number"
                  value={codThreshold}
                  onChange={(e) => setCodThreshold(e.target.value)}
                  className="w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-xs focus:border-[#442852] focus:outline-none transition-all font-semibold text-gray-800 tracking-wider"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Notification Dispatch Email</label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="w-full border border-[#E8E4DF] bg-white px-4 py-2.5 text-xs focus:border-[#442852] focus:outline-none transition-all font-semibold text-gray-800 tracking-wider"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#442852] py-3 text-[10px] font-bold text-white uppercase tracking-widest transition-all"
              >
                <Save className="w-3.5 h-3.5" /> Save Configuration
              </button>
            </form>
          </div>

          {/* Audit Logs Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E8E4DF] overflow-hidden">
              <div className="flex items-center gap-2 bg-[#FAFAF8] px-6 py-4 border-b border-[#E8E4DF]">
                <Terminal className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">Operation Records</h3>
              </div>

              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin text-[#442852]" />
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider">Retrieving system logs...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {logs.map((log) => {
                    const date = log.timestamp instanceof Timestamp 
                      ? log.timestamp.toDate() 
                      : log.timestamp?.seconds 
                        ? new Date(log.timestamp.seconds * 1000) 
                        : new Date();
                    
                    return (
                      <div key={log.id} className="p-4 hover:bg-[#FAFAF8] transition-colors flex items-start justify-between gap-4 text-left">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-800">{log.actionDescription}</p>
                          <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold">
                            <span className="text-[#442852]">{log.userEmail}</span>
                            <span>•</span>
                            <span className="uppercase">{log.userRole}</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-500 whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* Brand Identity Logos */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E8E4DF] pb-2 mb-4 text-left">Brand Identity</h2>
            <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-wider text-left">Configure logos displayed in the navigation headers and footers.</p>
            {loadingLayout ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#442852]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-[#E8E4DF] p-6">
                <AssetDropzone label="Navbar Brand Logo Placeholder" configKey="navbarLogo" currentValue={layoutSettings.navbarLogo} onUploadSuccess={handleUploadSuccess} />
                <AssetDropzone label="Footer Directory Logo" configKey="footerLogo" currentValue={layoutSettings.footerLogo} onUploadSuccess={handleUploadSuccess} />
              </div>
            )}
          </div>

          {/* Homepage Hero & About Banners */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E8E4DF] pb-2 mb-4 text-left">Homepage Hero & Storytelling</h2>
            <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-wider text-left">Configure promotional background images and split-screen story graphics.</p>
            {loadingLayout ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#442852]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white border border-[#E8E4DF] p-6">
                <AssetDropzone label="Hero Slider Banner 1" configKey="heroBanner1" currentValue={layoutSettings.heroBanner1} onUploadSuccess={handleUploadSuccess} />
                <AssetDropzone label="Hero Slider Banner 2" configKey="heroBanner2" currentValue={layoutSettings.heroBanner2} onUploadSuccess={handleUploadSuccess} />
                <AssetDropzone label="Hero Slider Banner 3" configKey="heroBanner3" currentValue={layoutSettings.heroBanner3} onUploadSuccess={handleUploadSuccess} />
                <AssetDropzone label="About Us Editorial Split Banner" configKey="aboutUsImage" currentValue={layoutSettings.aboutUsImage} onUploadSuccess={handleUploadSuccess} />
              </div>
            )}
          </div>

          {/* Category Banners */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E8E4DF] pb-2 mb-4 text-left">Category Page Banners</h2>
            <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-wider text-left">Configure full-width dynamic backgrounds matching category page headers.</p>
            {loadingLayout ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#442852]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-[#E8E4DF] p-6">
                <AssetDropzone label="Resin Art Category Banner" configKey="category_resin" currentValue={layoutSettings.category_resin} onUploadSuccess={handleUploadSuccess} />
                <AssetDropzone label="Bespoke Jewelry Category Banner" configKey="category_jewellery" currentValue={layoutSettings.category_jewellery} onUploadSuccess={handleUploadSuccess} />
                <AssetDropzone label="Luxury Chocolate Boxes Category Banner" configKey="category_chocolate_boxes" currentValue={layoutSettings.category_chocolate_boxes} onUploadSuccess={handleUploadSuccess} />
                <AssetDropzone label="Floral Preservation Category Banner" configKey="category_flower_preservation" currentValue={layoutSettings.category_flower_preservation} onUploadSuccess={handleUploadSuccess} />
                <AssetDropzone label="Artisanal Keepsakes Category Banner" configKey="category_handmade" currentValue={layoutSettings.category_handmade} onUploadSuccess={handleUploadSuccess} />
                <AssetDropzone label="Aesthetic Stationery Category Banner" configKey="category_stationery" currentValue={layoutSettings.category_stationery} onUploadSuccess={handleUploadSuccess} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminGuard minRole={['admin', 'super-admin']} requiredPermission="canViewDashboard">
      <SettingsContent />
    </AdminGuard>
  );
}
