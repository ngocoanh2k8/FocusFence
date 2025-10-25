import React from 'react';
import { motion } from 'framer-motion';

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
        <motion.svg
            width="150"
            height="150"
            viewBox="0 0 200 200"
            initial={false}
            animate={{ opacity: withered ? 0.6 : 1 }}
            transition={{ duration: 0.5 }}
            aria-label="A growing tree representing focus session progress"
        >
            {/* Ground */}
            <motion.path
                d="M 10 190 Q 100 170 190 190"
                stroke={trunkColor}
                strokeWidth="4"
                fill="transparent"
            />
            
            {/* Trunk */}
            <motion.rect
                x="95"
                width="10"
                fill={trunkColor}
                initial={{ y: 190, height: 0 }}
                animate={{
                    y: 190 - trunkHeight,
                    height: trunkHeight,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
            />

            {/* Foliage */}
            <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: foliageScale,
                    opacity: foliageScale > 0.1 ? 1 : 0,
                }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                style={{ transformOrigin: 'center 90px' }}
            >
                <motion.circle cx="100" cy="50" r="45" fill={color} />
                <motion.circle cx="70" cy="80" r="35" fill={color} />
                <motion.circle cx="130" cy="80" r="35" fill={color} />
                 <motion.circle cx="100" cy="95" r="30" fill={color} />
            </motion.g>
        </motion.svg>
    );
};
