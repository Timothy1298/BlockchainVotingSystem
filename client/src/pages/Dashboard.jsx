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
  PieChart,
  RefreshCw,
  Bell,
  Plus,
  Lock,
  Play,
  Trash2,
  BarChart2,
  ExternalLink,
  Sun,
  Moon,
  Search
} from "lucide-react";

// Placeholder components if you haven't implemented them yet
const VotePieChart = memo(({ data }) => (
  <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700 p-3">
    <div className="w-full">
      <div className="text-sm text-gray-400 mb-2">Vote Distribution</div>
      <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              {(data || []).map((d, i) => (
          <div key={d.id || d.label || i} className="flex items-center gap-3">
            <div className="w-2 h-6 flex-shrink-0" style={{ background: ['#38bdf8','#34d399','#a78bfa','#f97316','#ef4444'][i % 5] }} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <div className="text-white text-sm font-medium truncate max-w-[70%]" title={d.label || d.name}>{d.label || d.name}</div>
                <div className="text-gray-400 text-xs ml-2">{d.value ?? d.votes ?? 0}</div>
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
  <div className="h-full bg-gray-800 rounded-lg border border-gray-700 p-4 box-border">
    <div className="text-sm text-gray-400 mb-2">Vote Tally</div>
    <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
      {(data || []).map((d, i) => (
        <div key={d.id || d.label || i}>
          <div className="flex justify-between items-center text-sm text-gray-300 mb-1">
            <div className="truncate max-w-[65%]" title={d.label || d.name}>{d.label || d.name}</div>
            <div className="font-mono text-xs text-gray-400 ml-2">{d.value ?? d.votes ?? 0}</div>
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

// Small in-page mini navigation used on the dashboard for quick access
const MiniNav = ({ onNavigate }) => (
  <nav className="bg-gray-900 border border-gray-700 rounded-lg p-3">
    <ul className="space-y-1 text-sm">
      {[
        {k:'home', label: 'Dashboard', to: '/admin', icon: Activity},
        {k:'elections', label: 'Elections', to: '/admin/elections', icon: Calendar},
        {k:'candidates', label: 'Candidates', to: '/admin/candidates', icon: Users},
        {k:'voters', label: 'Voters', to: '/admin/voters', icon: Vote},
        {k:'results', label: 'Results', to: '/admin/results', icon: BarChart3},
        {k:'system', label: 'System', to: '/admin/system', icon: PieChart},
        {k:'security', label: 'Security', to: '/admin/security', icon: Shield},
        {k:'logs', label: 'Logs', to: '/admin/logs', icon: AlertTriangle},
  {k:'settings', label: 'Settings', to: '/admin/settings', icon: TrendingUp}
      ].map(item => (
        <li key={item.k}>
          <button
            onClick={() => onNavigate ? onNavigate(item.to) : window.location.assign(item.to)}
            className="w-full flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-gray-800 transition"
          >
            {item.icon ? <item.icon className="w-4 h-4 text-sky-400" /> : <span className="w-4 h-4" />}
            <span className="text-gray-200">{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  </nav>
);



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
    // Increase stale time to reduce frequent refetches and disable auto refetch on focus/reconnect
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
  const { data: systemData, isLoading: systemLoading, error: systemError } = useSystemMonitoring();

  // UI state for new dashboard features
  // Initialize selectedElectionId to null to avoid referencing chartElectionId
  // which is computed later in this component (prevents TDZ ReferenceError).
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [lastSynced, setLastSynced] = useState(Date.now());
  const [nowTicks, setNowTicks] = useState(Date.now());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidatePage, setCandidatePage] = useState(1);
  const CANDIDATES_PER_PAGE = 10;

  // Elections list UI filters/sorting
  const [electionFilterStatus, setElectionFilterStatus] = useState('all');
  const [electionCategory, setElectionCategory] = useState('all');
  const [electionSort, setElectionSort] = useState('dateCreated');

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

  // Lightweight system meta used by footer and security card
  const systemVersion = systemData?.version || systemData?.build?.version || 'unknown';
  const buildTime = systemData?.buildTime || systemData?.build?.time || '';
  const uptimeSeconds = systemData?.uptime || (systemData?.startedAt ? Math.floor((Date.now() - new Date(systemData.startedAt).getTime())/1000) : 0);
  const uptimePretty = `${Math.floor(uptimeSeconds/3600)}h ${Math.floor((uptimeSeconds%3600)/60)}m`;

  // Choose an election to show analytics for (priority: focused -> active -> completed)
  const chartElectionId = (focusedElection && (focusedElection._id || focusedElection.id)) || (overview.active?.[0]?._id) || (overview.completed?.[0]?._id) || null;
  // selectedElectionId falls back to chartElectionId if not set
  useEffect(()=>{
    if (!selectedElectionId) setSelectedElectionId(chartElectionId);
  },[chartElectionId]);

  const { data: finalResultsData, isLoading: finalResultsLoading, refetch: refetchFinalResults } = useFinalResults(selectedElectionId || chartElectionId);
  const chartData = useMemo(() => {
    const results = finalResultsData?.results || [];
    return results.map(r => ({ id: r.id || r._id, label: r.name, value: r.votes ?? r.value ?? 0, percentage: Number(r.percentage) || 0 }));
  }, [finalResultsData]);

  // election id we should act upon for quick actions (selected or fallback to chartElectionId)
  const activeElectionId = selectedElectionId || chartElectionId;

  // Auto-refresh final results when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    // 3 minutes auto-refresh
    const iv = setInterval(() => {
      refetchFinalResults?.();
      setLastSynced(Date.now());
    }, 3 * 60 * 1000);
    return () => clearInterval(iv);
  }, [autoRefresh, refetchFinalResults]);

  // Tick to update "seconds ago" display
  useEffect(() => {
    const iv = setInterval(() => setNowTicks(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Chart UI state
  const [chartTab, setChartTab] = useState('distribution'); // distribution | trends | turnout
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
      // Handle 401 (auth) errors gracefully — do not redirect to login silently
      if (err.response?.status === 401) {
        const authError = err.response?.data?.message || 'Admin password is incorrect or session expired. Please try again.';
        showToast(authError, 'error');
        // Restore token from localStorage if it exists (prevent silent logout)
        const savedToken = localStorage.getItem('token');
        if (!savedToken && token) {
          // If interceptor cleared token but we still have context token, the session was interrupted
          showToast('Your session was interrupted. Please log in again.', 'error');
        }
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to perform action';
        showToast(errorMessage, 'error');
      }
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
      {/* TOP HEADER: breadcrumbs, title, election selector, sync */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <nav className="text-sm text-gray-400">Home / <span className="text-white">Dashboard</span></nav>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="text-xs text-gray-400 ml-2">Last Synced: <span className="text-sky-300 font-mono">{Math.floor((nowTicks - lastSynced)/1000)}s ago</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="max-w-xs overflow-hidden">
              <select value={selectedElectionId || ''} onChange={(e)=>{ setSelectedElectionId(e.target.value); refetchFinalResults?.(); setLastSynced(Date.now()); }} className="bg-gray-800 text-white p-2 rounded border border-gray-700 text-sm w-full truncate">
              <option value="">-- Select Active Election --</option>
              {(Array.isArray(elections) ? elections : []).map(ev => (
                <option key={ev._id} value={ev._id} title={ev.title}>{ev.title} ({String(ev.status).toUpperCase()})</option>
              ))}
              </select>
            </div>
            <button title="Refresh" onClick={async ()=>{ await refetchElections(); refetchFinalResults?.(); setLastSynced(Date.now()); }} className="p-2 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 text-sky-300">
              <RefreshCw className="w-4 h-4" />
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)} /> Auto-refresh 3m
            </label>
            <button title="Toggle notifications" onClick={()=>setShowNotifications(!showNotifications)} className="relative p-2 bg-gray-800 border border-gray-700 rounded text-gray-200">
              <Bell className="w-5 h-5" />
              {(notifications?.length>0) && <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full px-1">{notifications.length}</span>}
            </button>
            <button title="Toggle theme" onClick={()=>{ const t = theme === 'dark' ? 'light' : 'dark'; setTheme(t); document.documentElement.setAttribute('data-theme', t); }} className="p-2 bg-gray-800 border border-gray-700 rounded text-gray-200">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick actions toolbar */}
        <div className="flex items-center gap-3 mb-4">
            <button onClick={()=>navigate('/admin/elections')} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded"> <Plus className="w-4 h-4"/> Create Election</button>
            <button
              onClick={async ()=>{
                if (!activeElectionId) { showToast('Select an election first to lock its candidate list.'); return; }
                try {
                  showToast('Locking candidate list...');
                  await lockCandidateListMutation.mutateAsync(activeElectionId);
                  showToast('Candidate list locked.');
                  refetchElections();
                } catch(e){ showToast('Failed to lock candidate list','error'); }
              }}
              disabled={!activeElectionId}
              className={`flex items-center gap-2 px-3 py-2 rounded border ${!activeElectionId ? 'opacity-50 cursor-not-allowed bg-gray-700 border-gray-700 text-gray-400' : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'}`}>
              <Lock className="w-4 h-4"/> Lock Candidate List
            </button>

          <button
            onClick={()=>{
              if (!activeElectionId) { showToast('Select an election first to open it.'); return; }
              handleChangeStatus(activeElectionId, 'Open');
            }}
            disabled={!activeElectionId}
            className={`flex items-center gap-2 px-3 py-2 rounded ${!activeElectionId ? 'opacity-50 cursor-not-allowed bg-emerald-700 text-white/60' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
            <Play className="w-4 h-4"/> Open Election
          </button>

          <button
            onClick={()=>{
              if (!activeElectionId) { showToast('Select an election first to clear votes.'); return; }
              setPendingAction({ type: 'clearVotes', electionId: activeElectionId });
              setShowPasswordPrompt(true);
            }}
            disabled={!activeElectionId}
            className={`flex items-center gap-2 px-3 py-2 rounded ${!activeElectionId ? 'opacity-50 cursor-not-allowed bg-red-700 text-white/60' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
            <Trash2 className="w-4 h-4"/> Clear Votes
          </button>
          <button onClick={()=>navigate('/admin/results')} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded border border-gray-700"> <BarChart2 className="w-4 h-4"/> View All Results</button>
          <button onClick={()=>navigate('/admin/blockchain-health')} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded border border-gray-700"> <ExternalLink className="w-4 h-4"/> Blockchain Explorer</button>
        </div>
      </div>

      {/* Notifications panel (toggle) */}
      {showNotifications && (
        <div className="fixed right-6 top-20 w-80 bg-gray-900 border border-gray-700 rounded shadow-lg z-50 p-3">
          <h4 className="text-sm font-semibold text-white mb-2">Notifications</h4>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {(notifications||[]).map((n,i)=> (
              <li key={n._id||i} className="text-sm text-gray-300 bg-gray-800 p-2 rounded"> <div className="font-medium text-white">{n.title}</div><div className="text-xs text-gray-400">{n.message}</div></li>
            ))}
            {(notifications||[]).length === 0 && <li className="text-sm text-gray-400">No notifications</li>}
          </ul>
        </div>
      )}

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

      {/* QUICK STATS OVERVIEW (enhanced) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <StatCard
            icon={Users}
            title="Total Voters"
            value={voterStats.total}
            subtitle={`${voterStats.cast} votes cast`}
            trend="up"
            trendValue={voterStats.rate}
            highlightColor="text-sky-400"
          />
          <div className="absolute -top-2 -right-2 bg-gray-800 text-xs px-2 py-0.5 rounded text-sky-300 border border-gray-700">{voterStats.rate}%</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative">
          <StatCard
            icon={Vote}
            title="Active Elections"
            value={overview.active?.length || 0}
            subtitle={`${overview.upcoming?.length || 0} upcoming`}
            highlightColor="text-emerald-400"
          />
          <div className={`absolute -top-2 -right-2 text-xs px-2 py-0.5 rounded ${overview.active?.length > 0 ? 'bg-emerald-700 text-white' : 'bg-gray-700 text-gray-300'}`}>{overview.active?.length || 0}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
          <StatCard
            icon={Activity}
            title="Blockchain Health"
            value={blockchain.nodes || 0}
            subtitle={`${blockchain.blocks || 0} blocks`}
            highlightColor="text-purple-400"
          />
          <div className={`absolute -top-2 -right-2 text-xs px-2 py-0.5 rounded ${blockchain.nodes > 1 ? 'bg-green-700 text-white' : 'bg-yellow-600 text-black'}`}>{blockchain.nodes} nodes</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative">
          <StatCard
            icon={Shield}
            title="Security Status"
            value={systemAlerts.length === 0 ? "Secure" : "Alert"}
            subtitle={`${logs.length} audit logs`}
            highlightColor={systemAlerts.length === 0 ? "text-green-400" : "text-red-400"}
            alertsCount={(systemAlerts || []).length}
          />
          {(systemAlerts || []).length > 0 && <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">{(systemAlerts || []).length} Alerts</div>}
        </motion.div>
      </div>

      {/* SYSTEM STATUS & PERFORMANCE DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SystemStatus />
        
      </div>

      {/* MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* === COLUMN 1: System Status & Tools (Vertical Focus) === */}
        <div className="xl:col-span-1 space-y-8">
            {/* Mini navigation summary for quick discovery */}
            <div>
              <MiniNav onNavigate={(to)=>navigate(to)} />
            </div>
            
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
            
            {/* Admin Security Snapshot */}
            <section className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-sky-400 mb-2">Admin Security</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span>System integrity</span>
                  <span className={`font-mono ${systemAlerts.length===0? 'text-emerald-400':'text-yellow-300'}`}>{systemAlerts.length===0? 'Good' : `${systemAlerts.length} issue(s)`}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last admin login</span>
                  <span className="text-gray-400 text-xs">{systemData?.lastAdminLogin || '—'}</span>
                </div>
                <div className="pt-2">
                  <button onClick={()=>navigate('/admin/security')} className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded">Review Security / 2FA</button>
                </div>
              </div>
            </section>
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
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-2">
                        <input value={candidateSearch} onChange={e=>{ setCandidateSearch(e.target.value); setCandidatePage(1); }} placeholder="Search candidate by name..." className="bg-gray-700 text-white rounded px-3 py-2 text-sm w-full" />
                        <select value={''} onChange={(e)=>{/* placeholder for more filters */}} className="bg-gray-700 text-white rounded px-3 py-2 text-sm">
                          <option value="">Sort: Default</option>
                        </select>
                      </div>

                      {/* compute filtered/sorted/paginated candidates */}
                      {(() => {
                        const list = Array.isArray(focusedCandidates) ? focusedCandidates.slice() : [];
                        // basic search filter
                        const filtered = list.filter(c => {
                          if (!candidateSearch) return true;
                          const s = candidateSearch.toLowerCase();
                          return (c.name || c.fullName || c.label || '').toLowerCase().includes(s) || (c.party || '').toLowerCase().includes(s);
                        });
                        // compute totals for progress bars
                        const totalVotes = filtered.reduce((s,c)=> s + (Number(c.votes) || Number(c.voteCount) || 0), 0) || 0;
                        // simple sort: by votes desc
                        filtered.sort((a,b)=> (Number(b.votes||b.voteCount||0) - Number(a.votes||a.voteCount||0)));
                        const start = (candidatePage - 1) * CANDIDATES_PER_PAGE;
                        const pageItems = filtered.slice(start, start + CANDIDATES_PER_PAGE);

                        if (filtered.length === 0) return <div className="text-gray-400">No candidates found for this election.</div>;

                        return (
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {pageItems.map((c, idx) => {
                                const votes = Number(c.votes || c.voteCount || 0);
                                const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                                const rank = filtered.indexOf(c) + 1;
                                const badge = rank === 1 ? 'Leading' : rank === 2 ? '2nd place' : (votes === 0 ? 'Eliminated' : null);
                                const initials = (c.name || c.fullName || '').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() || '?';
                                return (
                                  <div key={c._id || c.id || idx} className="p-3 bg-gray-800 rounded border border-gray-700 flex gap-3">
                                    <div className="flex-shrink-0">
                                      {c.photo || c.avatar ? (
                                        <img src={c.photo || c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                                      ) : (
                                        <div className="w-12 h-12 rounded-full bg-sky-700 flex items-center justify-center text-white font-bold">{initials}</div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                          <div className="font-semibold text-white truncate max-w-[200px]" title={c.name || c.fullName || c.label}>{c.name || c.fullName || c.label}</div>
                                          <div className="text-xs text-gray-400">Seat: {c.seat || c.label || '—'}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-mono text-gray-300">{votes}</div>
                                          {badge && <div className="text-xs mt-1 px-2 py-0.5 rounded-full bg-gray-700 text-gray-200">{badge}</div>}
                                        </div>
                                      </div>
                                      <div className="mt-3">
                                        <div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
                                          <div className="h-2 bg-emerald-500" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{pct}% of visible votes</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* pagination controls */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="text-sm text-gray-400">Showing {start+1}–{Math.min(start + pageItems.length, filtered.length)} of {filtered.length}</div>
                              <div className="flex items-center gap-2">
                                <button onClick={()=>setCandidatePage(p=>Math.max(1,p-1))} className="px-3 py-1 bg-gray-700 rounded text-sm">Prev</button>
                                <button onClick={()=>setCandidatePage(p=>p+1)} className="px-3 py-1 bg-gray-700 rounded text-sm">Next</button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
              </div>
            )}
            
      {/* Live Results/Analytics (Tabbed) */}
      {finalResultsLoading ? (
        <div className="h-64 flex items-center justify-center bg-gray-700/50 rounded-lg">
          <div className="text-gray-400 text-lg font-medium animate-pulse">Loading election results...</div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={()=>setChartTab('distribution')} className={`px-3 py-1 rounded ${chartTab==='distribution' ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-300'}`}>Votes Distribution</button>
              <button onClick={()=>setChartTab('trends')} className={`px-3 py-1 rounded ${chartTab==='trends' ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-300'}`}>Tally Trends</button>
              <button onClick={()=>setChartTab('turnout')} className={`px-3 py-1 rounded ${chartTab==='turnout' ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-300'}`}>Turnout Over Time</button>
            </div>
            <div className="flex items-center gap-3">
              <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="bg-gray-800 text-white px-3 py-1 rounded text-sm" />
              <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="bg-gray-800 text-white px-3 py-1 rounded text-sm" />
              <button onClick={()=>{ refetchFinalResults?.(); setLastSynced(Date.now()); }} className="px-3 py-1 rounded bg-gray-800 text-gray-200">Apply</button>
            </div>
          </div>

          <div>
            {chartTab === 'distribution' && (
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
            )}

            {chartTab === 'trends' && (
              <div className="h-72">
                <h3 className="text-lg font-semibold text-sky-400 mb-3">Tally Trends (recent)</h3>
                <VoteBarChart data={chartData} />
              </div>
            )}

            {chartTab === 'turnout' && (
              <div className="h-56 p-4 bg-gray-800 rounded">
                <h3 className="text-lg font-semibold text-sky-400 mb-3">Turnout Over Time</h3>
                <div className="flex items-center gap-4">
                  <div className="w-2/3">
                    <div className="w-full bg-gray-700 h-6 rounded overflow-hidden">
                      <div className="h-6 bg-emerald-500" style={{ width: `${Math.min(100, voterStats.rate||0)}%` }} />
                    </div>
                    <div className="text-sm text-gray-400 mt-2">Current turnout: {voterStats.rate}% ({voterStats.cast}/{voterStats.total})</div>
                  </div>
                  <div className="flex-1 text-sm text-gray-400">
                    <div>Selected: {selectedElectionId ? (elections.find(e=>e._id===selectedElectionId)?.title || 'Selected') : 'All'}</div>
                    <div>Range: {dateFrom || '—'} → {dateTo || '—'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

            {/* Election Overview with Quick Links */}
            <div className="pt-4">
                <h2 className="text-xl font-bold text-sky-400 mb-4">Elections at a Glance</h2>
                {/* Filters & sorting bar */}
                <div className="mb-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select value={electionFilterStatus} onChange={e=>setElectionFilterStatus(e.target.value)} className="bg-gray-800 text-white px-3 py-2 rounded text-sm border border-gray-700">
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                    <select value={electionCategory} onChange={e=>setElectionCategory(e.target.value)} className="bg-gray-800 text-white px-3 py-2 rounded text-sm border border-gray-700">
                      <option value="all">All categories</option>
                      <option value="president">President</option>
                      <option value="governor">Governor</option>
                      <option value="mp">MP</option>
                    </select>
                    <select value={electionSort} onChange={e=>setElectionSort(e.target.value)} className="bg-gray-800 text-white px-3 py-2 rounded text-sm border border-gray-700">
                      <option value="dateCreated">Sort: Date created</option>
                      <option value="votes">Sort: Votes</option>
                      <option value="alpha">Sort: Alphabetical</option>
                    </select>
                  </div>
                  <div className="ml-auto">
                    <button onClick={()=>{ /* placeholder: could refetch or apply more complex filtering */ }} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm">Apply</button>
                  </div>
                </div>
                <div className="space-y-4">
                    {["active","upcoming","completed"].map(type => (
                        <div key={type} className="border-l-4 border-sky-600/70 pl-4">
                            <h3 className="font-extrabold text-white mb-2 text-lg capitalize">{type} Elections ({overview[type]?.length || 0})</h3>
                            <ul className="divide-y divide-gray-700">
                                {(Array.isArray(overview[type]) ? overview[type] : []).map(ev => (
                                    <li key={ev._id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                                                      <span className="font-bold text-sky-400 block truncate max-w-[60vw] md:max-w-[36rem]" title={ev.title}>{ev.title}</span>
                                                                      <span className="ml-2 text-xs text-gray-400">{type==="completed" ? `Ended: ${ev.end}` : `${ev.start} - ${ev.end}`}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 md:mt-0">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${type==="active"?"bg-emerald-700":type==="upcoming"?"bg-yellow-700":"bg-gray-700"} text-white`}>
                                                {ev.type}
                                            </span>
                      {type === "active" && (
                        <Link to={`/admin/elections/${ev._id}`} className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition">
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
                        <span className="text-sky-400 font-mono">[{log.timestamp}]</span>
                        <span className="ml-2 truncate block" title={log.action}>{log.action}</span>
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
      {/* Dashboard Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-800 text-sm text-gray-400 flex items-center justify-between">
        <div>
          <div>System version: <span className="text-white font-mono">{systemVersion}</span></div>
          <div>Build: <span className="text-gray-300">{buildTime || 'n/a'}</span></div>
        </div>
        <div className="text-right">
          <div>Uptime: <span className="text-white">{uptimePretty}</span></div>
          <div>Support: <a href="mailto:support@example.org" className="text-sky-300">support@example.org</a></div>
        </div>
      </footer>
    </DashboardLayout>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;