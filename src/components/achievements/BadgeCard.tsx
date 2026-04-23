/**
 * BADGE DISPLAY COMPONENT
 * File: src/components/achievements/BadgeCard.tsx
 * 
 * Displays individual badge with animations and hover states
 */

'use client';

import { useState } from 'react';
import { Share2, Lock } from 'lucide-react';

interface BadgeCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  points: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  earnedAt?: string; // ISO date string - if null, badge is locked
  onShare?: (badgeId: string) => void;
}

const rarityColors = {
  COMMON: 'from-gray-400 to-gray-600',
  UNCOMMON: 'from-green-400 to-green-600',
  RARE: 'from-blue-400 to-blue-600',
  EPIC: 'from-purple-400 to-purple-600',
  LEGENDARY: 'from-yellow-400 to-yellow-600',
};

const rarityBorder = {
  COMMON: 'border-gray-400',
  UNCOMMON: 'border-green-400',
  RARE: 'border-blue-400',
  EPIC: 'border-purple-400',
  LEGENDARY: 'border-yellow-400',
};

export default function BadgeCard({
  id,
  name,
  description,
  icon,
  color,
  points,
  rarity,
  earnedAt,
  onShare,
}: BadgeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isEarned = !!earnedAt;

  const gradientClass = rarityColors[rarity];
  const borderClass = rarityBorder[rarity];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group transition-transform duration-300 ${isEarned ? 'cursor-pointer hover:-translate-y-1 hover:scale-[1.02]' : 'opacity-60'}`}
    >
      {/* Badge Container */}
      <div
        className={`
          w-full aspect-square rounded-2xl
          bg-gradient-to-br ${gradientClass}
          border-4 ${borderClass}
          p-6 flex flex-col items-center justify-center
          relative overflow-hidden
          transition-all duration-300
          ${isEarned ? 'shadow-lg shadow-black/20' : 'shadow-md'}
        `}
      >
        {/* Shine Effect */}
        {isEarned && (
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Lock Icon (if not earned) */}
        {!isEarned && (
          <div className="absolute top-2 right-2 bg-gray-800/80 rounded-full p-1">
            <Lock size={16} className="text-white" />
          </div>
        )}

        {/* Badge Icon */}
        <div className="text-6xl mb-4 drop-shadow-lg">{icon}</div>

        {/* Badge Points */}
        <div className="text-white/90 text-2xl font-bold mb-1 drop-shadow">
          {points}
          <span className="text-sm ml-1">pts</span>
        </div>

        {/* Rarity */}
        <div className="text-white/80 text-xs font-semibold uppercase tracking-wider drop-shadow">
          {rarity}
        </div>
      </div>

      {/* Badge Name & Description */}
      <div className="mt-3">
        <h3 className="font-bold text-white text-sm mb-1">{name}</h3>
        <p className="text-gray-400 text-xs line-clamp-2">{description}</p>

        {/* Earned Date */}
        {isEarned && earnedAt && (
          <p className="text-gray-500 text-xs mt-2">
            Earned: {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Hover Actions */}
      {isHovered && isEarned && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap animate-fade-in">
          <button
            onClick={() => onShare?.(id)}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg"
          >
            <Share2 size={12} />
            Share
          </button>
        </div>
      )}
    </div>
  );
}
