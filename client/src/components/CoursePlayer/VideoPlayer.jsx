import React from 'react';

const VideoPlayer = ({ lesson }) => {
    if (!lesson || !lesson.videoUrl) return <div className="p-10 text-center">No video available</div>;

    const isUploaded = lesson.videoUrl.startsWith('uploads') || lesson.videoUrl.startsWith('/uploads');
    const videoSrc = isUploaded ? `http://localhost:3000/${lesson.videoUrl.replace(/\\/g, '/')}` : lesson.videoUrl;

    return (
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
            <video
                controls
                className="w-full h-full"
                src={videoSrc}
                key={videoSrc} // Force re-render on src change
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;
