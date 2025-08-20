'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  sessionId: string;
}

export default function ShareButton({ sessionId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/editor/${sessionId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Share2 className="w-5 h-5" />
        分享链接
      </h3>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 p-2 border border-gray-300 rounded-md text-sm bg-gray-50"
        />
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 inline mr-1" />
              已复制
            </>
          ) : (
            '复制'
          )}
        </button>
      </div>
    </div>
  );
}