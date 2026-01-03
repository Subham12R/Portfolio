import React from 'react';
import ResumePdf from '../../assets/Resume.pdf';
import { ArrowLeft01Icon, Download01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from 'react-router-dom';

const Resume = () => {
  // Function to download resume
  const downloadResume = () => {
    try {
      const link = document.createElement('a');
      link.href = ResumePdf;
      link.download = 'Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header with back button and download */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md mx-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          
          <button 
            onClick={downloadResume}
            className="inline-flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/20 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/30 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
          >
            <HugeiconsIcon icon={Download01Icon} size={14} />
            Download
          </button>
        </div>
      </div>

      {/* Resume Viewer */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
          <iframe
            src={ResumePdf}
            className="w-full h-[calc(100vh-12rem)]"
            title="Resume"
            style={{ minHeight: '800px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Resume;