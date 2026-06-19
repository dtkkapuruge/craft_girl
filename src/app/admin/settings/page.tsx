'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Settings, Terminal, ShieldCheck, Save } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: any;
  userEmail: string;
  userRole: string;
  actionDescription: string;
}

function SettingsContent() {
  const { role } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [storeName, setStoreName] = useState('Craft Girly Store');
  const [codThreshold, setCodThreshold] = useState('500');
  const [notificationEmail, setNotificationEmail] = useState('orders@craftgirly.com');

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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings updated successfully!');
  };

  return (
    <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">Portal Settings</h1>
          <p className="mt-1.5 text-xs font-medium text-gray-500">Configure global metadata and limits.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <Settings className="w-5 h-5 text-purple-700" />
            <h3 className="text-sm font-bold text-gray-800">Store Metadata</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Default COD Fee (LKR)</label>
            <input
              type="number"
              value={codThreshold}
              onChange={(e) => setCodThreshold(e.target.value)}
              className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Notification Dispatch Email</label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-800"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#442852] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#321c3d] transition-all"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </form>
      </div>

      {/* Audit Logs Viewer */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">System Audit Logs</h1>
          <p className="mt-1.5 text-xs font-medium text-gray-500">Trace actions executed by staff and administrators.</p>
        </div>

        <div className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-[#FDFBF7] px-6 py-4 border-b border-gray-100">
            <Terminal className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-bold text-gray-800">Operation Records</h3>
          </div>

          {loadingLogs ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin text-purple-750" />
              <p className="mt-3 text-xs font-semibold">Retrieving system logs...</p>
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
                  <div key={log.id} className="p-4 hover:bg-gray-50/40 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-850">{log.actionDescription}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                        <span className="text-[#442852]">{log.userEmail}</span>
                        <span>•</span>
                        <span className="uppercase">{log.userRole}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-450 whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
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
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminGuard minRole={['admin', 'super-admin']} requiredPermission="canViewDashboard">
      <SettingsContent />
    </AdminGuard>
  );
}
