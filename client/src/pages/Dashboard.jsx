// client/src/pages/Dashboard.jsx
import React, { useContext, useState, useEffect, useMemo, memo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; 
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AuthContext } from "../contexts/auth";
import { useElections, useFinalResults, useChangeElectionStatus, useLockCandidateList, useClearVotes } from "../hooks/elections";
import { AdminPasswordPrompt } from '../components/features/admin';
import { useSystemMonitoring } from "../hooks/system";
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../services/api';
import { StatCard, StatusCard, MetricCard, ElectionCard } from "../components/common";
import { Toast } from "../components/ui/feedback";
import { SystemStatus, PerformanceMonitor, SystemHealthDashboard } from "../components/common";
import { motion } from "framer-motion";
import { 
  Users, 
  Vote, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from "lucide-react";

// Placeholder components if you haven't implemented them yet
const VotePieChart = memo(({ data }) => (
  <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700 p-3">
    <div className="w-full">
      <div className="text-sm text-gray-400 mb-2">Vote Distribution</div>
      <div className="space-y-2">
        {(data || []).map((d, i) => (
          <div key={d.id || d.label || i} className="flex items-center gap-3">
            <div className="w-2 h-6" style={{ background: ['#38bdf8','#34d399','#a78bfa','#f97316','#ef4444'][i % 5] }} />
            <div className="flex-1">
              <div className="flex justify-between">
                <div className="text-white text-sm font-medium">{d.label || d.name}</div>
                <div className="text-gray-400 text-xs">{d.value ?? d.votes ?? 0}</div>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded mt-1 overflow-hidden">
                <div className="h-2 bg-sky-400" style={{ width: `${Math.min(100, d.percentage ?? 0)}%` }} />
              </div>
            </div>
          </div>
        ))}
        {(data || []).length === 0 && <div className="text-gray-500">No results available yet.</div>}
      </div>
    </div>
  </div>
));

VotePieChart.displayName = 'VotePieChart';

const VoteBarChart = memo(({ data }) => (
  <div className="h-full bg-gray-800 rounded-lg border border-gray-700 p-4">
    <div className="text-sm text-gray-400 mb-2">Vote Tally</div>
    <div className="space-y-3">
      {(data || []).map((d, i) => (
        <div key={d.id || d.label || i}>
          <div className="flex justify-between items-center text-sm text-gray-300 mb-1">
            <div className="truncate max-w-[65%]">{d.label || d.name}</div>
            <div className="font-mono text-xs text-gray-400">{d.value ?? d.votes ?? 0}</div>
          </div>
          <div className="w-full bg-gray-700 h-3 rounded overflow-hidden">
            <div className="h-3 bg-emerald-400" style={{ width: `${Math.min(100, d.percentage ?? 0)}%` }} />
          </div>
        </div>
      ))}
      {(data || []).length === 0 && <div className="text-gray-500">No results to display.</div>}
    </div>
  </div>
));

VoteBarChart.displayName = 'VoteBarChart';


const Dashboard = memo(() => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Use React Query hooks for data fetching
  const { data: electionsData, isLoading: electionsLoading, refetch: refetchElections } = useElections();
  const changeStatusMutation = useChangeElectionStatus();
  const lockCandidateListMutation = useLockCandidateList();
  const clearVotesMutation = useClearVotes();
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersAPI.list,
    staleTime: 1000 * 30,
  });
  const { data: systemData, isLoading: systemLoading, error: systemError } = useSystemMonitoring();

  const [focusedElection, setFocusedElection] = useState(null);
  const [focusedCandidates, setFocusedCandidates] = useState([]);
  const [showCandidatesPanel, setShowCandidatesPanel] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // If navigated with an electionId (from Elections list 'View Candidates'), fetch that election
  useEffect(() => {
    const electionId = location?.state?.electionId;
    if (!electionId) return;
    
    const elections = Array.isArray(electionsData) ? electionsData : [];
    const election = elections.find(e => e._id === electionId);
    if (election) {
      setFocusedElection(election);
      setFocusedCandidates(election?.candidates || []);
      setShowCandidatesPanel(true);
    }
  }, [location?.state, electionsData]);

  // Process data from hooks with proper null checks - memoized for performance
  const elections = useMemo(() => Array.isArray(electionsData) ? electionsData : [], [electionsData]);
  
  // Normalize status handling to accept legacy and current enum values
  const overview = useMemo(() => {
    const norm = s => String(s || '').toLowerCase();
    const activeStatuses = new Set(['open', 'active']);
    const upcomingStatuses = new Set(['setup', 'upcoming']);
    const completedStatuses = new Set(['closed', 'completed']);

    return {
      active: elections.filter(e => activeStatuses.has(norm(e.status))),
      upcoming: elections.filter(e => upcomingStatuses.has(norm(e.status))),
      completed: elections.filter(e => completedStatuses.has(norm(e.status)))
    };
  }, [elections]);

  const results = useMemo(() => {
    const norm = s => String(s || '').toLowerCase();
    return elections.find(e => ['closed', 'finalized', 'completed'].includes(norm(e.status))) || null;
  }, [elections]);
  
  const voterStats = useMemo(() => {
    if (!usersData?.users) return { total: 0, cast: 0, rate: 0 };
    const total = usersData.users.length;
    const cast = usersData.users.filter(u => u.votingHistory?.length > 0).length;
    const rate = total > 0 ? (cast / total * 100).toFixed(1) : 0;
    return { total, cast, rate };
  }, [usersData]);
  
  const candidates = useMemo(() => elections.flatMap(e => e.candidates || []), [elections]);
  
  const blockchain = useMemo(() => systemData?.blockchain || { blocks: 0, txCount: 0, latestHash: '', latestTime: '', nodes: 0 }, [systemData]);
  const logs = useMemo(() => systemData?.logs || [], [systemData]);
  const systemAlerts = useMemo(() => systemData?.alerts || [], [systemData]);
  const notifications = useMemo(() => systemData?.notifications || [], [systemData]);

  // Choose an election to show analytics for (priority: focused -> active -> completed)
  const chartElectionId = (focusedElection && (focusedElection._id || focusedElection.id)) || (overview.active?.[0]?._id) || (overview.completed?.[0]?._id) || null;
  const { data: finalResultsData, isLoading: finalResultsLoading } = useFinalResults(chartElectionId);
  const chartData = useMemo(() => {
    const results = finalResultsData?.results || [];
    return results.map(r => ({ id: r.id || r._id, label: r.name, value: r.votes ?? r.value ?? 0, percentage: Number(r.percentage) || 0 }));
  }, [finalResultsData]);

  // Handle system monitoring errors gracefully
  if (systemError) {
    console.warn('System monitoring data unavailable:', systemError);
  }

  const loading = electionsLoading || usersLoading || systemLoading;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handlePasswordConfirm = async (password) => {
    if (!pendingAction) return;
    try {
      if (pendingAction.type === 'changeStatus') {
        showToast(`Changing election status to ${pendingAction.status}...`, 'info');
        await changeStatusMutation.mutateAsync({ id: pendingAction.electionId, status: pendingAction.status, adminPassword: password });
        showToast(`Election status changed to ${pendingAction.status}`, 'success');
      } else if (pendingAction.type === 'clearVotes') {
        showToast('Clearing all votes...', 'info');
        await clearVotesMutation.mutateAsync({ id: pendingAction.electionId, adminPassword: password });
        showToast('All votes cleared successfully.', 'success');
      }
      // refresh list
      clearElectionsCache();
      await refetchElections();
    } catch (err) {
      console.error('Action error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to perform action';
      showToast(errorMessage, 'error');
    } finally {
      setShowPasswordPrompt(false);
      setPendingAction(null);
    }
  };

  const handleChangeStatus = async (id, status) => {
    const election = (Array.isArray(electionsData) ? electionsData : []).find(e => e._id === id);
    if (status === 'Open' && election && !election.candidateListLocked) {
      const shouldLock = window.confirm('To open this election, the candidate list must be locked first. Lock now?');
      if (shouldLock) {
        try {
          showToast('Locking candidate list...', 'info');
          await lockCandidateListMutation.mutateAsync(id);
          showToast('Candidate list locked successfully.', 'success');
          clearElectionsCache();
          await refetchElections();
        } catch (err) {
          showToast('Failed to lock candidate list', 'error');
          return;
        }
      } else {
        return;
      }
    }

    setPendingAction({ type: 'changeStatus', electionId: id, status });
    setShowPasswordPrompt(true);
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toast message={toastMsg} />
      

      {/* GLOBAL CRITICAL ALERT BANNER */}
      {(Array.isArray(systemAlerts) && systemAlerts.length > 0) && (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-red-800 text-white p-4 mb-6 rounded-lg shadow-2xl border-l-4 border-red-500 font-bold flex justify-between items-center"
        >
            <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 animate-pulse" />
                CRITICAL SECURITY ALERT: {systemAlerts[0].message || systemAlerts[0]}
            </div>
            <button onClick={() => setAlerts(alerts.slice(1))} className="text-red-300 hover:text-white transition">Dismiss</button>
        </motion.div>
      )}

      {/* QUICK STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Voters"
          value={voterStats.total}
          subtitle={`${voterStats.cast} votes cast`}
          trend="up"
          trendValue={voterStats.rate}
          highlightColor="text-sky-400"
        />
        <StatCard
          icon={Vote}
          title="Active Elections"
          value={overview.active?.length || 0}
          subtitle={`${overview.upcoming?.length || 0} upcoming`}
          highlightColor="text-emerald-400"
        />
        <StatCard
          icon={Activity}
          title="Blockchain Health"
          value={blockchain.nodes || 0}
          subtitle={`${blockchain.blocks || 0} blocks`}
          highlightColor="text-purple-400"
        />
        <StatCard
          icon={Shield}
          title="Security Status"
          value={systemAlerts.length === 0 ? "Secure" : "Alert"}
          subtitle={`${logs.length} audit logs`}
          highlightColor={systemAlerts.length === 0 ? "text-green-400" : "text-red-400"}
        />
      </div>

      {/* SYSTEM STATUS & PERFORMANCE DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SystemStatus />
        
      </div>

      {/* MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* === COLUMN 1: System Status & Tools (Vertical Focus) === */}
        <div className="xl:col-span-1 space-y-8">
            
            {/* User Info (Prominent) */}
            <section className="bg-gray-800 rounded-2xl p-6 border-b-4 border-sky-600 shadow-xl">
                <h2 className="text-xl font-bold text-sky-400 mb-4">👋 Access Portal</h2>
                {user ? (
                    <div className="text-white space-y-1">
                        <p><strong>Name:</strong> {user.fullName}</p>
                        <p><strong>Role:</strong> <span className="text-emerald-400 font-semibold">{user.role}</span></p>
                        {/* Admin Tools moved here for convenience */}
                        <div className="pt-4 mt-4 border-t border-gray-700 flex gap-3 flex-wrap">
                            <button onClick={() => window.location.reload()} className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg text-sm transition duration-150">Refresh Data</button>
                            <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm transition duration-150">Logout</button>
                        </div>
                    </div>
                ) : <p className="text-gray-400">Loading user info...</p>}
            </section>

            {/* Voter Turnout Metric */}
            <MetricCard
              icon={Users}
              title="Voter Turnout"
              value={voterStats.rate || 0}
              unit="%"
              description={`${voterStats.cast} of ${voterStats.total} registered voters`}
              highlightColor="text-emerald-400"
            />
            
            {/* Blockchain Status */}
            <StatusCard
              status={blockchain.nodes > 1 ? "active" : "warning"}
              title="Blockchain Network"
              description={`${blockchain.nodes || 0} nodes online, ${blockchain.blocks || 0} blocks confirmed`}
              icon={Activity}
            />
        </div>
        
        {/* === COLUMN 2: Core Data (Elections & Results Charts) === */}
        <section className="xl:col-span-2 bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Active Election Analytics</h2>

            {showCandidatesPanel && focusedElection && (
              <div className="mb-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-sky-300">Candidates for: {focusedElection.title}</h3>
                    <div className="text-xs text-gray-400">Election ID: {String(focusedElection._id || focusedElection.id).slice(0,10)}...</div>
                  </div>
                  <div>
                    <button onClick={()=>setShowCandidatesPanel(false)} className="px-3 py-1 bg-gray-700 rounded text-sm">Close</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(focusedCandidates || []).map((c, idx) => (
                    <div key={c._id || c.id || idx} className="p-3 bg-gray-800 rounded border border-gray-700">
                      <div className="font-semibold text-white">{c.name || c.fullName || c.label}</div>
                      <div className="text-xs text-gray-400">Seat: {c.seat || c.label || '—'}</div>
                      <div className="text-xs text-gray-400">Votes: {c.votes ?? c.voteCount ?? 0}</div>
                    </div>
                  ))}
                  {(focusedCandidates || []).length === 0 && <div className="text-gray-400">No candidates found for this election.</div>}
                </div>
              </div>
            )}
            
      {/* Live Results/Analytics (Combined) */}
      {finalResultsLoading ? (
        <div className="h-64 flex items-center justify-center bg-gray-700/50 rounded-lg">
        <div className="text-gray-400 text-lg font-medium animate-pulse">Loading election results...</div>
        </div>
      ) : (chartData && chartData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72">
            <h3 className="text-lg font-semibold text-sky-400 mb-3">Vote Distribution by Candidate</h3>
            <VotePieChart data={chartData} />
          </div>
          <div className="h-72">
            <h3 className="text-lg font-semibold text-sky-400 mb-3">Vote Tally Comparison</h3>
            <VoteBarChart data={chartData} />
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-700/50 rounded-lg">
          <div className="text-gray-400 text-lg font-medium animate-pulse">
            Awaiting data for active elections...
          </div>
        </div>
      ))}

            {/* Election Overview with Quick Links */}
            <div className="pt-4">
                <h2 className="text-xl font-bold text-sky-400 mb-4">Elections at a Glance</h2>
                <div className="space-y-4">
                    {["active","upcoming","completed"].map(type => (
                        <div key={type} className="border-l-4 border-sky-600/70 pl-4">
                            <h3 className="font-extrabold text-white mb-2 text-lg capitalize">{type} Elections ({overview[type]?.length || 0})</h3>
                            <ul className="divide-y divide-gray-700">
                                {(Array.isArray(overview[type]) ? overview[type] : []).map(ev => (
                                    <li key={ev._id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <span className="font-bold text-sky-400">{ev.title}</span>
                                            <span className="ml-2 text-xs text-gray-400">{type==="completed" ? `Ended: ${ev.end}` : `${ev.start} - ${ev.end}`}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 md:mt-0">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${type==="active"?"bg-emerald-700":type==="upcoming"?"bg-yellow-700":"bg-gray-700"} text-white`}>
                                                {ev.type}
                                            </span>
                                            {type === "active" && (
                                                <Link to={`/election/${ev._id}/results`} className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition">
                                                    View Live →
                                                </Link>
                                            )}
                                            {user?.role?.toLowerCase() === 'admin' && (
                                              <>
                                                {['setup','upcoming','setup'].includes(String(ev.status || '').toLowerCase()) && (
                                                  <button onClick={() => handleChangeStatus(ev._id, 'Open')} className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs">Open</button>
                                                )}
                                                {['open'].includes(String(ev.status || '').toLowerCase()) && (
                                                  <button onClick={() => handleChangeStatus(ev._id, 'Closed')} className="ml-2 px-2 py-1 bg-yellow-600 text-white rounded text-xs">Close</button>
                                                )}
                                              </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* === COLUMN 3: Logs & Notifications (Side-by-side on large screens) === */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Audit & Logs (with Filter Placeholder) */}
            <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-sky-400 mb-4">Audit & Security Logs</h2>
                <div className="mb-3 flex gap-2">
                    <input type="text" placeholder="Search logs..." className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
                    <select className="bg-gray-700 text-white border border-gray-600 rounded-lg p-2 text-sm">
                        <option>Filter: All</option>
                        <option>Filter: Critical</option>
                        <option>Filter: Warning</option>
                    </select>
                </div>
                <ul className="max-h-64 overflow-y-auto divide-y divide-gray-700 text-sm border border-gray-700 rounded-lg">
                    {(Array.isArray(logs) ? logs : []).map((log,i)=>(
                      <motion.li 
                        key={log._id || i} 
                        className={`py-2 px-3 text-gray-300 transition duration-150 ${log.level === 'Critical' ? 'bg-red-900/30' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span className="text-sky-400 font-mono">[{log.timestamp}]</span> {log.action}
                      </motion.li>
                    ))}
                    {(Array.isArray(logs) && logs.length === 0) && <li className="text-gray-500 py-2 px-3">No recent security events recorded.</li>}
                </ul>
            </section>

            {/* Notifications (Enhanced Styling) */}
            <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-sky-400 mb-4">Notifications & Updates</h2>
                <ul className="max-h-64 overflow-y-auto divide-y divide-gray-700 text-sm border border-gray-700 rounded-lg">
                    {(Array.isArray(notifications) ? notifications : []).map((n,i)=>(
                        <motion.li 
                          key={n._id || i} 
                          className="py-3 px-4 text-gray-300 flex justify-between items-start hover:bg-gray-700 transition"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                            <span className={`w-2 h-2 rounded-full mr-3 mt-1 ${n.read ? 'bg-gray-600' : 'bg-yellow-400 animate-pulse'}`}></span>
                            <div className="flex-1">
                                <p className="font-medium text-white">{n.title || "System Update"}</p>
                                <span className="text-xs text-gray-400">{n.message}</span>
                            </div>
                            <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">{n.time}</span>
                        </motion.li>
                    ))}
                    {(Array.isArray(notifications) && notifications.length === 0) && <li className="text-gray-500 py-3 px-4">No new notifications.</li>}
                </ul>
            </section>
        </div>
      </div>

      {/* System Monitoring Section */}
      <div className="mt-8 space-y-6">
        <SystemHealthDashboard />
        <PerformanceMonitor />
      </div>

      {/* Global Loading Screen (Only shown if 'loading' is true) */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center text-sky-400 text-xl font-bold">
            <div className="w-10 h-10 animate-spin mb-3 border-4 border-sky-400 border-t-transparent rounded-full"></div>
            <span className="animate-pulse">Loading secure dashboard data...</span>
          </div>
        </div>
      )}
      <AdminPasswordPrompt
        isOpen={showPasswordPrompt}
        onClose={() => { setShowPasswordPrompt(false); setPendingAction(null); }}
        onConfirm={handlePasswordConfirm}
        title="Admin Authorization Required"
        message={
          pendingAction?.type === 'clearVotes'
            ? 'Please enter your admin password to clear all votes from this election. This action is irreversible and will allow you to delete the election.'
            : pendingAction?.type === 'changeStatus'
            ? `Please enter your admin password to change the election status to ${pendingAction.status}.`
            : 'Please enter your admin password to perform this action.'
        }
        action={pendingAction?.type === 'clearVotes' ? 'Clear All Votes' : pendingAction?.type === 'changeStatus' ? `Change to ${pendingAction.status}` : 'Confirm'}
      />
    </DashboardLayout>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;