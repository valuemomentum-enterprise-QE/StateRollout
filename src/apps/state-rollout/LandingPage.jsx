import React from 'react';
import { Upload, FileSpreadsheet, TrendingUp, AlertCircle, Car } from 'lucide-react';

const LandingPage = ({ onUpload }) => (
  <div className="min-h-screen bg-gradient-to-br from-usaa-navy via-usaa-blue to-usaa-navy flex items-center justify-center p-6">
    <div className="max-w-4xl w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6">
          <FileSpreadsheet className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">Insurelytics</h1>
        <p className="text-xl text-white/80 mb-2">Upload your Excel file to visualize state filing jurisdiction analysis</p>
        <p className="text-sm text-white/70">Supports .xlsx and .xls formats</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="border-4 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-500 transition-all duration-300">
          <input type="file" accept=".xlsx,.xls" onChange={onUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-16 h-16 text-usaa-blue mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700 mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">Excel files only (Max 10MB)</p>
          </label>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-usaa-light rounded-lg p-4 text-center">
            <TrendingUp className="w-8 h-8 text-usaa-blue mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">Interactive Map</p>
            <p className="text-xs text-gray-600">Hover over states for details</p>
          </div>
          <div className="bg-usaa-light rounded-lg p-4 text-center">
            <Car className="w-8 h-8 text-usaa-blue mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">LOB Timeline</p>
            <p className="text-xs text-gray-600">Track rollouts by quarter</p>
          </div>
          <div className="bg-usaa-light rounded-lg p-4 text-center">
            <AlertCircle className="w-8 h-8 text-usaa-blue mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">Key Insights</p>
            <p className="text-xs text-gray-600">Automated KPI analysis</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LandingPage;