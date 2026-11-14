import React, { useState } from 'react';
import { baseURL } from '../../config/server';

/** Turn YouTube / Vimeo page links into embeddable URLs; returns null for direct video files. */
const toEmbedUrl = (url) => {
    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\.|^m\./, '');
        if (host === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
        if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
            if (u.pathname.startsWith('/embed/')) return url;
            if (u.pathname.startsWith('/shorts/')) return `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
            const v = u.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${v}`;
        }
        if (host === 'vimeo.com') {
            const vid = u.pathname.split('/').filter(Boolean)[0];
            if (/^\d+$/.test(vid)) return `https://player.vimeo.com/video/${vid}`;
        }
        if (host === 'player.vimeo.com') return url;
    } catch {
        // relative path: fall through
    }
    return null;
};

const VideoPlayer = ({ lesson }) => {
    const [failed, setFailed] = useState(false);

    if (!lesson?.videoUrl) {
        return (
            <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center text-gray-400 gap-2">
                <i className="fas fa-video-slash text-3xl" aria-hidden="true"></i>
                <p>No video has been added to this lesson yet.</p>
            </div>
        );
    }

    const raw = lesson.videoUrl.replace(/\\/g, '/');
    const embed = toEmbedUrl(raw);

    if (embed) {
        return (
            <div className="aspect-video bg-black">
                <iframe
                    src={embed}
                    title={lesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    const isRelative = !/^(https?:|blob:|data:)/.test(raw);
    const videoSrc = isRelative ? `${baseURL || ''}/${raw.replace(/^\//, '')}` : raw;

    return (
        <div className="aspect-video bg-black relative">
            {failed ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2 p-6 text-center">
                    <i className="fas fa-exclamation-triangle text-3xl text-amber-400" aria-hidden="true"></i>
                    <p>This video couldn't be played.</p>
                    <a href={videoSrc} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline text-sm">Open the video in a new tab</a>
                </div>
            ) : (
                <video
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full"
                    src={videoSrc}
                    key={videoSrc}
                    onError={() => setFailed(true)}
                >
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    );
};

export default VideoPlayer;
