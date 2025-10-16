import React, { useState } from 'react';
import { checkVoterEligibility, uploadEligibilityFile } from '../services/api';

const VoterEligibility = () => {
  const [voterId, setVoterId] = useState('');
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const doCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await checkVoterEligibility(voterId);
      setResult(res);
    } catch (err) {
      console.error('Eligibility check failed', err);
      alert('Check failed');
    } finally { setLoading(false); }
  };

  const doUpload = async () => {
    if (!file) return alert('Select a file');
    setLoading(true);
    try {
      const res = await uploadEligibilityFile(file);
      alert('File uploaded: ' + (res?.message || 'OK'));
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
      <h3 className="text-sky-400 font-bold mb-3">Voter Eligibility</h3>
      <form onSubmit={doCheck} className="flex gap-2">
        <input value={voterId} onChange={e=>setVoterId(e.target.value)} placeholder="Voter ID or Email" className="p-2 rounded bg-gray-700 flex-1" />
        <button className="px-3 py-2 bg-sky-600 rounded">Check</button>
      </form>
      {result && (
        <div className="mt-3 text-sm text-gray-300">
          <div>Eligible: <strong className={`ml-2 ${result.eligible ? 'text-emerald-300' : 'text-red-400'}`}>{String(result.eligible)}</strong></div>
          <div>Reason: <span className="text-gray-400">{result.reason || 'N/A'}</span></div>
        </div>
      )}

      <div className="mt-4">
        <h4 className="text-sm text-gray-400 mb-2">Bulk Upload</h4>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="text-sm text-gray-300" />
        <div className="mt-2">
          <button onClick={doUpload} className="px-3 py-2 bg-emerald-600 rounded">Upload</button>
        </div>
      </div>
    </div>
  );
};

export default VoterEligibility;
