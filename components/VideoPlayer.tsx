import React from 'react';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `corkbrick-video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-stone-200 mt-4 animate-fade-in">
      <h4 className="text-md font-semibold text-stone-700 mb-2">Generated Video</h4>
      <video
        src={src}
        controls
        className="w-full rounded-md aspect-video bg-stone-900"
        aria-label="Generated video player"
      />
      <div className="mt-3 flex justify-end">
        <button
            onClick={handleDownload}
            className="bg-amber-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:bg-amber-700 transition-all duration-200 flex items-center gap-2"
            aria-label="Download generated video"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Download Video</span>
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
