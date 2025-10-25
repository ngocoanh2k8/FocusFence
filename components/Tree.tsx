import React from 'react';

interface TreeProps {
    progress: number; // 0 to 1
    withered?: boolean;
}

export const Tree: React.FC<TreeProps> = ({ progress, withered = false }) => {
    const color = withered ? '#9ca3af' : '#84cc16'; // gray-400 or lime-500
    const trunkColor = withered ? '#78716c' : '#7c2d12'; // stone-500 or amber-900

    const trunkHeight = 10 + 90 * progress;
    const foliageScale = progress;

    return (
        <svg
            width="150"
            height="150"
            viewBox="0 0 200 200"
            style={{ 
                opacity: withered ? 0.6 : 1, 
                transition: 'opacity 0.5s ease-in-out' 
            }}
            aria-label="A growing tree representing focus session progress"
        >
            {/* Ground */}
            <path
                d="M 10 190 Q 100 170 190 190"
                stroke={trunkColor}
                strokeWidth="4"
                fill="transparent"
            />
            
            {/* Trunk */}
            <rect
                x="95"
                y={190 - trunkHeight}
                width="10"
                height={trunkHeight}
                fill={trunkColor}
                style={{ transition: 'y 1s ease-out, height 1s ease-out' }}
            />

            {/* Foliage */}
            <g
                style={{
                    transform: `scale(${foliageScale})`,
                    opacity: foliageScale > 0.1 ? 1 : 0,
                    transformOrigin: 'center 90px',
                    transition: 'transform 1s ease-out 0.5s, opacity 1s ease-out 0.5s',
                }}
            >
                <circle cx="100" cy="50" r="45" fill={color} />
                <circle cx="70" cy="80" r="35" fill={color} />
                <circle cx="130" cy="80" r="35" fill={color} />
                <circle cx="100" cy="95" r="30" fill={color} />
            </g>
        </svg>
    );
};