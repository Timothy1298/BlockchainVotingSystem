// client/src/pages/auth/Dashboard.jsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; 
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
// Assuming VoteCharts components exist and are imported correctly
// import { VotePieChart, VoteBarChart } from "../components/VoteCharts";
import API from "../services/api";
import Toast from "../components/Toast";
import LiveSyncStatus from "../components/LiveSyncStatus";
import { motion } from "framer-motion"; 

// Placeholder components if you haven't implemented them yet
const VotePieChart = ({ data }) => <div className="text-gray-500 text-center py-10">Pie Chart Placeholder</div>;
const VoteBarChart = ({ data }) => <div className="text-gray-500 text-center py-10">Bar Chart Placeholder</div>;


const Dashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [overview, setOverview] = useState({ active: [], upcoming: [], completed: [] });
  const [results, setResults] = useState(null);
  const [voterStats, setVoterStats] = useState({ total: 0, cast: 0, rate: 0 });
  const [candidates, setCandidates] = useState([]);
  const [focusedElection, setFocusedElection] = useState(null);
  const [focusedCandidates, setFocusedCandidates] = useState([]);
  const [showCandidatesPanel, setShowCandidatesPanel] = useState(false);
  const location = useLocation();
  const [blockchain, setBlockchain] = useState({ blocks: 0, txCount: 0, latestHash: '', latestTime: '', nodes: 0 }); 
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // NEW STATE: API Status Tracker
  const [apiStatus, setApiStatus] = useState({
    overview: 'pending', results: 'pending', voterStats: 'pending', 
    candidates: 'pending', blockchain: 'pending', logs: 'pending', 
    alerts: 'pending', notifications: 'pending'
  });
  
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Unified fetch - CORRECTED ENDPOINTS (NO DOUBLE /api) WITH STATUS TRACKING
  const fetchAllDashboardData = async () => {
    setLoading(true);
    // Reset all statuses to pending
    setApiStatus({
      overview: 'pending', results: 'pending', voterStats: 'pending', 
      candidates: 'pending', blockchain: 'pending', logs: 'pending', 
      alerts: 'pending', notifications: 'pending'
    });

    try {
      const endpoints = [
        "/elections/overview", "/results/overview", "/voters/stats", 
        "/candidates/overview", "/blockchain/status", "/audit-logs", 
        "/alerts", "/notifications"
      ];
      // Keys must match the apiStatus state keys
      const keys = [
        "overview", "results", "voterStats", "candidates", 
        "blockchain", "logs", "alerts", "notifications"
      ];

      const promises = endpoints.map(url => API.get(url));
      // Use Promise.allSettled to ensure all resolve/reject before proceeding
      const resultsArray = await Promise.allSettled(promises);

      resultsArray.forEach((res, i) => {
        const key = keys[i];
        
        if (res.status === "rejected") {
          console.error(`🚨 Failed to fetch ${key}:`, res.reason);
          showToast(`⚠️ Failed to load ${key}.`);
          setApiStatus(prev => ({ ...prev, [key]: 'failed' }));
          return;
        }

        // If fulfilled, update status and set data
        setApiStatus(prev => ({ ...prev, [key]: 'fulfilled' }));
        const data = res.value.data;
        
        switch(key) {
            case 'overview': setOverview(data); break;
            case 'results': setResults(data); break;
            case 'voterStats': setVoterStats(data.total !== undefined ? data : { total: 0, cast: 0, rate: 0 }); break;
            case 'candidates': setCandidates(data); break;
            case 'blockchain': setBlockchain(prev => ({...prev, ...data})); break;
            case 'logs': setLogs(data); break;
            case 'alerts': setAlerts(data.alerts || data); break; // Adjusting for array vs object response
            case 'notifications': setNotifications(data); break;
            default: break;
        }
      });
      
    } catch (err) {
      console.error("🔥 Global fetch error:", err);
      showToast("⚠️ Failed to fetch dashboard data.");
    } finally {
      // This will run immediately once all promises in allSettled finish (whether success or fail)
      setLoading(false); 
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllDashboardData();
    const interval = setInterval(fetchAllDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // If navigated with an electionId (from Elections list 'View Candidates'), fetch that election
  useEffect(() => {
    const electionId = location?.state?.electionId;
    if (!electionId) return;
    const fetchElection = async (id) => {
      try {
        const res = await API.get(`/elections/${id}`);
        const ev = res.data;
        setFocusedElection(ev);
        setFocusedCandidates(ev?.candidates || []);
        setShowCandidatesPanel(true);
      } catch (err) {
        console.error('Failed to fetch election candidates', err);
        setShowCandidatesPanel(false);
      }
    };
    fetchElection(electionId);
  }, [location?.state]);

  return (
    <DashboardLayout>
      <Toast message={toastMsg} />

      {/* GLOBAL CRITICAL ALERT BANNER */}
      {(Array.isArray(alerts) && alerts.length > 0) && (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-red-800 text-white p-4 mb-6 rounded-lg shadow-2xl border-l-4 border-red-500 font-bold flex justify-between items-center"
        >
            <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                CRITICAL SECURITY ALERT: {alerts[0].message || alerts[0]} {/* Added fallback for Latin text issue */}
            </div>
            <button onClick={() => setAlerts(alerts.slice(1))} className="text-red-300 hover:text-white transition">Dismiss</button>
        </motion.div>
      )}

      {/* API DEBUG STATUS TRACKER (The new debugging tool) */}
      <section className="bg-gray-900 border border-gray-700 p-4 mb-6 rounded-lg shadow-2xl">
        <h3 className="text-lg font-bold text-yellow-400 mb-3 border-b border-gray-700 pb-2">
          API Load Status Debugger 🛠️
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(apiStatus).map(([key, status]) => (
            <div key={key} className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                status === 'fulfilled' ? 'bg-emerald-500' : 
                status === 'failed' ? 'bg-red-500' : 
                'bg-yellow-500 animate-pulse'
              }`}></span>
              <span className="font-semibold text-gray-300 capitalize">{key}:</span>
              <span className={`font-mono ${
                status === 'fulfilled' ? 'text-emerald-300' : 
                status === 'failed' ? 'text-red-300' : 
                'text-yellow-300'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
            If the status bar remains yellow ('pending'), that endpoint is timing out on the server.
        </p>
      </section>

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
                            <button onClick={fetchAllDashboardData} className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg text-sm transition duration-150">Refresh Data</button>
                            <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm transition duration-150">Logout</button>
                        </div>
                    </div>
                ) : <p className="text-gray-400">Loading user info...</p>}
            </section>

            {/* Voter Stats (Enhanced Visual) */}
            <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-sky-400 mb-4">Voter Turnout</h2>
                <div className="text-white space-y-3">
                    <p className="flex justify-between items-center">
                        <span className="text-lg">Registered:</span> <span className="text-2xl font-bold text-sky-300">{voterStats.total}</span>
                    </p>
                    <p className="flex justify-between items-center pb-2 border-b border-gray-700">
                        <span className="text-lg">Cast Votes:</span> <span className="text-2xl font-bold text-emerald-300">{voterStats.cast}</span>
                    </p>
                    
                    {/* Turnout Rate Gauge Placeholder */}
                    <div className="flex flex-col items-center pt-3">
                        <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-1000" 
                                style={{ width: `${voterStats.rate || 0}%` }}
                            ></div>
                        </div>
                        <p className="text-4xl font-extrabold text-emerald-400 mt-2">{voterStats.rate}%</p>
                        <p className="text-sm text-gray-400">Current Turnout Rate</p>
                    </div>
                </div>
            </section>
            
            {/* Blockchain Status (Enhanced with health check) */}
            <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-sky-400 mb-4">Blockchain Core Status</h2>
                <div className="text-white space-y-2">
                    {/* Node Connectivity Health Check */}
                    <p className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <span className="font-semibold">Node Health:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${blockchain.nodes > 1 ? 'bg-emerald-600' : 'bg-red-600'}`}>
                            {blockchain.nodes > 1 ? `${blockchain.nodes}/16 Online` : 'Syncing...'}
                        </span>
                    </p>
                    <p>Blocks Confirmed: <span className="text-lg text-yellow-400">{blockchain.blocks || 0}</span></p>
                    <p>Transactions (Latest Block): <span className="text-lg text-sky-400">{blockchain.txCount || 0}</span></p>
                    
                    <div className="mt-4 pt-3 border-t border-gray-700">
                        <p className="text-sm font-semibold">Latest Block Hash (Proof of Immutability):</p>
                        <p className="text-xs text-emerald-400 font-mono break-all">{blockchain.latestHash?.substring(0, 30) + '...' || 'N/A'}</p>
                    </div>
                </div>
            </section>
            
      {/* Live Sync Status Widget */}
      <LiveSyncStatus />
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
            {results?.chartData?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-72"> {/* Define height for charts */}
                        <h3 className="text-lg font-semibold text-sky-400 mb-3">Vote Distribution by Candidate</h3>
                        <VotePieChart data={results.chartData} />
                    </div>
                    <div className="h-72">
                        <h3 className="text-lg font-semibold text-sky-400 mb-3">Vote Tally Comparison</h3>
                        <VoteBarChart data={results.chartData} />
                    </div>
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center bg-gray-700/50 rounded-lg">
                    <div className="text-gray-400 text-lg font-medium animate-pulse">
                        Awaiting data for active elections...
                    </div>
                </div>
            )}

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

      {/* Global Loading Screen (Only shown if 'loading' is true) */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center text-sky-400 text-xl font-bold">
            <svg className="w-10 h-10 animate-spin mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" className="opacity-75"/>
            </svg>
            <span className="animate-pulse">Loading secure dashboard data...</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;