import React from 'react';
import { FaSkull, FaCamera, FaBriefcase } from 'react-icons/fa';
import { UnifiedChallenge } from '@/lib/services/challengeService';

interface Challenge {
  id: number;
  title: string;
  time: string;
  distance: string;
  type: 'skull' | 'camera' | 'briefcase';
  payout: '$' | '$$' | '$$$';
  image?: string;
  description?: string;
}

interface KelsokoChallengeCardProps {
  challenge: Challenge | UnifiedChallenge;
  onClick: () => void;
  compact?: boolean;
  flush?: boolean;
}

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

// Helper function to get theme-aware border color
const getBorderColor = (type: 'skull' | 'camera' | 'briefcase') => {
  switch (type) {
    case 'skull': return 'border-red-600'; // Keep red for danger/skull theme
    case 'camera': return 'border-blue-500'; // Keep blue for info/camera theme
    case 'briefcase': return 'border-yellow-500'; // Keep yellow for warning/briefcase theme
    default: return 'border-gray-500';
  }
};

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

export const KelsokoChallengeCard: React.FC<KelsokoChallengeCardProps> = ({ challenge, onClick, compact = false, flush = false }) => {
  const normalized = toChallenge(challenge);
  return (
    <div
      className={
        compact && flush
          ? `relative bg-[#23232a]/70 backdrop-blur-md rounded-xl cursor-pointer px-4 py-3 min-h-[48px] flex flex-col justify-center transition hover:scale-[1.03] hover:shadow-xl hover:bg-[#23232a]/90 border-l-4 ${getBorderColor(normalized.type)}`
          : `relative flex items-center bg-[#23232a]/70 backdrop-blur-md rounded-2xl cursor-pointer border-l-8 ${getBorderColor(normalized.type)} hover:scale-[1.03] hover:shadow-2xl hover:bg-[#23232a]/90 transition group px-4 py-3 min-h-[72px] shadow-lg`
      }
      onClick={onClick}
      style={{
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
        overflow: 'hidden',
        position: 'relative',
        ...(normalized.image ? { backgroundImage: `url(${normalized.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.85) blur(0.5px)' } : {})
      }}
    >
      {/* Faded image overlay for glassmorphism */}
      {normalized.image && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(24,24,27,0.7)',
          zIndex: 0,
          pointerEvents: 'none',
          backdropFilter: 'blur(2px)'
        }} />
      )}
      {/* Card Content */}
      <div className="flex items-center relative z-10">
        <div className="flex flex-col items-center justify-center mr-4">
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border-2 border-white/30 shadow-lg text-2xl" style={{ boxShadow: '0 2px 12px 2px rgba(239,68,68,0.15)' }}>
            {iconMap[normalized.type as keyof typeof iconMap]}
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-lg leading-tight truncate max-w-[180px] drop-shadow-md">
              {normalized.title}
            </h3>
            <span className={`ml-3 px-3 py-1 rounded-full text-sm font-mono text-white shadow-md ${payoutColor[normalized.payout]} border-2 border-white/30`} style={{ letterSpacing: 1 }}>{normalized.payout}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-gray-300 text-sm font-medium">
            <span>{normalized.time}</span>
            <span>• {normalized.distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export type { Challenge }; 