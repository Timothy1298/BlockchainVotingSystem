import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { VotePieChart, VoteBarChart } from "../components/VoteCharts";
import API from "../services/api";
import Toast from "../components/Toast";

const Dashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [overview, setOverview] = useState({ active: [], upcoming: [], completed: [] });
  const [results, setResults] = useState(null);
  const [voterStats, setVoterStats] = useState({ total: 0, cast: 0, rate: 0 });
  const [candidates, setCandidates] = useState([]);
  const [blockchain, setBlockchain] = useState({});
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

  // Unified fetch
  const fetchAllDashboardData = async () => {
    try {
      const [
        overviewRes,
        resultsRes,
        voterStatsRes,
        candidatesRes,
        blockchainRes,
        logsRes,
        alertsRes,
        notificationsRes,
      ] = await Promise.allSettled([
        API.get("/elections/overview"),
        API.get("/results/overview"),
        API.get("/voters/stats"),
        API.get("/candidates/overview"),
        API.get("/blockchain/status"),
        API.get("/audit-logs"),
        API.get("/alerts"),
        API.get("/notifications"),
      ]);

      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data);
      if (resultsRes.status === "fulfilled") setResults(resultsRes.value.data);
      if (voterStatsRes.status === "fulfilled") setVoterStats(voterStatsRes.value.data);
      if (candidatesRes.status === "fulfilled") setCandidates(candidatesRes.value.data);
      if (blockchainRes.status === "fulfilled") setBlockchain(blockchainRes.value.data);
      if (logsRes.status === "fulfilled") setLogs(logsRes.value.data);
      if (alertsRes.status === "fulfilled") setAlerts(alertsRes.value.data.alerts || []);
      if (notificationsRes.status === "fulfilled") setNotifications(notificationsRes.value.data);

      [overviewRes, resultsRes, voterStatsRes, candidatesRes, blockchainRes, logsRes, alertsRes, notificationsRes].forEach((res, i) => {
        if (res.status === "rejected")
          showToast(`⚠️ Failed to load ${["overview","results","voter stats","candidates","blockchain","logs","alerts","notifications"][i]}`);
      });
    } catch (err) {
      console.error(err);
      showToast("⚠️ Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllDashboardData();
    const interval = setInterval(fetchAllDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <Toast message={toastMsg} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Election Overview */}
        <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Election Overview</h2>
          {["active","upcoming","completed"].map(type => (
            <div key={type}>
              <h3 className="font-semibold text-white mb-2 capitalize">{type} Elections</h3>
              <ul className="divide-y divide-gray-700">
                {(Array.isArray(overview[type]) ? overview[type] : []).map(ev => (
                  <li key={ev._id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="font-bold text-sky-400">{ev.title}</span>
                      <span className="ml-2 text-xs bg-sky-700 text-white px-2 py-1 rounded">{ev.type}</span>
                      <span className="ml-2 text-xs text-gray-400">{type==="completed" ? `Ended: ${ev.end}` : `${ev.start} - ${ev.end}`}</span>
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${type==="active"?"bg-emerald-700":type==="upcoming"?"bg-yellow-700":"bg-gray-700"} text-white`}>
                      {type.charAt(0).toUpperCase()+type.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Live Results */}
        <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Live Results</h2>
          {results ? <>
            <VotePieChart data={results.chartData||[]} />
            <VoteBarChart data={results.chartData||[]} />
          </> : <div className="text-gray-400">No results data yet.</div>}
        </section>

        {/* Voter Stats */}
        <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Voter Statistics</h2>
          <div className="text-white space-y-2">
            <p>Total Registered: {voterStats.total}</p>
            <p>Votes Cast: {voterStats.cast}</p>
            <p>Turnout Rate: {voterStats.rate}%</p>
          </div>
        </section>

        

        {/* Blockchain Status */}
        <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Blockchain Status</h2>
          <div className="text-white space-y-2">
            <p>Blocks: {blockchain.blocks}</p>
            <p>Transactions: {blockchain.txCount}</p>
            <p>Latest Hash: <span className="text-xs text-emerald-400">{blockchain.latestHash}</span></p>
            <p>Last Updated: {blockchain.latestTime}</p>
          </div>
        </section>

        {/* Audit & Logs */}
        <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Audit & Security Logs</h2>
          <ul className="max-h-48 overflow-y-auto divide-y divide-gray-700 text-sm">
            {logs.map((log,i)=>(
              <li key={i} className="py-2 text-gray-300">
                <span className="text-sky-400">[{log.timestamp}]</span> {log.action}
              </li>
            ))}
          </ul>
        </section>

        {/* User Info */}
        <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Logged User</h2>
          {user ? (
            <div className="text-white">
              <p><strong>Name:</strong> {user.fullName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          ) : <p className="text-gray-400">No user info available.</p>}
        </section>

        {/* Admin Tools */}
        <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Administrative Tools</h2>
          <div className="flex gap-3 flex-wrap">
            <button onClick={fetchAllDashboardData} className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl">Refresh Data</button>
            <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl">Logout</button>
          </div>
        </section>

        {/* Analytics */}
        <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Analytics Overview</h2>
          {results ? <VoteBarChart data={results.chartData||[]} /> : <div className="text-gray-400">No analytics data available.</div>}
        </section>

        {/* Notifications */}
        <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-4">Notifications</h2>
          <ul className="max-h-48 overflow-y-auto divide-y divide-gray-700 text-sm">
            {notifications.map((n,i)=>(
              <li key={i} className="py-2 text-gray-300 flex justify-between">
                <span>{n.message}</span>
                <span className="text-xs text-gray-500">{n.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="text-sky-400 text-xl font-bold animate-pulse">Loading dashboard...</div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
