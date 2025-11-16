import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Upload } from 'lucide-react';
import { useGlobalUI } from '../../components/common';
import api from '../../services/api/api';

const RejectCandidateModal = ({ isOpen, candidate, onCancel, onSubmit }) => {
  const { showToast } = useGlobalUI();
  const [reason, setReason] = useState('ineligible');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !candidate) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let evidenceUrl = null;
      if (file) {
        const form = new FormData();
        form.append('file', file);
        // optional: include a field describing purpose
        form.append('purpose', 'candidate-evidence');
        const resp = await api.post('/uploads/document', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (resp && resp.data && resp.data.url) evidenceUrl = resp.data.url;
      }

      await onSubmit({
        disqualifiedReason: reason,
        disqualificationNotes: notes,
        disqualificationEvidence: evidenceUrl
      });
      showToast('Candidate rejected', 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to reject candidate', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Reject Candidate</h3>
          </div>
          <button onClick={onCancel} aria-label="Close">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <p className="text-sm text-gray-300 mb-3">Rejecting: <span className="font-medium">{candidate.name}</span></p>

        <label className="block text-sm text-gray-300 mb-1">Reason</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 mb-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
          <option value="ineligible">Ineligible</option>
          <option value="duplicate">Duplicate</option>
          <option value="fraud">Suspected Fraud</option>
          <option value="other">Other</option>
        </select>

        <label className="block text-sm text-gray-300 mb-1">Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full px-3 py-2 mb-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />

        <label className="block text-sm text-gray-300 mb-2">Evidence (optional)</label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer text-sm text-white">
            <Upload className="w-4 h-4" />
            <span>{file ? file.name : 'Select file'}</span>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
          {file && (
            <button onClick={() => setFile(null)} className="px-2 py-1 bg-red-600 text-white rounded">Remove</button>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">
            {submitting ? 'Rejecting...' : 'Reject Candidate'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RejectCandidateModal;
