import React, { useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';


const TABS = [
  'Account & Profile',
  'Election Settings',
  'Candidate Management',
  'Voter Management',
  'Blockchain & Security',
  'System & App Settings',
  'Analytics & Reports',
  'Maintenance Tools',
  'Support & Help',
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-sky-400 mb-8 tracking-wide flex items-center gap-2">
          ⚙️ Admin Settings
        </h2>
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-semibold transition border-b-4 ${activeTab === tab ? 'border-sky-400 text-sky-300 bg-gray-800' : 'border-transparent text-gray-400 bg-gray-900 hover:text-sky-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-lg min-h-[400px]">
          {activeTab === 'Account & Profile' && (
            <div>
              <h3 className="text-xl font-bold text-sky-300 mb-4">Account & Profile Settings</h3>
              {/* TODO: Implement admin profile, password, 2FA, API keys, session history */}
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                <li>Admin name, role, contact info</li>
                <li>Change password / Update credentials</li>
                <li>Two-factor authentication (2FA) setup</li>
                <li>Manage API keys</li>
                <li>Session history & login activity</li>
              </ul>
            </div>
          )}
          {activeTab === 'Election Settings' && (
            <div>
              <h3 className="text-xl font-bold text-sky-300 mb-4">Election Settings</h3>
              {/* TODO: Implement election creation, editing, rules, phases, ballot structure */}
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                <li>Create new election</li>
                <li>Edit election details</li>
                <li>Set election rules</li>
                <li>Define voting phases</li>
                <li>Configure ballot structure</li>
              </ul>
            </div>
          )}
          {activeTab === 'Candidate Management' && (
            <div>
              <h3 className="text-xl font-bold text-sky-300 mb-4">Candidate Management</h3>
              {/* TODO: Implement add/edit/remove candidate, upload docs */}
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                <li>Add candidate</li>
                <li>Edit candidate details</li>
                <li>Remove/disqualify candidate</li>
                <li>Upload supporting documents</li>
              </ul>
            </div>
          )}
          {activeTab === 'Voter Management' && (
            <div>
              <h3 className="text-xl font-bold text-sky-300 mb-4">Voter Management</h3>
              {/* TODO: Implement register/approve/reset/blacklist voter, generate tokens */}
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                <li>Register new voters</li>
                <li>Approve/reject voter eligibility</li>
                <li>Reset voter access</li>
                <li>Blacklist/suspend accounts</li>
                <li>Generate voter access tokens/QR codes</li>
              </ul>
            </div>
          )}
          {activeTab === 'Blockchain & Security' && (
            <div>
              <h3 className="text-xl font-bold text-sky-300 mb-4">Blockchain & Security</h3>
              {/* TODO: Implement blockchain config, node mgmt, tx pool, encryption, fraud, backup */}
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                <li>Configure blockchain parameters</li>
                <li>Node management</li>
                <li>Monitor transaction pool</li>
                <li>Enable/disable encryption</li>
                <li>Fraud detection alerts</li>
                <li>Data backup and restore</li>
              </ul>
            </div>
          )}
          {activeTab === 'System & App Settings' && (
            <div>
              <h3 className="text-xl font-bold text-sky-300 mb-4">System & Application Settings</h3>
              {/* TODO: Implement roles, audit export, notifications, localization, integrations */}
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                <li>User roles & permissions</li>
                <li>Audit logs export</li>
                <li>Notification settings</li>
                <li>Language & localization</li>
                <li>Integration settings</li>
              </ul>
            </div>
          )}
          {activeTab === 'Analytics & Reports' && (
            <div>
              <h3 className="text-xl font-bold text-sky-300 mb-4">Analytics & Reports</h3>
              {/* TODO: Implement download reports, turnout stats, vote charts, incident logs, integrity check */}
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                <li>Download real-time election reports</li>
                <li>Voter turnout statistics</li>
                <li>Candidate vote distribution charts</li>
                <li>Security incident logs</li>
                <li>Blockchain integrity check results</li>
              </ul>
            </div>
          )}
          {activeTab === 'Maintenance Tools' && (
            <div>
              <h3 className="text-xl font-bold text-sky-300 mb-4">Maintenance Tools</h3>
              {/* TODO: Implement DB cleanup, updates, server status, sync, diagnostics */}
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                <li>Database cleanup</li>
                <li>System update & patch management</li>
                <li>Server status</li>
                <li>Sync check with blockchain nodes</li>
                <li>Debugging & diagnostic tools</li>
              </ul>
            </div>
          )}
          {activeTab === 'Support & Help' && (
            <div>
              <h3 className="text-xl font-bold text-sky-300 mb-4">Support & Help</h3>
              {/* TODO: Implement support contact, docs, version info, feedback */}
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                <li>Contact support</li>
                <li>User manuals / documentation</li>
                <li>System version info</li>
                <li>Feedback & issue reporting</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
