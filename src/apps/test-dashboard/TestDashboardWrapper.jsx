import React from 'react';
import TestResultDashboard from '../../../Test Result Dashboard/TestResultDashboard.jsx';

const TestDashboardWrapper = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-usaa-light">
      <div className="w-full bg-usaa-navy text-white px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Test Execution Dashboard</div>
        <button
          onClick={onBack}
          className="px-3 py-2 bg-usaa-blue hover:bg-usaa-navy-700 rounded"
        >
          Back to Home
        </button>
      </div>
      <div className="p-4">
        <TestResultDashboard />
      </div>
    </div>
  );
};

export default TestDashboardWrapper;