import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';

const HelpGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to the Voting System",
      content: "This is a secure blockchain-based voting platform. You can create elections, manage candidates, and cast votes with full transparency and immutability.",
      target: null
    },
    {
      title: "Dashboard Overview",
      content: "The dashboard shows key statistics including active elections, total voters, system health, and recent activity. Use this to get a quick overview of the system.",
      target: ".dashboard-stats"
    },
    {
      title: "Creating Elections",
      content: "Go to the Elections tab to create new elections. You can set election details, schedule, and configure voting rules. Only admins can create elections.",
      target: ".elections-tab"
    },
    {
      title: "Managing Candidates",
      content: "In the Candidates tab, you can add candidates to elections, view their details, and manage candidate information. Each candidate is assigned to a specific seat/position.",
      target: ".candidates-tab"
    },
    {
      title: "Casting Votes",
      content: "To vote, select an election and choose your preferred candidate. Each vote is recorded on the blockchain for transparency and immutability.",
      target: ".voting-section"
    },
    {
      title: "Viewing Results",
      content: "Results are available in real-time and show vote counts, turnout statistics, and detailed analytics. Results are finalized when elections are closed.",
      target: ".results-tab"
    },
    {
      title: "System Monitoring",
      content: "Admins can monitor system health, blockchain status, security alerts, and system logs to ensure everything is running smoothly.",
      target: ".admin-tabs"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeGuide = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Help & Guide"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
              onClick={closeGuide}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Help & Guide
                </h3>
                <button
                  onClick={closeGuide}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-sky-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-white mb-3">
                  {steps[currentStep].title}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {steps[currentStep].content}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    onClick={closeGuide}
                    className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                  >
                    Finish
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpGuide;
