import React, { useState } from 'react';
import { createElection, previewElectionOnChain } from '../services/api';

const ElectionWizard = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [seats, setSeats] = useState(1);
  const [electionType, setElectionType] = useState('general');
  const [candidates, setCandidates] = useState([{ name: '', label: '' }]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const addCandidate = () => setCandidates([...candidates, { name: '', label: '' }]);
  const updateCandidate = (i, field, val) => {
    const copy = [...candidates]; copy[i][field] = val; setCandidates(copy);
  };

  const submit = async (e) => {
    e.preventDefault();
    // client-side validation
    const newErrors = {};
    if (!title || title.trim().length < 3) newErrors.title = 'Title is required (min 3 chars)';
    if (!start) newErrors.start = 'Start date/time is required';
    if (!end) newErrors.end = 'End date/time is required';
    const candErrors = candidates.map((c, i) => (!c.name || !c.name.trim() ? `Candidate ${i+1} name required` : null));
    if (candErrors.some(Boolean)) newErrors.candidates = candErrors;
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    setLoading(true);
    try {
      // normalize seats into an array of seat names if a number was provided
      let seatsArr = seats;
      if (!Array.isArray(seatsArr)) {
        const n = Number(seatsArr) || 1;
        seatsArr = Array.from({ length: n }, (_, i) => `Seat ${i + 1}`);
      }

      const payload = {
        title,
        startsAt: start,
        endsAt: end,
        electionType,
        seats: seatsArr,
        candidates: candidates.map((c, i) => ({ name: c.name, label: c.label, seat: c.label || seatsArr[i] || seatsArr[0] })),
      };
      const res = await createElection(payload);
      onCreated?.(res);
    } catch (err) {
      console.error('Create election failed', err);
      alert('Failed to create election: ' + (err?.message || err));
    } finally { setLoading(false); }
  };

  const doPreview = async () => {
    // preview current form locally (client-side) then call server if election exists
    const newErrors = {};
    if (!title || title.trim().length < 3) newErrors.title = 'Title is required (min 3 chars)';
    if (candidates.some(c => !c.name || !c.name.trim())) newErrors.candidates = ['Please fill candidate names'];
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    if (!loading) {
      setLoading(true);
      try {
        // if we have an id (created), preview via server, otherwise create a local preview
        if (preview?.id) {
          const res = await previewElectionOnChain(preview.id);
          setPreview(res);
        } else {
          // local preview representation
          setPreview({ id: 'local-preview', title, seats, candidates: candidates.map((c, i) => ({ id: i+1, name: c.name })) });
        }
      } catch (err) {
        console.warn('Preview unavailable', err);
        alert('Preview unavailable');
      } finally { setLoading(false); }
    }
  };

  return (
    // RESTYLED CONTAINER: Darker background, rounded corners, subtle border, lighter shadow
    <form onSubmit={submit} className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-teal-800/50 max-w-lg mx-auto">
      <h3 className="text-3xl font-extrabold text-teal-400 mb-6 border-b border-teal-800 pb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline mr-3 align-text-bottom" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Election Wizard
      </h3>
      
      {/* Input Field Styling (Unified) */}
      <div className="mb-4">
        <label htmlFor="election-title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
        <input 
          id="election-title" 
          aria-required="true" 
          aria-invalid={errors.title ? 'true' : 'false'} 
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
          // RESTYLED INPUT: Darker background, focus ring, light text, increased padding
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" 
        />
        {errors.title && <div role="alert" className="text-rose-500 text-xs mt-1">{errors.title}</div>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Start Date */}
        <div>
          <label htmlFor="election-start" className="block text-sm font-medium text-gray-300 mb-1">Start</label>
          <input 
            id="election-start" 
            aria-required="true" 
            aria-invalid={errors.start ? 'true' : 'false'} 
            required 
            type="datetime-local" 
            value={start} 
            onChange={e=>setStart(e.target.value)} 
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" 
          />
          {errors.start && <div role="alert" className="text-rose-500 text-xs mt-1">{errors.start}</div>}
        </div>
        
        {/* End Date */}
        <div>
          <label htmlFor="election-end" className="block text-sm font-medium text-gray-300 mb-1">End</label>
          <input 
            id="election-end" 
            aria-required="true" 
            aria-invalid={errors.end ? 'true' : 'false'} 
            required 
            type="datetime-local" 
            value={end} 
            onChange={e=>setEnd(e.target.value)} 
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" 
          />
          {errors.end && <div role="alert" className="text-rose-500 text-xs mt-1">{errors.end}</div>}
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        {/* Election Type Select */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Election Type</label>
          <select 
            value={electionType} 
            onChange={e=>setElectionType(e.target.value)} 
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-48 appearance-none" // Added appearance-none for better dark mode look
          >
            <option value="general">General</option>
            <option value="bylaw">Bylaw</option>
            <option value="referendum">Referendum</option>
          </select>
        </div>
        
        {/* Seats Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Seats</label>
          <input 
            type="number" 
            min="1" 
            value={seats} 
            onChange={e=>setSeats(Number(e.target.value))} 
            className="w-24 px-4 py-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" 
          />
        </div>
      </div>

      {/* Candidates Section */}
      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 mb-6">
        <h4 className="text-lg text-teal-400 font-bold mb-3">Candidates</h4>
        {candidates.map((c,i)=>(
          <div key={i} className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <input 
                id={`candidate-name-${i}`} 
                aria-label={`Candidate name ${i+1}`} 
                placeholder="Candidate Name" 
                value={c.name} 
                onChange={e=>updateCandidate(i,'name',e.target.value)} 
                className="p-3 rounded-lg bg-gray-600 text-gray-100 w-full border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" 
              />
              {errors.candidates && errors.candidates[i] && <div role="alert" className="text-rose-500 text-xs mt-1">{errors.candidates[i]}</div>}
            </div>
            <div>
              <input 
                id={`candidate-label-${i}`} 
                aria-label={`Candidate label ${i+1}`} 
                placeholder="Seat Label (Optional)" 
                value={c.label} 
                onChange={e=>updateCandidate(i,'label',e.target.value)} 
                className="p-3 rounded-lg bg-gray-600 text-gray-100 w-full border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" 
              />
            </div>
          </div>
        ))}
        {/* RESTYLED BUTTON: Teal accent color, soft hover effect, medium size */}
        <button 
          type="button" 
          onClick={addCandidate} 
          className="mt-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors shadow-lg shadow-teal-900/50"
        >
          + Add Candidate
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        {/* Create Button */}
        <button 
          type="submit" 
          disabled={loading} 
          // RESTYLED BUTTON: Primary action - Bright Emerald Green with high-contrast text and shadow
          className={`px-6 py-3 rounded-xl font-bold text-gray-900 transition-all shadow-lg ${loading 
            ? 'bg-emerald-800 cursor-not-allowed opacity-70' 
            : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-900/50'}`} 
          aria-disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Creating...
            </span>
          ) : 'Create Election'}
        </button>
        
        {/* Preview Button */}
        <button 
          type="button" 
          onClick={doPreview} 
          // RESTYLED BUTTON: Secondary action - Subtle gray/teal for preview/info
          className="px-6 py-3 bg-gray-600 text-teal-300 rounded-xl font-semibold hover:bg-gray-500 transition-colors shadow-md shadow-gray-900/50" 
          aria-pressed="false"
        >
          Preview On-Chain
        </button>
      </div>

      {/* Preview Section */}
      {preview && (
        // RESTYLED PREVIEW: Dedicated dark section for code/data, subtle border, monospace font
        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-teal-700/50 text-sm text-gray-400">
          <strong className="block text-teal-400 mb-2">On-chain Preview:</strong>
          <pre className="text-xs font-mono overflow-auto max-h-56 p-2 rounded bg-black/30 whitespace-pre-wrap">{JSON.stringify(preview, null, 2)}</pre>
        </div>
      )}
    </form>
  );
};

export default ElectionWizard;