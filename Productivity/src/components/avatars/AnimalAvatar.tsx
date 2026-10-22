import React from 'react';

export type AnimalType =
  | 'lion'
  | 'tiger'
  | 'wolf'
  | 'cheetah'
  | 'dolphin'
  | 'fox'
  | 'dog'
  | 'owl'
  | 'rabbit'
  | 'koala';

export interface AnimalInfo {
  id: AnimalType;
  name: string;
  tagline: string;
  themeColor: string;
  bgColor: string;
}

export const ANIMAL_AVATARS: AnimalInfo[] = [
  { id: 'lion', name: 'Lion', tagline: 'Courage & Leadership', themeColor: '#D97706', bgColor: '#FEF3C7' },
  { id: 'tiger', name: 'Tiger', tagline: 'Focus & Determination', themeColor: '#EA580C', bgColor: '#FFEDD5' },
  { id: 'wolf', name: 'Wolf', tagline: 'Loyalty & Strategy', themeColor: '#475569', bgColor: '#F1F5F9' },
  { id: 'cheetah', name: 'Cheetah', tagline: 'Speed & Agility', themeColor: '#CA8A04', bgColor: '#FEF9C3' },
  { id: 'dolphin', name: 'Dolphin', tagline: 'Intelligence & Harmony', themeColor: '#0284C7', bgColor: '#E0F2FE' },
  { id: 'fox', name: 'Fox', tagline: 'Cleverness & Vision', themeColor: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'dog', name: 'Dog', tagline: 'Reliability & Energy', themeColor: '#B45309', bgColor: '#FDE68A' },
  { id: 'owl', name: 'Owl', tagline: 'Wisdom & Precision', themeColor: '#854D0E', bgColor: '#FEF08A' },
  { id: 'rabbit', name: 'Rabbit', tagline: 'Nimbleness & Curiosity', themeColor: '#9333EA', bgColor: '#F3E8FF' },
  { id: 'koala', name: 'Koala', tagline: 'Patience & Calm', themeColor: '#4B5563', bgColor: '#E5E7EB' },
];

export function isAnimalType(val: string | null | undefined): val is AnimalType {
  if (!val) return false;
  const clean = val.toLowerCase().replace('animal:', '').trim();
  return ANIMAL_AVATARS.some((a) => a.id === clean);
}

export function parseAnimalId(avatarString: string | null | undefined): AnimalType | null {
  if (!avatarString) return null;
  const clean = avatarString.toLowerCase().replace('animal:', '').trim();
  const match = ANIMAL_AVATARS.find((a) => a.id === clean);
  return match ? match.id : null;
}

interface AnimalSvgProps {
  id: AnimalType;
  className?: string;
}

export const AnimalSvg: React.FC<AnimalSvgProps> = ({ id, className = 'w-full h-full' }) => {
  switch (id) {
    case 'lion':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Mane */}
          <circle cx="50" cy="50" r="44" fill="#C2410C" />
          <path d="M50 4C35 4 20 18 16 32C10 48 14 68 28 82C40 94 60 94 72 82C86 68 90 48 84 32C80 18 65 4 50 4Z" fill="#B45309" />
          {/* Ears */}
          <circle cx="28" cy="28" r="10" fill="#F59E0B" />
          <circle cx="28" cy="28" r="6" fill="#FDE68A" />
          <circle cx="72" cy="28" r="10" fill="#F59E0B" />
          <circle cx="72" cy="28" r="6" fill="#FDE68A" />
          {/* Face base */}
          <ellipse cx="50" cy="55" rx="30" ry="27" fill="#FBBF24" />
          {/* Cheeks */}
          <circle cx="34" cy="62" r="8" fill="#FDE68A" />
          <circle cx="66" cy="62" r="8" fill="#FDE68A" />
          {/* Snout */}
          <ellipse cx="50" cy="64" rx="14" ry="10" fill="#FEF3C7" />
          {/* Nose */}
          <path d="M46 59H54L50 65L46 59Z" fill="#1C1917" />
          <path d="M50 65V69" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
          <path d="M44 69C47 71 50 70 50 69C50 70 53 71 56 69" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="37" cy="48" r="4.5" fill="#1C1917" />
          <circle cx="63" cy="48" r="4.5" fill="#1C1917" />
          <circle cx="38.5" cy="46.5" r="1.5" fill="#FFFFFF" />
          <circle cx="64.5" cy="46.5" r="1.5" fill="#FFFFFF" />
          {/* Eyebrows */}
          <path d="M32 42C35 40 40 41 42 43" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <path d="M68 42C65 40 60 41 58 43" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'tiger':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Ears */}
          <circle cx="24" cy="24" r="12" fill="#EA580C" />
          <circle cx="24" cy="24" r="7" fill="#1F2937" />
          <circle cx="24" cy="24" r="4" fill="#FFFFFF" />
          <circle cx="76" cy="24" r="12" fill="#EA580C" />
          <circle cx="76" cy="24" r="7" fill="#1F2937" />
          <circle cx="76" cy="24" r="4" fill="#FFFFFF" />
          {/* Head */}
          <ellipse cx="50" cy="52" rx="36" ry="32" fill="#F97316" />
          {/* White cheek patches */}
          <path d="M16 52C16 66 28 78 40 76C32 70 28 60 28 50C20 48 16 50 16 52Z" fill="#FFFFFF" />
          <path d="M84 52C84 66 72 78 60 76C68 70 72 60 72 50C80 48 84 50 84 52Z" fill="#FFFFFF" />
          {/* Tiger Stripes */}
          <path d="M50 24L52 34H48L50 24Z" fill="#1F2937" />
          <path d="M42 27L46 33H40L42 27Z" fill="#1F2937" />
          <path d="M58 27L54 33H60L58 27Z" fill="#1F2937" />
          <path d="M22 42L32 44L24 48L22 42Z" fill="#1F2937" />
          <path d="M78 42L68 44L76 48L78 42Z" fill="#1F2937" />
          {/* Snout */}
          <ellipse cx="50" cy="62" rx="14" ry="11" fill="#FFFFFF" />
          <path d="M45 57H55L50 63L45 57Z" fill="#EA580C" />
          <path d="M50 63V67" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          <path d="M44 67C47 69 50 68 50 67C50 68 53 69 56 67" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="36" cy="46" r="5" fill="#1F2937" />
          <circle cx="64" cy="46" r="5" fill="#1F2937" />
          <circle cx="37.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <circle cx="65.5" cy="44.5" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 'wolf':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Pointed Ears */}
          <polygon points="20,44 14,14 42,26" fill="#334155" />
          <polygon points="22,38 18,20 36,28" fill="#F87171" opacity="0.6" />
          <polygon points="80,44 86,14 58,26" fill="#334155" />
          <polygon points="78,38 82,20 64,28" fill="#F87171" opacity="0.6" />
          {/* Head Base */}
          <polygon points="50,22 80,44 76,74 50,86 24,74 20,44" fill="#64748B" />
          {/* Cheek tufts */}
          <polygon points="20,44 10,54 22,64" fill="#475569" />
          <polygon points="80,44 90,54 78,64" fill="#475569" />
          {/* White muzzle & brows */}
          <polygon points="50,42 66,54 62,78 50,84 38,78 34,54" fill="#F1F5F9" />
          {/* Forehead marking */}
          <polygon points="50,26 44,48 50,54 56,48" fill="#334155" />
          {/* Eyes */}
          <polygon points="32,48 40,44 42,50 34,52" fill="#F59E0B" />
          <circle cx="37" cy="48" r="2" fill="#0F172A" />
          <polygon points="68,48 60,44 58,50 66,52" fill="#F59E0B" />
          <circle cx="63" cy="48" r="2" fill="#0F172A" />
          {/* Nose */}
          <polygon points="46,68 54,68 50,74" fill="#0F172A" />
          <path d="M50 74V77" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
          <path d="M46 77C48 78 50 77 50 77C50 77 52 78 54 77" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'cheetah':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Ears */}
          <circle cx="26" cy="24" r="10" fill="#EAB308" />
          <circle cx="26" cy="24" r="6" fill="#1C1917" />
          <circle cx="74" cy="24" r="10" fill="#EAB308" />
          <circle cx="74" cy="24" r="6" fill="#1C1917" />
          {/* Head */}
          <ellipse cx="50" cy="52" rx="34" ry="30" fill="#FACC15" />
          {/* Tear Marks (Cheetah signature) */}
          <path d="M38 50Q36 60 44 68" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M62 50Q64 60 56 68" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Spots */}
          <circle cx="32" cy="34" r="2.5" fill="#1C1917" />
          <circle cx="42" cy="30" r="2" fill="#1C1917" />
          <circle cx="58" cy="30" r="2" fill="#1C1917" />
          <circle cx="68" cy="34" r="2.5" fill="#1C1917" />
          <circle cx="24" cy="48" r="2" fill="#1C1917" />
          <circle cx="76" cy="48" r="2" fill="#1C1917" />
          <circle cx="28" cy="62" r="2" fill="#1C1917" />
          <circle cx="72" cy="62" r="2" fill="#1C1917" />
          {/* Snout */}
          <ellipse cx="50" cy="66" rx="12" ry="9" fill="#FEF08A" />
          <path d="M46 62H54L50 67L46 62Z" fill="#1C1917" />
          <path d="M50 67V70" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
          <path d="M45 70C48 72 50 71 50 70C50 71 52 72 55 70" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="37" cy="47" r="4.5" fill="#92400E" />
          <circle cx="37" cy="47" r="2.5" fill="#1C1917" />
          <circle cx="38" cy="45.5" r="1" fill="#FFFFFF" />
          <circle cx="63" cy="47" r="4.5" fill="#92400E" />
          <circle cx="63" cy="47" r="2.5" fill="#1C1917" />
          <circle cx="64" cy="45.5" r="1" fill="#FFFFFF" />
        </svg>
      );

    case 'dolphin':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Dorsal Crest */}
          <path d="M46 8C48 18 56 22 56 22C48 22 44 14 46 8Z" fill="#0284C7" />
          {/* Head & Body */}
          <ellipse cx="50" cy="52" rx="36" ry="34" fill="#38BDF8" />
          {/* Cheerful Beak / Rostrum */}
          <path d="M40 64C40 78 60 78 60 64H40Z" fill="#0284C7" />
          <path d="M42 66C42 76 58 76 58 66H42Z" fill="#BAE6FD" />
          {/* White Belly */}
          <ellipse cx="50" cy="68" rx="22" ry="14" fill="#F0F9FF" />
          {/* Smile line */}
          <path d="M43 70C47 73 53 73 57 70" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" />
          {/* Eyes with cheerful glint */}
          <ellipse cx="33" cy="48" rx="5" ry="6" fill="#0C4A6E" />
          <circle cx="34.5" cy="46" r="2" fill="#FFFFFF" />
          <ellipse cx="67" cy="48" rx="5" ry="6" fill="#0C4A6E" />
          <circle cx="68.5" cy="46" r="2" fill="#FFFFFF" />
          {/* Blush */}
          <circle cx="28" cy="56" r="4" fill="#FDA4AF" opacity="0.6" />
          <circle cx="72" cy="56" r="4" fill="#FDA4AF" opacity="0.6" />
          {/* Blowhole cue */}
          <ellipse cx="50" cy="22" rx="3" ry="1.5" fill="#0284C7" />
        </svg>
      );

    case 'fox':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Large Pointed Ears */}
          <polygon points="16,42 12,10 40,24" fill="#EA580C" />
          <polygon points="18,36 15,16 35,26" fill="#FEF3C7" />
          <polygon points="12,10 18,14 15,22 12,10" fill="#1C1917" />
          <polygon points="84,42 88,10 60,24" fill="#EA580C" />
          <polygon points="82,36 85,16 65,26" fill="#FEF3C7" />
          <polygon points="88,10 82,14 85,22 88,10" fill="#1C1917" />
          {/* Head */}
          <polygon points="50,22 84,44 80,68 50,86 20,68 16,44" fill="#F97316" />
          {/* White Cheeks / Muzzle */}
          <polygon points="50,56 80,68 66,80 50,86 34,80 20,68" fill="#FFFFFF" />
          {/* Black Nose */}
          <circle cx="50" cy="80" r="4" fill="#1C1917" />
          {/* Cunning Fox Eyes */}
          <path d="M30 48Q38 46 42 52" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="36" cy="50" r="2.5" fill="#1C1917" />
          <path d="M70 48Q62 46 58 52" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="64" cy="50" r="2.5" fill="#1C1917" />
        </svg>
      );

    case 'dog':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Floppy Ears */}
          <ellipse cx="20" cy="46" rx="10" ry="20" fill="#92400E" transform="rotate(-15 20 46)" />
          <ellipse cx="80" cy="46" rx="10" ry="20" fill="#92400E" transform="rotate(15 80 46)" />
          {/* Head */}
          <ellipse cx="50" cy="50" rx="32" ry="30" fill="#F59E0B" />
          {/* Snout */}
          <ellipse cx="50" cy="62" rx="16" ry="12" fill="#FEF3C7" />
          {/* Nose */}
          <ellipse cx="50" cy="56" rx="6" ry="4" fill="#1C1917" />
          <path d="M50 60V64" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
          {/* Happy tongue */}
          <path d="M47 64C47 70 53 70 53 64" fill="#F43F5E" />
          <path d="M44 64C47 66 50 64 50 64C50 64 53 66 56 64" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
          {/* Big friendly dog eyes */}
          <circle cx="36" cy="44" r="5" fill="#1C1917" />
          <circle cx="37.5" cy="42.5" r="1.8" fill="#FFFFFF" />
          <circle cx="64" cy="44" r="5" fill="#1C1917" />
          <circle cx="65.5" cy="42.5" r="1.8" fill="#FFFFFF" />
          {/* Eyebrows */}
          <circle cx="36" cy="36" r="2" fill="#D97706" />
          <circle cx="64" cy="36" r="2" fill="#D97706" />
        </svg>
      );

    case 'owl':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Ear Tufts */}
          <polygon points="26,34 20,12 40,24" fill="#78350F" />
          <polygon points="74,34 80,12 60,24" fill="#78350F" />
          {/* Head */}
          <circle cx="50" cy="54" r="34" fill="#92400E" />
          {/* Face Disc */}
          <ellipse cx="37" cy="52" rx="14" ry="16" fill="#FEF3C7" />
          <ellipse cx="63" cy="52" rx="14" ry="16" fill="#FEF3C7" />
          {/* Eye Rings & Eyes */}
          <circle cx="37" cy="52" r="10" fill="#FBBF24" />
          <circle cx="37" cy="52" r="6" fill="#1C1917" />
          <circle cx="39" cy="50" r="2" fill="#FFFFFF" />
          <circle cx="63" cy="52" r="10" fill="#FBBF24" />
          <circle cx="63" cy="52" r="6" fill="#1C1917" />
          <circle cx="65" cy="50" r="2" fill="#FFFFFF" />
          {/* Beak */}
          <polygon points="46,54 54,54 50,64" fill="#EA580C" />
          {/* Breast Feathers */}
          <path d="M42 72C45 74 48 72 48 72" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <path d="M52 72C55 74 58 72 58 72" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <path d="M47 78C50 80 53 78 53 78" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'rabbit':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Long Ears */}
          <ellipse cx="36" cy="22" rx="8" ry="20" fill="#CBD5E1" transform="rotate(-6 36 22)" />
          <ellipse cx="36" cy="22" rx="4.5" ry="15" fill="#F472B6" opacity="0.75" transform="rotate(-6 36 22)" />
          <ellipse cx="64" cy="22" rx="8" ry="20" fill="#CBD5E1" transform="rotate(6 64 22)" />
          <ellipse cx="64" cy="22" rx="4.5" ry="15" fill="#F472B6" opacity="0.75" transform="rotate(6 64 22)" />
          {/* Head */}
          <ellipse cx="50" cy="58" rx="28" ry="26" fill="#E2E8F0" />
          {/* Cheeks */}
          <circle cx="36" cy="66" r="6" fill="#F8FAFC" />
          <circle cx="64" cy="66" r="6" fill="#F8FAFC" />
          {/* Pink Nose */}
          <polygon points="46,62 54,62 50,66" fill="#F472B6" />
          <path d="M50 66V70" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          {/* Buck teeth */}
          <rect x="47.5" y="70" width="2.5" height="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.5" />
          <rect x="50" y="70" width="2.5" height="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.5" />
          {/* Eyes */}
          <circle cx="36" cy="52" r="4.5" fill="#1E293B" />
          <circle cx="37.5" cy="50.5" r="1.5" fill="#FFFFFF" />
          <circle cx="64" cy="52" r="4.5" fill="#1E293B" />
          <circle cx="65.5" cy="50.5" r="1.5" fill="#FFFFFF" />
          {/* Whiskers */}
          <line x1="22" y1="62" x2="12" y2="60" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="66" x2="12" y2="67" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="78" y1="62" x2="88" y2="60" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="78" y1="66" x2="88" y2="67" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'koala':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Big Fluffy Ears */}
          <circle cx="20" cy="32" r="16" fill="#64748B" />
          <circle cx="20" cy="32" r="11" fill="#E2E8F0" />
          <path d="M12 28Q16 32 14 38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <circle cx="80" cy="32" r="16" fill="#64748B" />
          <circle cx="80" cy="32" r="11" fill="#E2E8F0" />
          <path d="M88 28Q84 32 86 38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          {/* Head */}
          <ellipse cx="50" cy="54" rx="32" ry="28" fill="#94A3B8" />
          {/* White Chest / Chin */}
          <ellipse cx="50" cy="72" rx="14" ry="8" fill="#F1F5F9" />
          {/* Big Iconic Koala Nose */}
          <ellipse cx="50" cy="54" rx="10" ry="14" fill="#1E293B" />
          <ellipse cx="50" cy="48" rx="4" ry="2" fill="#475569" />
          {/* Sweet Sleepy Eyes */}
          <circle cx="33" cy="48" r="3.5" fill="#0F172A" />
          <circle cx="34" cy="47" r="1" fill="#FFFFFF" />
          <circle cx="67" cy="48" r="3.5" fill="#0F172A" />
          <circle cx="68" cy="47" r="1" fill="#FFFFFF" />
          {/* Gentle mouth */}
          <path d="M46 70C48 72 52 72 54 70" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="50" cy="50" r="45" fill="#1E3A2F" />
          <text x="50" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="bold">
            M
          </text>
        </svg>
      );
  }
};

interface AnimalAvatarProps {
  avatar?: string | null;
  name?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  status?: 'online' | 'busy' | 'away' | 'offline';
}

const SIZE_MAP: Record<string, number> = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 72,
};

export const AnimalAvatar: React.FC<AnimalAvatarProps> = ({
  avatar,
  name = 'Member',
  size = 'md',
  className = '',
  showBadge = false,
  status,
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 36;
  const animalId = parseAnimalId(avatar);
  const animalInfo = animalId ? ANIMAL_AVATARS.find((a) => a.id === animalId) : null;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none shadow-2xs overflow-visible ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        backgroundColor: animalInfo ? animalInfo.bgColor : '#F2EFE9',
      }}
      title={`${name}${animalInfo ? ` (${animalInfo.name})` : ''}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center p-0.5">
        {animalId ? (
          <AnimalSvg id={animalId} className="w-full h-full object-contain" />
        ) : avatar && (avatar.startsWith('http') || avatar.startsWith('data:')) ? (
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback to initial if broken
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span
            className="font-bold text-[#1E3A2F] uppercase"
            style={{ fontSize: Math.max(10, Math.floor(pixelSize * 0.42)) }}
          >
            {name.charAt(0) || 'M'}
          </span>
        )}
      </div>

      {/* Online / Active status badge */}
      {(showBadge || status) && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ring-1 ring-black/5 ${
            status === 'offline'
              ? 'bg-stone-300'
              : status === 'busy'
              ? 'bg-rose-500'
              : status === 'away'
              ? 'bg-amber-400'
              : 'bg-emerald-500'
          }`}
          style={{
            width: Math.max(8, Math.round(pixelSize * 0.28)),
            height: Math.max(8, Math.round(pixelSize * 0.28)),
          }}
        />
      )}
    </div>
  );
};

interface AvatarPickerProps {
  selected: AnimalType;
  onSelect: (animal: AnimalType) => void;
  className?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ selected, onSelect, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-5 gap-3">
        {ANIMAL_AVATARS.map((animal) => {
          const isSelected = selected === animal.id;
          return (
            <button
              key={animal.id}
              type="button"
              onClick={() => onSelect(animal.id)}
              className={`group flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#1E3A2F] bg-[#E7F0E8] shadow-sm scale-105'
                  : 'border-[#E8E4DA] bg-white hover:border-[#1E3A2F]/40 hover:bg-[#FAF8F5]'
              }`}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center p-1 transition-transform group-hover:scale-108"
                style={{ backgroundColor: animal.bgColor }}
              >
                <AnimalSvg id={animal.id} className="w-full h-full" />
              </div>
              <span
                className={`text-[11px] font-semibold truncate ${
                  isSelected ? 'text-[#1E3A2F]' : 'text-[#5C6560]'
                }`}
              >
                {animal.name}
              </span>
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-xs text-center text-[#737C76] italic">
          {ANIMAL_AVATARS.find((a) => a.id === selected)?.tagline}
        </p>
      )}
    </div>
  );
};
