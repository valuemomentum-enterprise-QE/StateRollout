import React from 'react';
import qualityHtml from '/USAA_Quality_Dashboards_Interactive.html?raw';

const QualityIntelligenceWrapper = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-usaa-light flex flex-col">
      <div className="w-full bg-usaa-navy text-white px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">USAA P&C Quality Intelligence</div>
        <button
          onClick={onBack}
          className="px-3 py-2 bg-usaa-blue hover:bg-usaa-navy-700 rounded"
        >
          Back to Home
        </button>
      </div>
      <div className="flex-1">
        <iframe
          title="USAA Quality Dashboards"
          srcDoc={qualityHtml}
          className="w-full h-full"
          style={{ border: 'none', minHeight: 'calc(100vh - 56px)' }}
        />
      </div>
    </div>
  );
};

export default QualityIntelligenceWrapper;