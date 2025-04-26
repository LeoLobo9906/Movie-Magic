// src/components/ShareButtons.jsx

import React from 'react';
import { FaTwitter, FaFacebook, FaLink } from 'react-icons/fa';

export default function ShareButtons({ title, url }) {
  // Compose share URLs
  const text = encodeURIComponent(`Check out "${title}" on Movie Magic!`);
  const shareUrl = encodeURIComponent(url);

  const twitterUrl = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch {
      alert('Failed to copy link.');
    }
  };

  return (
    <div className="flex space-x-4 items-center">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className="text-blue-500 hover:text-blue-700"
      >
        <FaTwitter size={24} />
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="text-blue-600 hover:text-blue-800"
      >
        <FaFacebook size={24} />
      </a>
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        className="text-gray-600 hover:text-gray-800"
      >
        <FaLink size={24} />
      </button>
    </div>
  );
}