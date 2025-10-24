import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useLoader } from '../../contexts/LoaderContext';
import { 
  Shield, 
  Users, 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Clock
} from 'lucide-react';

const AdminAuditDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  
  const [auditData, setAuditData] = useState({
    auditLogs: [],
    statistics: [],
    userActivity: [],
    pagination: { page: 1, limit: 50, total: 0, pages: 0 }
  });
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    userId: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAuditData();
      loadSecurityEvents();
    }
  }, [user, currentPage, filters]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      showLoader('Loading audit data...');

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/admin/audit/dashboard?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuditData(data.data);
      } else {
        showToast('Failed to load audit data', 'error');
      }
    } catch (error) {
      console.error('Error loading audit data:', error);
      showToast('Failed to load audit data', 'error');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const loadSecurityEvents = async () => {
    try {
      const response = await fetch('/api/admin/audit/security', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSecurityEvents(data.data.securityLogs || []);
      }
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowLogModal(true);
  };

  const handleExport = async (format = 'json') => {
    try {
      showLoader('Exporting audit data...');

      const queryParams = new URLSearchParams({
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/admin/audit/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Audit data exported successfully', 'success');
      } else {
        showToast('Failed to export audit data', 'error');
      }
    } catch (error) {
      console.error('Error exporting audit data:', error);
      showToast('Failed to export audit data', 'error');
    } finally {
      hideLoader();
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'vote_cast':
      case 'vote_cast_onchain':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'login_failed':
      case 'unauthorized_access':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'kyc_approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'kyc_rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'suspicious_activity':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'vote_cast':
      case 'vote_cast_onchain':
        return 'bg-green-100 text-green-800';
      case 'login_failed':
      case 'unauthorized_access':
        return 'bg-red-100 text-red-800';
      case 'kyc_approved':
        return 'bg-green-100 text-green-800';
      case 'kyc_rejected':
        return 'bg-red-100 text-red-800';
      case 'suspicious_activity':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Dashboard</h1>
              <p className="text-gray-600">Monitor system activity and security events</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExport('json')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{auditData.pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{auditData.userActivity.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-gray-900">{securityEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Action Types</p>
                <p className="text-2xl font-bold text-gray-900">{auditData.statistics.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="vote_cast">Vote Cast</option>
                <option value="vote_cast_onchain">Vote Cast (On-chain)</option>
                <option value="login_failed">Login Failed</option>
                <option value="kyc_approved">KYC Approved</option>
                <option value="kyc_rejected">KYC Rejected</option>
                <option value="suspicious_activity">Suspicious Activity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                placeholder="Enter user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading audit logs...</p>
            </div>
          ) : auditData.auditLogs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditData.auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDate(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          <span className="ml-1">{log.action}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.performedBy}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {JSON.stringify(log.details).substring(0, 100)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewLog(log)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {auditData.pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * auditData.pagination.limit) + 1} to {Math.min(currentPage * auditData.pagination.limit, auditData.pagination.total)} of {auditData.pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(auditData.pagination.pages, prev + 1))}
                    disabled={currentPage === auditData.pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Log Details Modal */}
        {showLogModal && selectedLog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
                  <button
                    onClick={() => setShowLogModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                      {getActionIcon(selectedLog.action)}
                      <span className="ml-1">{selectedLog.action}</span>
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Performed By</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.performedBy}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Details</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-100 p-3 rounded-md overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditDashboard;
