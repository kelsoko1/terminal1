import React from 'react';
import { motion } from 'framer-motion';
import { FaSkull, FaCamera, FaBriefcase } from 'react-icons/fa';
import type { Challenge } from './KelsokoChallengeCard';
import type { UnifiedChallenge } from '@/lib/services/challengeService';

const iconMap = {
  skull: <FaSkull className="investor-danger" />,
  camera: <FaCamera className="investor-info" />,
  briefcase: <FaBriefcase className="investor-warning" />,
};

const payoutColor = {
  '$': 'investor-bg-success',
  '$$': 'investor-bg-warning',
  '$$$': 'investor-bg-danger',
};

interface KelsokoChallengeModalProps {
  challenge: Challenge | UnifiedChallenge;
  onClose: () => void;
}

// Normalizer: Convert UnifiedChallenge to Challenge
function toChallenge(challenge: Challenge | UnifiedChallenge): Challenge {
  if ('time' in challenge && 'distance' in challenge && 'payout' in challenge) {
    return challenge as Challenge;
  }
  // Map UnifiedChallenge to Challenge
  return {
    id: typeof challenge.id === 'number' ? challenge.id : parseInt(challenge.id, 10) || 0,
    title: challenge.title,
    time: (challenge as any).time || (challenge.createdAt ? new Date(challenge.createdAt).toLocaleDateString() : ''),
    distance: (challenge as any).distance || (challenge.expiresAt && challenge.createdAt ? `${Math.ceil((new Date(challenge.expiresAt).getTime() - new Date(challenge.createdAt).getTime()) / (1000*60*60*24))} days` : ''),
    type: (challenge as any).type || 'skull',
    payout: (challenge as any).payout || (typeof challenge.reward === 'number' ? '$' : typeof challenge.reward === 'string' && challenge.reward.includes('1,000,000') ? '$$$' : '$$'),
    image: (challenge as any).image || undefined,
    description: challenge.description,
  };
}

export const KelsokoChallengeModal = ({ challenge, onClose }: KelsokoChallengeModalProps) => {
  const normalized = toChallenge(challenge);
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 flex justify-end items-stretch"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
        style={{ zIndex: 0 }}
      />
      {/* Modal Content */}
      <div className="relative h-full w-full sm:w-[80vw] max-w-xl flex flex-col justify-between z-10 animate-slide-in-right rounded-2xl shadow-2xl border border-white/20 bg-[#23232a]/80 backdrop-blur-xl overflow-hidden max-h-screen overflow-auto"
        style={{ boxShadow: '0 8px 48px 0 rgba(239,68,68,0.18)' }}>
        {/* Faded image overlay for glassmorphism */}
        {normalized.image && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `url(${normalized.image}) center/cover no-repeat`,
            opacity: 0.18,
            zIndex: 0,
            pointerEvents: 'none',
            filter: 'blur(2px) brightness(0.7)'
          }} />
        )}
        <button onClick={onClose} className="absolute top-2 right-2 sm:top-4 sm:right-4 investor-danger text-2xl sm:text-3xl z-20 hover:scale-110 transition-transform">✕</button>
        <div className="flex-1 flex flex-col justify-center relative z-10 px-4 py-6 sm:px-8 sm:pt-20 sm:pb-8 w-full max-w-full">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 sm:mb-6">
            <span className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-white/10 border-4 border-white/30 shadow-xl text-2xl sm:text-3xl" style={{ boxShadow: '0 2px 16px 2px rgba(239,68,68,0.18)' }}>
              {iconMap[normalized.type as keyof typeof iconMap]}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight text-center sm:text-left w-full truncate">{normalized.title}</h2>
          </div>
          <p className="text-gray-200 mb-6 sm:mb-8 text-base sm:text-lg font-medium drop-shadow-sm bg-black/10 rounded-lg px-3 py-2 sm:px-4 sm:py-2" style={{ backdropFilter: 'blur(1px)' }}>{normalized.description}</p>
          <div className="flex flex-col sm:flex-row justify-between items-center text-gray-300 mb-6 sm:mb-10 text-base sm:text-lg font-mono gap-2 sm:gap-0">
            <span className="px-3 py-1 rounded-full bg-black/30 border border-white/10 shadow text-base">{normalized.time}</span>
            <span className="px-3 py-1 rounded-full bg-black/30 border border-white/10 shadow text-base">{normalized.distance}</span>
            <span className={`px-4 py-1 rounded-full text-base sm:text-lg font-bold text-white shadow-md border-2 border-white/30 ${payoutColor[normalized.payout as keyof typeof payoutColor]}`}>{normalized.payout}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-700 bg-[#23232a]/80 backdrop-blur-xl z-10 w-full">
          <button className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all text-center">Accept</button>
          <button onClick={onClose} className="flex-1 bg-gray-700/80 text-white py-3 rounded-xl text-lg shadow hover:scale-105 hover:bg-gray-600 transition-all text-center">Decline</button>
        </div>
      </div>
    </motion.div>
  );
}; 