import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Link, User } from 'lucide-react';
import { useGlobalUI } from '../../components/common';

const CandidateDetailsModal = ({ isOpen, onClose, candidate, onSelect }) => {
  const { showToast } = useGlobalUI();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(candidate || null);

  useEffect(() => {
    setDetails(candidate || null);
  }, [candidate]);

  if (!isOpen || !details) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          className="bg-gray-900 rounded-xl p-6 w-full max-w-3xl border border-gray-800 max-h-[90vh] overflow-y-auto"
          role="dialog"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
              {details.photoUrl ? (
                <img src={details.photoUrl} alt={details.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400"><User /></div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">{details.name}</h3>
              <p className="text-gray-300">{details.position || details.party || ''}</p>
              <p className="text-blue-300 text-sm">{details.seat}</p>
              <p className="text-gray-400 text-xs mt-1">{details.electionTitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            {details.manifesto && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Manifesto</h4>
                <div className="text-gray-300 text-sm whitespace-pre-line">{details.manifesto}</div>
              </div>
            )}

            {details.bio && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">About</h4>
                <div className="text-gray-300 text-sm whitespace-pre-line">{details.bio}</div>
              </div>
            )}

            {(details.position || details.experience || details.education) && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Background</h4>
                <div className="text-gray-300 text-sm">
                  {details.position && <div><strong>Position:</strong> {details.position}</div>}
                  {details.experience && <div><strong>Experience:</strong> {details.experience}</div>}
                  {details.education && <div><strong>Education:</strong> {details.education}</div>}
                </div>
              </div>
            )}

            {details.social && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Social Links</h4>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(details.social).map(([k, v]) => (
                    <a key={k} href={v} target="_blank" rel="noreferrer" className="px-3 py-1 bg-gray-800 rounded text-sm text-blue-300 hover:underline flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> {k}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
            >
              Close
            </button>
            <button
              onClick={() => { onSelect && onSelect(details); onClose(); showToast('Proceed to confirm selection', 'info'); }}
              className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
            >
              Select Candidate
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CandidateDetailsModal;
