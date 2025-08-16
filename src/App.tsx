import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Plus, ChevronLeft, TrendingUp, Users, Download, Camera } from "lucide-react";
import { Player } from './dats/players';
import { EnhancedBreakingPointRatingSystem } from './utils/ratingSystem';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';

// Defines the structure for a Team object
interface Team {
  id: string;
  name: string;
  logo: string;
  brandColor: string;
  rating: number;
  players: (Player | null)[];
  stats: {
    hp_k10m: number;
    hp_dmg10m: number;
    hp_obj10m: number;
    snd_kpr: number;
    first_bloods: number;
    plants_defuses_per_snd_map: number;
    ctl_k10m: number;
    ctl_dmg10m: number;
    zone_captures_per_ctl_map: number;
  };
}

// CDL Team configurations
const CDL_TEAMS = [
  { id: 'heretics', name: 'MIAMI HERETICS', brandColor: '#ea580c', logo: '/team-logos/heretics.png' },
  { id: 'optic', name: 'OPTIC TEXAS', brandColor: '#16a34a', logo: '/team-logos/optic.png' },
  { id: 'thieves', name: 'LA THIEVES', brandColor: '#e11d48', logo: '/team-logos/thieves.png' },
  { id: 'faze', name: 'ATLANTA FAZE', brandColor: '#dc2626', logo: '/team-logos/faze.png' },
  { id: 'koi', name: 'TORONTO KOI', brandColor: '#7c3aed', logo: '/team-logos/koi.png' },
  { id: 'falcons', name: 'VEGAS FALCONS', brandColor: '#059669', logo: '/team-logos/falcons.png' },
  { id: 'surge', name: 'VANCOUVER SURGE', brandColor: '#0891b2', logo: '/team-logos/surge.png' },
  { id: 'breach', name: 'BOSTON BREACH', brandColor: '#2563eb', logo: '/team-logos/breach.png' },
  { id: 'ravens', name: 'CAROLINA ROYAL RAVENS', brandColor: '#2563eb', logo: '/team-logos/ravens.png' },
  { id: 'g2', name: 'MINNESOTA ROKKR', brandColor: '#f97316', logo: '/team-logos/g2.png' },
  { id: 'cloud9', name: 'CLOUD9 NY', brandColor: '#3b82f6', logo: '/team-logos/cloud9.png' },
  { id: 'gentlemates', name: 'LA GENTLE M8', brandColor: '#9333ea', logo: '/team-logos/gentlem8.png' }
];

// Header Component - Cool gaming-inspired design
const Header = ({ onShowFreeAgents, onExportRosters, onShowRankings }: {
  onShowFreeAgents: () => void;
  onExportRosters: () => void;
  onShowRankings: () => void;
}) => {
  const [isLogoZoomed, setIsLogoZoomed] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-purple-500/30 sticky top-0 z-[60] relative overflow-hidden backdrop-blur-sm">
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-orange-500/10 to-purple-600/10 animate-pulse"></div>
        
        {/* Flowing particles animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-ping" style={{ top: '20%', left: '10%', animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-60 animate-ping" style={{ top: '60%', left: '25%', animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60 animate-ping" style={{ top: '40%', right: '15%', animationDelay: '2s', animationDuration: '3.5s' }}></div>
          <div className="absolute w-1 h-1 bg-green-400 rounded-full opacity-60 animate-ping" style={{ top: '70%', right: '30%', animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
        </div>
        
        {/* Neon scanning line */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-80">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-300 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 w-32 h-full bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-75" 
               style={{
                 animation: 'scanline 4s linear infinite',
               }}></div>
        </div>
        
        {/* Hexagon pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 15l15 8.66v17.32L30 50 15 41.34V23.66L30 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* CSS Animation Keyframes */}
        <style>{`
          @keyframes scanline {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(calc(100vw + 128px)); }
          }
          
          @keyframes glow {
            0%, 100% { text-shadow: 0 0 5px rgba(147, 51, 234, 0.5), 0 0 10px rgba(147, 51, 234, 0.3); }
            50% { text-shadow: 0 0 10px rgba(147, 51, 234, 0.8), 0 0 20px rgba(147, 51, 234, 0.5), 0 0 30px rgba(147, 51, 234, 0.3); }
          }
          
          @keyframes logoSpin {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(90deg) scale(1.1); }
            50% { transform: rotate(180deg) scale(1); }
            75% { transform: rotate(270deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
          
          .logo-glow:hover {
            animation: logoSpin 2s ease-in-out;
          }
          
          .logo-zoom {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: zoom-in;
          }
          
          .logo-zoom:hover {
            transform: scale(1.1);
          }
          
          .logo-zoom:active {
            transform: scale(0.95);
          }
          
          .text-glow {
            animation: glow 3s ease-in-out infinite;
          }
          
          .nav-button {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .nav-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s;
          }
          
          .nav-button:hover::before {
            left: 100%;
          }
          
          .nav-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
          }
          
          .export-button {
            background: linear-gradient(45deg, #9333ea, #ea580c);
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
            position: relative;
            overflow: hidden;
          }
          
          .export-button::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: translateX(-100%) skewX(-15deg);
            transition: transform 0.6s;
          }
          
          .export-button:hover::after {
            transform: translateX(100%) skewX(-15deg);
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes logoZoomIn {
            0% { transform: scale(0.5) rotate(-180deg); opacity: 0; }
            50% { transform: scale(1.1) rotate(0deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          
          @keyframes logoZoomOut {
            0% { transform: scale(1) rotate(0deg); opacity: 1; }
            100% { transform: scale(0.5) rotate(180deg); opacity: 0; }
          }
          
          .zoom-modal-enter {
            animation: logoZoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          
          .zoom-modal-exit {
            animation: logoZoomOut 0.3s ease-in;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-6 relative z-10">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Cool spinning logo with zoom feature */}
              <div className="relative logo-glow">
                <div 
                  className="logo-zoom w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 via-orange-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden"
                  onClick={() => setIsLogoZoomed(true)}
                  title="Click to zoom logo"
                >
                  {/* Replace this img src with your actual logo path */}
                  <img 
                    src="/your-logo.png" 
                    alt="CDL Roster Builder Logo" 
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                    onError={(e) => {
                      // Fallback to "R" if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  {/* Fallback "R" text (hidden by default) */}
                  <span className="text-white font-black text-sm sm:text-lg tracking-wider hidden">R</span>
                </div>
                {/* Rotating ring around logo */}
                <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 border-2 border-orange-400/50 rounded-lg animate-spin pointer-events-none" style={{ animationDuration: '8s' }}></div>
              </div>
              
              <div className="min-w-0 flex-1">
                {/* Main title with glow effect */}
                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-xl font-black text-white block truncate tracking-wide">
                    CDL<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">ROSTER</span>BUILDER
                  </span>
                  <span className="text-purple-400 text-sm sm:text-xl font-black text-glow">.COM</span>
                </div>
                
                {/* Subtitle with cool effect */}
                <a 
                  href="https://x.com/tr04r" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 text-xs hover:text-orange-400 transition-all duration-300 cursor-pointer underline hidden sm:inline-block transform hover:scale-105"
                >
                  <span className="opacity-60">crafted by</span> <span className="font-semibold">@TROAR</span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              {/* Rankings button */}
              <button 
                onClick={onShowRankings} 
                className="nav-button flex items-center gap-1 sm:gap-2 text-gray-300 hover:text-purple-400 transition-colors p-2 sm:p-2 rounded-lg border border-transparent hover:border-purple-500/30"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">Rankings</span>
              </button>
              
              {/* Free Agents button */}
              <button 
                onClick={onShowFreeAgents} 
                className="nav-button flex items-center gap-1 sm:gap-2 text-gray-300 hover:text-blue-400 transition-colors p-2 sm:p-2 rounded-lg border border-transparent hover:border-blue-500/30"
              >
                <Users className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">Free Agents</span>
              </button>
              
              {/* Export button with animated gradient */}
              <button 
                onClick={onExportRosters} 
                className="export-button flex items-center gap-1 sm:gap-2 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logo Zoom Modal */}
      {isLogoZoomed && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setIsLogoZoomed(false)}
        >
          <div className="relative zoom-modal-enter">
            {/* Zoomed logo container */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-purple-500 via-orange-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden relative">
              {/* Animated rings around zoomed logo */}
              <div className="absolute inset-0 border-4 border-orange-400/30 rounded-3xl animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-4 border-2 border-purple-400/50 rounded-2xl animate-spin" style={{ animationDuration: '8s' }}></div>
              <div className="absolute inset-8 border-2 border-orange-300/40 rounded-xl animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
              
              {/* Large logo */}
              <img 
                src="/your-logo.png" 
                alt="CDL Roster Builder Logo - Zoomed" 
                className="w-48 h-48 sm:w-60 sm:h-60 object-contain z-10"
                onError={(e) => {
                  // Fallback to large "R" if image fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback large "R" text */}
              <div className="hidden w-48 h-48 sm:w-60 sm:h-60 items-center justify-center z-10">
                <span className="text-white font-black text-8xl sm:text-9xl tracking-wider">R</span>
              </div>
              
              {/* Glow effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 to-transparent rounded-3xl"></div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setIsLogoZoomed(false)}
              className="absolute -top-4 -right-4 w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-lg border-2 border-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Click anywhere to close hint */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
              Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Rankings Modal
const RankingsModal = ({ 
  isOpen, 
  onClose, 
  teams,
  onRankingChange
}: {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onRankingChange: (teamId: string, newRank: number) => void;
}) => {
  const [editableRankings, setEditableRankings] = useState<{ [teamId: string]: number }>({});
  const [sortedTeams, setSortedTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Sort teams by rating initially
      const sorted = [...teams].sort((a, b) => b.rating - a.rating);
      setSortedTeams(sorted);
      
      // Initialize editable rankings
      const rankings: { [teamId: string]: number } = {};
      sorted.forEach((team, index) => {
        rankings[team.id] = index + 1;
      });
      setEditableRankings(rankings);
    }
  }, [isOpen, teams]);

  const handleRankingChange = (teamId: string, newRank: number) => {
    if (newRank < 1 || newRank > teams.length) return;
    
    const newRankings = { ...editableRankings };
    const oldRank = newRankings[teamId];
    
    // Shift other teams' rankings
    Object.keys(newRankings).forEach(id => {
      if (id === teamId) {
        newRankings[id] = newRank;
      } else {
        const currentRank = newRankings[id];
        if (newRank > oldRank) {
          // Moving down - shift teams up
          if (currentRank > oldRank && currentRank <= newRank) {
            newRankings[id] = currentRank - 1;
          }
        } else {
          // Moving up - shift teams down
          if (currentRank >= newRank && currentRank < oldRank) {
            newRankings[id] = currentRank + 1;
          }
        }
      }
    });
    
    setEditableRankings(newRankings);
    
    // Update sorted teams based on new rankings
    const newSorted = [...teams].sort((a, b) => {
      return newRankings[a.id] - newRankings[b.id];
    });
    setSortedTeams(newSorted);
  };

  const handleSave = () => {
    // Apply the ranking changes
    Object.keys(editableRankings).forEach(teamId => {
      onRankingChange(teamId, editableRankings[teamId]);
    });
    onClose();
  };

  const handleReset = () => {
    // Reset to rating-based rankings
    const sorted = [...teams].sort((a, b) => b.rating - a.rating);
    setSortedTeams(sorted);
    
    const rankings: { [teamId: string]: number } = {};
    sorted.forEach((team, index) => {
      rankings[team.id] = index + 1;
    });
    setEditableRankings(rankings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              Team Rankings
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Reset to Rating Order
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Save Rankings
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)] sm:max-h-[60vh]">
          <div className="space-y-3">
            {sortedTeams.map((team) => (
              <div
                key={team.id}
                className="bg-gray-700 border border-gray-600 rounded-lg p-3 sm:p-4 hover:bg-gray-650 transition-all duration-200"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Ranking Input */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">#</span>
                    <input
                      type="number"
                      min="1"
                      max={teams.length}
                      value={editableRankings[team.id] || 1}
                      onChange={(e) => handleRankingChange(team.id, parseInt(e.target.value) || 1)}
                      className="w-12 sm:w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Team Logo */}
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg bg-black bg-cover bg-center flex-shrink-0"
                    style={{ 
                      backgroundImage: team.logo ? `url(${team.logo})` : 'none'
                    }}
                  >
                    {!team.logo && team.name.charAt(0)}
                  </div>
                  
                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm sm:text-lg truncate">{team.name}</h3>
                    <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm">
                      <span className="text-gray-400">
                        {team.players.filter(p => p !== null).length}/4 Players
                      </span>
                      <span className="text-purple-400 font-medium">
                        Rating: {team.rating > 0 ? Math.round(team.rating) : '--'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Player Preview */}
                  <div className="flex gap-1">
                    {team.players.slice(0, 4).map((player, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium relative overflow-hidden"
                      >
                        {player ? (
                          <>
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-600 rounded-full z-10" id={`fallback-${player.id}-ranking-${index}`}>
                              <span className="text-gray-300">{player.player_name.charAt(0)}</span>
                            </div>
                            <img
                              src={player.avatar || `/player-images/${player.player_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                              alt={player.player_name}
                              className="absolute inset-0 w-full h-full object-cover rounded-full z-30"
                              onLoad={(_e) => {
                                const fallback = document.getElementById(`fallback-${player.id}-ranking-${index}`);
                                if (fallback) fallback.style.display = 'none';
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </>
                        ) : (
                          <span className="text-gray-500">?</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const FreeAgentsModal = ({ 
  isOpen, 
  onClose, 
  freeAgents,
  playerRatings
}: {
  isOpen: boolean;
  onClose: () => void;
  freeAgents: Player[];
  playerRatings: Map<string, number>;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'AR' | 'SMG' | ''>('');
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');

  // Clear search when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setRoleFilter('');
      setSortBy('rating');
    }
  }, [isOpen]);

  const filteredPlayers = useMemo(() => {
    let filtered = freeAgents.filter(player => {
      const matchesSearch = player.player_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || player.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        const aRating = playerRatings.get(a.id) || a.slayer_rating;
        const bRating = playerRatings.get(b.id) || b.slayer_rating;
        return bRating - aRating;
      } else {
        return a.player_name.localeCompare(b.player_name);
      }
    });

    return filtered;
  }, [freeAgents, searchTerm, roleFilter, sortBy, playerRatings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              Free Agents ({filteredPlayers.length})
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'AR' | 'SMG' | '')}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Roles</option>
              <option value="AR">AR</option>
              <option value="SMG">SMG</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'name')}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="rating">By Rating</option>
              <option value="name">By Name</option>
            </select>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)] sm:max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-650 hover:border-orange-500 transition-all duration-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-cover bg-center flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-600 rounded-full z-10" id={`fallback-${player.id}-free`}>
                      <span className="text-lg font-medium text-gray-300">{player.player_name.charAt(0)}</span>
                    </div>
                    <img
                      src={player.avatar || `/player-images/${player.player_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                      alt={player.player_name}
                      className="absolute inset-0 w-full h-full object-cover rounded-full z-30"
                      onLoad={(_e) => {
                        const fallback = document.getElementById(`fallback-${player.id}-free`);
                        if (fallback) fallback.style.display = 'none';
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{player.player_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-purple-400 font-bold text-lg">
                        {Math.round(playerRatings.get(player.id) || player.slayer_rating)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-blue-400 font-medium">{player.hp_k10m?.toFixed(1) || '--'}</div>
                    <div className="text-gray-500">HP K/10M</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-medium">{player.hp_dmg10m ? Math.round(player.hp_dmg10m) : '--'}</div>
                    <div className="text-gray-500">HP DMG</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-medium">{player.hp_obj10m?.toFixed(1) || '--'}</div>
                    <div className="text-gray-500">HP OBJ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-medium">{player.snd_kpr?.toFixed(2) || '--'}</div>
                    <div className="text-gray-500">SND KPR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-medium">{player.first_bloods ? Math.round(player.first_bloods) : '--'}</div>
                    <div className="text-gray-500">FB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-indigo-400 font-medium">
                      {(() => {
                        const sndMaps = (player as any).snd_maps || ((player as any).total_maps ? Math.round(((player as any).total_maps * 0.33)) : 10);
                        const plantsDefusesPerMap = sndMaps > 0 ? (player.plants_defuses_combined || 0) / sndMaps : 0;
                        return plantsDefusesPerMap.toFixed(1);
                      })()}
                    </div>
                    <div className="text-gray-500">P+D/SND</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 font-medium">{player.ctl_k10m?.toFixed(1) || '--'}</div>
                    <div className="text-gray-500">CTL K/10M</div>
                  </div>
                  <div className="text-center">
                    <div className="text-pink-400 font-medium">{player.ctl_dmg10m ? Math.round(player.ctl_dmg10m) : '--'}</div>
                    <div className="text-gray-500">CTL DMG</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-medium">
                      {(() => {
                        const ctlMaps = (player as any).ctl_maps || ((player as any).total_maps ? Math.round(((player as any).total_maps * 0.33)) : 10);
                        const zonesCapturesPerMap = ctlMaps > 0 ? (player.zone_captures || 0) / ctlMaps : 0;
                        return zonesCapturesPerMap.toFixed(1);
                      })()}
                    </div>
                    <div className="text-gray-500">Zones/CTL</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredPlayers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-xl">No free agents found</p>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Team Card Component - Mobile optimized
const TeamCard = ({ team, onPlayerSelect, onPlayerRemove, playerRatings, onExportTeam, statRankings }: {
  team: { id: string; name: string; logo: string; brandColor: string; rating: number; players: (Player | null)[]; stats: any };
  onPlayerSelect: (teamId: string, slotIndex: number) => void;
  onPlayerRemove: (teamId: string, slotIndex: number) => void;
  playerRatings: Map<string, number>;
  onExportTeam: (teamId: string) => void;
  statRankings: Map<string, Map<string, number>>;
}) => {
  
  const getRankColor = (statName: string, teamId: string) => {
    const ranking = statRankings.get(statName)?.get(teamId) || 12;
    if (ranking <= 4) return 'text-green-400';
    if (ranking <= 8) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div 
      id={`team-${team.id}`} 
      className="bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all duration-300 relative"
      style={{
        boxShadow: `0 0 20px ${team.brandColor}30, 0 0 40px ${team.brandColor}20, 0 0 60px ${team.brandColor}10`
      }}
    >
      <div 
        className="p-3 sm:p-4 border-b border-gray-800 relative"
        style={{ 
          background: `linear-gradient(135deg, ${team.brandColor}15 0%, ${team.brandColor}05 100%)`
        }}
      >
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div 
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg bg-black bg-cover bg-center flex-shrink-0"
              style={{ 
                backgroundImage: team.logo ? `url(${team.logo})` : 'none'
              }}
            >
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-lg text-white truncate">{team.name}</h3>
              <p className="text-xs text-gray-400">{team.players.filter(p => p !== null).length}/4 Players</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportTeam(team.id)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
              title="Export this roster"
            >
              <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-orange-500" />
            </button>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold" style={{ color: team.brandColor }}>
                {team.rating > 0 ? Math.round(team.rating) : '--'}
              </div>
              <div className="text-xs text-gray-400">RATING</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {/* Mobile responsive player grid - 2x2 on mobile, 1x4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {team.players.map((player, index) => {
            const playerRating = player ? playerRatings.get(player.id) || player.slayer_rating : 0;
            
            return (
              <div
                key={index}
                className="aspect-square bg-gray-900 border border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-gray-800 transition-all duration-200 group relative overflow-hidden"
                onClick={() => !player && onPlayerSelect(team.id, index)}
              >
                {player ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayerRemove(team.id, index);
                      }}
                      className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-40 hover:bg-red-600"
                    >
                      <X className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </button>
                    
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-600 z-10" id={`fallback-${player.id}-team-${index}`}>
                      <span className="text-2xl sm:text-4xl font-bold text-gray-300">{player.player_name.charAt(0)}</span>
                    </div>
                    
                    <img
                      src={player.avatar || `/player-images/${player.player_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                      alt={player.player_name}
                      className="absolute inset-0 w-full h-full object-cover z-30"
                      onLoad={(_e) => {
                        const fallback = document.getElementById(`fallback-${player.id}-team-${index}`);
                        if (fallback) fallback.style.display = 'none';
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    
                    <div className="absolute top-1 left-1 bg-purple-500 text-white px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded text-xs font-bold z-40">
                      {Math.round(playerRating)}
                    </div>
                    
                    {/* Player name at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 sm:p-2 z-50">
                      <div className="text-white text-xs font-medium text-center truncate">{player.player_name}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mb-1 group-hover:text-purple-500 transition-colors" />
                    <span className="text-gray-500 text-xs font-medium group-hover:text-purple-500 transition-colors">
                      TBD
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-800">
          <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Team Statistics
          </h4>
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
            <div className="text-center">
              <div className={`font-medium ${getRankColor('hp_k10m', team.id)}`}>{team.stats.hp_k10m.toFixed(1)}</div>
              <div className="text-gray-500 text-xs">HP K/10M</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${getRankColor('hp_dmg10m', team.id)}`}>{Math.round(team.stats.hp_dmg10m)}</div>
              <div className="text-gray-500 text-xs">HP DMG</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${getRankColor('hp_obj10m', team.id)}`}>{team.stats.hp_obj10m.toFixed(1)}</div>
              <div className="text-gray-500 text-xs">HP OBJ</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${getRankColor('snd_kpr', team.id)}`}>{team.stats.snd_kpr.toFixed(2)}</div>
              <div className="text-gray-500 text-xs">SND KPR</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${getRankColor('first_bloods', team.id)}`}>{Math.round(team.stats.first_bloods)}</div>
              <div className="text-gray-500 text-xs">FB</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${getRankColor('plants_defuses_per_snd_map', team.id)}`}>{team.stats.plants_defuses_per_snd_map.toFixed(1)}</div>
              <div className="text-gray-500 text-xs">P+D/SND</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${getRankColor('ctl_k10m', team.id)}`}>{team.stats.ctl_k10m.toFixed(1)}</div>
              <div className="text-gray-500 text-xs">CTL K/10M</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${getRankColor('ctl_dmg10m', team.id)}`}>{Math.round(team.stats.ctl_dmg10m)}</div>
              <div className="text-gray-500 text-xs">CTL DMG</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${getRankColor('zone_captures_per_ctl_map', team.id)}`}>{team.stats.zone_captures_per_ctl_map.toFixed(1)}</div>
              <div className="text-gray-500 text-xs">Zones/CTL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sliding Player Panel - Mobile optimized
const PlayerSelectionPanel = ({ 
  isOpen, 
  onClose, 
  onPlayerSelect, 
  availablePlayers,
  //selectedTeam,
  //selectedSlot,
  playerRatings
}: {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: Player) => void;
  availablePlayers: Player[];
  selectedTeam: string | null;
  selectedSlot: number | null;
  playerRatings: Map<string, number>;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'AR' | 'SMG' | ''>('');
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');

  // Reset search state when panel closes OR when a player is selected
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setRoleFilter('');
      setSortBy('rating');
    }
  }, [isOpen]);

  const handlePlayerSelect = (player: Player) => {
    // Reset search state immediately when player is selected
    setSearchTerm('');
    setRoleFilter('');
    setSortBy('rating');
    // Then call the parent handler
    onPlayerSelect(player);
  };

  const handleClose = () => {
    setSearchTerm('');
    setRoleFilter('');
    setSortBy('rating');
    onClose();
  };

  const filteredPlayers = useMemo(() => {
    let filtered = availablePlayers.filter(player => {
      const matchesSearch = player.player_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || player.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        const aRating = playerRatings.get(a.id) || a.slayer_rating;
        const bRating = playerRatings.get(b.id) || b.slayer_rating;
        return bRating - aRating;
      } else {
        return a.player_name.localeCompare(b.player_name);
      }
    });

    return filtered;
  }, [availablePlayers, searchTerm, roleFilter, sortBy, playerRatings]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300" onClick={handleClose} />
      )}
      
      <div className={`fixed left-0 top-0 h-full w-full sm:w-96 bg-gray-800 border-r border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700 bg-gray-900 mt-14 sm:mt-16">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                Select Player
              </h2>
              <button onClick={handleClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'AR' | 'SMG' | '')}
                  className="px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Roles</option>
                  <option value="AR">AR</option>
                  <option value="SMG">SMG</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'name')}
                  className="px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="rating">By Rating</option>
                  <option value="name">By Name</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className="bg-gray-700 border border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-gray-650 hover:border-orange-500 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-cover bg-center relative overflow-hidden">
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-600 rounded-full z-10" id={`fallback-${player.id}-panel`}>
                        <span className="text-lg font-medium text-gray-300">{player.player_name.charAt(0)}</span>
                      </div>
                      <img
                        src={player.avatar || `/player-images/${player.player_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                        alt={player.player_name}
                        className="absolute inset-0 w-full h-full object-cover rounded-full z-30"
                        onLoad={(_e) => {
                          const fallback = document.getElementById(`fallback-${player.id}-panel`);
                          if (fallback) fallback.style.display = 'none';
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{player.player_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-orange-400 font-bold text-lg">
                          {Math.round(playerRatings.get(player.id) || player.slayer_rating)}
                        </span>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
            
            {filteredPlayers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No available players found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Main App Component
export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [playerRatings, setPlayerRatings] = useState<Map<string, number>>(new Map());
  const [ratingSystem, setRatingSystem] = useState<EnhancedBreakingPointRatingSystem | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isPlayerPanelOpen, setIsPlayerPanelOpen] = useState(false);
  const [isFreeAgentsOpen, setIsFreeAgentsOpen] = useState(false);
  const [isRankingsOpen, setIsRankingsOpen] = useState(false);
  const [customRankings, setCustomRankings] = useState<{ [teamId: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const rostersRef = useRef<HTMLDivElement>(null);

  const loadPlayersFromCSV = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      const cdlResponse = await fetch('/breaking_point_roles_corrected.csv');
      if (!cdlResponse.ok) {
        throw new Error('Could not load CDL CSV file. Make sure breaking_point_roles_corrected.csv is in the public folder.');
      }
      const cdlCsvText = await cdlResponse.text();
      
      const challengersResponse = await fetch('/challengers_roles_final.csv');
      if (!challengersResponse.ok) {
        throw new Error('Could not load Challengers CSV file. Make sure challengers_roles_final.csv is in the public folder.');
      }
      const challengersCsvText = await challengersResponse.text();

      let ratingOverrides: Record<string, number> = {};
      try {
        const overridesResponse = await fetch('/rating-overrides.json');
        if (overridesResponse.ok) {
          ratingOverrides = await overridesResponse.json();
          console.log('Loaded rating overrides:', ratingOverrides);
        }
      } catch (error) {
        console.log('No rating overrides file found (optional)');
      }
      
      Papa.parse(cdlCsvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (cdlResults) => {
          Papa.parse(challengersCsvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (challengersResults) => {
              try {
                const cdlPlayers: Player[] = cdlResults.data
                  .filter((row: any) => row.player_name && row.slayer_rating && row.role)
                  .map((row: any) => {
                    const safeId = `cdl_${String(row.player_name).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                    
                    return {
                      id: safeId,
                      player_name: String(row.player_name),
                      role: String(row.role) as 'AR' | 'SMG',
                      slayer_rating: Number(row.slayer_rating),
                      hp_k10m: Number(row.hp_k10m) || undefined,
                      hp_dmg10m: Number(row.hp_dmg10m) || undefined,
                      hp_obj10m: Number(row.hp_obj10m) || undefined,
                      hp_eng10m: Number(row.hp_eng10m) || undefined,
                      snd_kpr: Number(row.snd_kpr) || undefined,
                      first_bloods: Number(row.first_bloods) || undefined,
                      opd_win_pct_decimal: Number(row.opd_win_pct_decimal) || undefined,
                      plants_defuses_combined: Number(row.plants_defuses_combined) || undefined,
                      ctl_k10m: Number(row.ctl_k10m) || undefined,
                      ctl_dmg10m: Number(row.ctl_dmg10m) || undefined,
                      ctl_eng10m: Number(row.ctl_eng10m) || undefined,
                      zone_captures: Number(row.zone_captures) || undefined,
                      total_maps: Number(row.total_maps) || undefined,
                      snd_maps: Number(row.snd_maps) || undefined,
                      ctl_maps: Number(row.ctl_maps) || undefined,
                      hp_maps: Number(row.hp_maps) || undefined,
                      game_time_min: Number(row.game_time_min) || undefined
                    };
                  });
                
                const challengersPlayers: Player[] = challengersResults.data
                  .filter((row: any) => row.player_name && row.role)
                  .map((row: any) => {
                    const safeId = `challengers_${String(row.player_name).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                    
                    return {
                      id: safeId,
                      player_name: String(row.player_name),
                      role: String(row.role) as 'AR' | 'SMG',
                      slayer_rating: 45,
                      hp_k10m: Number(row.hp_k_10m || row['hp_k_10m']) || undefined,
                      hp_dmg10m: Number(row.hp_dmg_10m || row['hp_dmg_10m']) || undefined,
                      hp_obj10m: Number(row.hp_obj_10m || row['hp_obj_10m']) || undefined,
                      hp_eng10m: Number(row.hp_eng_10m || row['hp_eng_10m']) || undefined,
                      snd_kpr: Number(row.snd_kpr) || undefined,
                      first_bloods: Number(row.first_bloods) || undefined,
                      opd_win_pct_decimal: Number(row.opd_wpct) || undefined,
                      plants_defuses_combined: ((row.plants || 0) + (row.defuses || 0)) || undefined,
                      ctl_k10m: Number(row.ctl_k_10m || row['ctl_k_10m']) || undefined,
                      ctl_dmg10m: Number(row.ctl_dmg_10m || row['ctl_dmg_10m']) || undefined,
                      ctl_eng10m: Number(row.ctl_eng_10m || row['ctl_eng_10m']) || undefined,
                      zone_captures: Number(row.zone_tier_captures) || undefined,
                      total_maps: Number(row.maps) || undefined,
                      snd_maps: Number(row.snd_maps) || undefined,
                      ctl_maps: Number(row.ctl_maps) || undefined,
                      hp_maps: Number(row.hp_maps) || undefined,
                      game_time_min: Number(row['game_time_(min)']) || undefined
                    };
                  });
                
                // Create enhanced rating system with both CDL and Challengers data
                const ratingSystemInstance = new EnhancedBreakingPointRatingSystem(cdlPlayers, challengersPlayers);
                setRatingSystem(ratingSystemInstance);
                
                // Get merged players in original format for UI compatibility
                const mergedPlayers = ratingSystemInstance.getPlayersInOriginalFormat();
                setAllPlayers(mergedPlayers);
                
                // Calculate ratings using the new dual-pool system
                const calculatedRatings = ratingSystemInstance.calculateAllRatings();
                
                // Apply rating overrides - handle both "hydra" and "cdl_hydra" formats
                const finalRatings = new Map<string, number>();
                mergedPlayers.forEach(player => {
                  const baseRating = calculatedRatings.get(player.id) || player.slayer_rating;
                  
                  // Try multiple override key formats
                  const simpleName = player.player_name.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const cdlName = `cdl_${simpleName}`;
                  
                  const override = ratingOverrides[simpleName] || ratingOverrides[cdlName] || 0;
                  
                  const adjustedRating = baseRating + override;
                  const finalRating = Math.max(50, Math.min(99, adjustedRating));
                  finalRatings.set(player.id, finalRating);
                });
                
                setPlayerRatings(finalRatings);
                
                console.log(`✅ Dual-Pool System Loaded:`);
                console.log(`   Total unique players: ${mergedPlayers.length}`);
                console.log(`   Original CDL: ${cdlPlayers.length}, Challengers: ${challengersPlayers.length}`);
                
                // Debug: Show player rankings
                const rankings = ratingSystemInstance.getPlayerRankings();
                console.log('Player pool breakdown:', rankings.counts);
                console.log('Top 10 CDL players:', rankings.byPool.CDL.slice(0, 10));
                console.log('Top 10 Challengers players:', rankings.byPool.Challengers.slice(0, 10));
                
              } catch (error) {
                console.error('Error processing CSV data:', error);
                setLoadError('Error processing CSV data. Please check the file format.');
              }
            },
            error: (error: any) => {
              console.error('Error parsing Challengers CSV:', error);
              setLoadError('Error parsing Challengers CSV file.');
            }
          });
        },
        error: (error: any) => {
          console.error('Error parsing CDL CSV:', error);
          setLoadError('Error parsing CDL CSV file.');
        }
      });
    } catch (error) {
      console.error('Error loading CSV files:', error);
      setLoadError(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const initializeTeams = () => {
    const initialTeams = CDL_TEAMS.map(team => ({
      ...team,
      rating: 0,
      players: [null, null, null, null] as (Player | null)[],
      stats: {
        hp_k10m: 0, hp_dmg10m: 0, hp_obj10m: 0,
        snd_kpr: 0, first_bloods: 0, plants_defuses_per_snd_map: 0,
        ctl_k10m: 0, ctl_dmg10m: 0, zone_captures_per_ctl_map: 0
      }
    }));
    setTeams(initialTeams);
  };

  useEffect(() => {
    initializeTeams();
    loadPlayersFromCSV();
  }, []);

  const handleOpenPlayerPanel = (teamId: string, slotIndex: number) => {
    setSelectedTeam(teamId);
    setSelectedSlot(slotIndex);
    setIsPlayerPanelOpen(true);
  };

  const handleRemovePlayer = (teamId: string, slotIndex: number) => {
    setTeams(prevTeams =>
      prevTeams.map(team => {
        if (team.id === teamId) {
          const newPlayers = [...team.players];
          newPlayers[slotIndex] = null;
          return { ...team, players: newPlayers };
        }
        return team;
      })
    );
  };

  const handlePlayerPanelSelect = (player: Player) => {
    if (selectedTeam && selectedSlot !== null) {
      setTeams(prevTeams =>
        prevTeams.map(team => {
          if (team.id === selectedTeam) {
            const newPlayers = [...team.players];
            newPlayers[selectedSlot] = player;
            return { ...team, players: newPlayers };
          }
          return team;
        })
      );
    }
    
    // Close panel and reset all state immediately
    setIsPlayerPanelOpen(false);
    setSelectedTeam(null);
    setSelectedSlot(null);
  };

  const handleRankingChange = (teamId: string, newRank: number) => {
    setCustomRankings(prev => ({
      ...prev,
      [teamId]: newRank
    }));
  };

  const handleExportRosters = async () => {
    if (!rostersRef.current) return;

    try {
      const canvas = await html2canvas(rostersRef.current, {
        backgroundColor: '#111827',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `cdl-rosters-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting rosters:', error);
    }
  };

  const handleExportTeam = async (teamId: string) => {
    const teamElement = document.getElementById(`team-${teamId}`);
    if (!teamElement) return;

    try {
      const canvas = await html2canvas(teamElement, {
        backgroundColor: '#111827',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const team = teams.find(t => t.id === teamId);
      const teamName = team?.name.toLowerCase().replace(/\s+/g, '-') || teamId;
      
      const link = document.createElement('a');
      link.download = `${teamName}-roster-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting team roster:', error);
    }
  };

  const calculateTeamStats = (players: (Player | null)[]) => {
    const validPlayers = players.filter((p): p is Player => p !== null);
    if (validPlayers.length === 0) {
      return {
        hp_k10m: 0, hp_dmg10m: 0, hp_obj10m: 0,
        snd_kpr: 0, first_bloods: 0, plants_defuses_per_snd_map: 0,
        ctl_k10m: 0, ctl_dmg10m: 0, zone_captures_per_ctl_map: 0
      };
    }

    const count = validPlayers.length;
    
    const playersWithDerived = validPlayers.map(player => {
      const sndMaps = (player as any).snd_maps || ((player as any).total_maps ? Math.round(((player as any).total_maps * 0.33)) : 10);
      const ctlMaps = (player as any).ctl_maps || ((player as any).total_maps ? Math.round(((player as any).total_maps * 0.33)) : 10);
      
      return {
        ...player,
        plants_defuses_per_snd_map: sndMaps > 0 ? (player.plants_defuses_combined || 0) / sndMaps : 0,
        zone_captures_per_ctl_map: ctlMaps > 0 ? (player.zone_captures || 0) / ctlMaps : 0
      };
    });

    return {
      hp_k10m: playersWithDerived.reduce((sum, p) => sum + (p.hp_k10m || 0), 0) / count,
      hp_dmg10m: playersWithDerived.reduce((sum, p) => sum + (p.hp_dmg10m || 0), 0) / count,
      hp_obj10m: playersWithDerived.reduce((sum, p) => sum + (p.hp_obj10m || 0), 0) / count,
      snd_kpr: playersWithDerived.reduce((sum, p) => sum + (p.snd_kpr || 0), 0) / count,
      first_bloods: playersWithDerived.reduce((sum, p) => sum + (p.first_bloods || 0), 0) / count,
      plants_defuses_per_snd_map: playersWithDerived.reduce((sum, p) => sum + p.plants_defuses_per_snd_map, 0) / count,
      ctl_k10m: playersWithDerived.reduce((sum, p) => sum + (p.ctl_k10m || 0), 0) / count,
      ctl_dmg10m: playersWithDerived.reduce((sum, p) => sum + (p.ctl_dmg10m || 0), 0) / count,
      zone_captures_per_ctl_map: playersWithDerived.reduce((sum, p) => sum + p.zone_captures_per_ctl_map, 0) / count
    };
  };

  const calculateTeamRating = (players: (Player | null)[]) => {
    const validPlayers = players.filter((p): p is Player => p !== null);
    if (validPlayers.length === 0) return 0;
    
    const totalRating = validPlayers.reduce((sum, p) => {
      const rating = playerRatings.get(p.id) || p.slayer_rating;
      return sum + rating;
    }, 0);
    
    return totalRating / validPlayers.length;
  };

  const calculateStatRankings = (teams: Team[]) => {
    const rankings = new Map<string, Map<string, number>>();
    
    const statNames = [
      'hp_k10m', 'hp_dmg10m', 'hp_obj10m',
      'snd_kpr', 'first_bloods', 'plants_defuses_per_snd_map',
      'ctl_k10m', 'ctl_dmg10m', 'zone_captures_per_ctl_map'
    ];

    statNames.forEach(statName => {
      const statRanking = new Map<string, number>();
      
      const sortedTeams = [...teams].sort((a, b) => {
        const aValue = (a.stats as any)[statName] || 0;
        const bValue = (b.stats as any)[statName] || 0;
        return bValue - aValue;
      });

      sortedTeams.forEach((team, index) => {
        statRanking.set(team.id, index + 1);
      });

      rankings.set(statName, statRanking);
    });

    return rankings;
  };

  // Get teams with calculated stats but maintain original order unless custom rankings exist
  const getDisplayTeams = () => {
    const teamsWithStats = teams.map(team => ({
      ...team,
      rating: calculateTeamRating(team.players),
      stats: calculateTeamStats(team.players)
    }));

    // Only reorder if we have custom rankings from the Rankings modal
    if (Object.keys(customRankings).length > 0) {
      return teamsWithStats.sort((a, b) => {
        const rankA = customRankings[a.id] || 999;
        const rankB = customRankings[b.id] || 999;
        return rankA - rankB;
      });
    } else {
      // Keep original CDL_TEAMS order when no custom rankings
      return teamsWithStats.sort((a, b) => {
        const aIndex = CDL_TEAMS.findIndex(t => t.id === a.id);
        const bIndex = CDL_TEAMS.findIndex(t => t.id === b.id);
        return aIndex - bIndex;
      });
    }
  };

  const availablePlayers = allPlayers.filter(player => 
    !teams.some(team => 
      team.players.some(p => p && p.id === player.id)
    )
  );

  const displayTeams = getDisplayTeams();
  const statRankings = calculateStatRankings(displayTeams);

  const totalRosteredPlayers = teams.reduce((sum, team) => sum + team.players.filter(p => p !== null).length, 0);
  const averageTeamRating = displayTeams.reduce((sum, team) => sum + team.rating, 0) / displayTeams.length;
  const topTeam = displayTeams.reduce((top, team) => team.rating > top.rating ? team : top, displayTeams[0]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading dual-pool rating system...</p>
          <p className="text-sm text-gray-400">Merging CDL and Challengers data</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Error Loading Player Data</h2>
          <p className="text-gray-400 mb-4">{loadError}</p>
          <div className="text-sm text-gray-500 text-left bg-gray-800 p-4 rounded-lg">
            <p className="font-semibold mb-2">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Place <code>breaking_point_roles_corrected.csv</code> in the <code>public/</code> folder</li>
              <li>Place <code>challengers_roles_final.csv</code> in the <code>public/</code> folder</li>
              <li>Make sure the CSVs have the required columns</li>
              <li>Refresh the page</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: "url('/your-actual-filename.jpg')",
          zIndex: -1
        }}
      ></div>
      
      {/* Optional: Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" style={{ zIndex: -1 }}></div>
      
      <Header 
        onShowFreeAgents={() => setIsFreeAgentsOpen(true)}
        onExportRosters={handleExportRosters}
        onShowRankings={() => setIsRankingsOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 bg-black/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-4 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-400">{allPlayers.length}</div>
              <div className="text-xs text-gray-400">Unique Players</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-400">{totalRosteredPlayers}/48</div>
              <div className="text-xs text-gray-400">Roster Spots</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-400">{averageTeamRating > 0 ? Math.round(averageTeamRating) : '--'}</div>
              <div className="text-xs text-gray-400">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-400">{topTeam?.rating > 0 ? topTeam.name.split(' ')[0] : 'TBD'}</div>
              <div className="text-xs text-gray-400">Top Team</div>
            </div>
          </div>
          {ratingSystem && (
            <div className="mt-2 text-right">
              <button 
                onClick={() => {
                  const rankings = ratingSystem.getPlayerRankings();
                  console.log('🔍 Dual-Pool System Debug:', rankings);
                  
                  // Show some example player breakdowns
                  const allCombinedPlayers = ratingSystem.getAllPlayers();
                  const exampleCDL = allCombinedPlayers.find(p => p.pool === 'CDL');
                  const exampleChallengers = allCombinedPlayers.find(p => p.pool === 'Challengers');
                  
                  if (exampleCDL) {
                    console.log('📊 Example CDL player breakdown:', ratingSystem.getPlayerBreakdown(exampleCDL));
                  }
                  if (exampleChallengers) {
                    console.log('📊 Example Challengers player breakdown:', ratingSystem.getPlayerBreakdown(exampleChallengers));
                  }
                }}
                className="text-xs text-orange-400 hover:text-orange-300 underline"
              >
                Debug Dual-Pool System
              </button>
            </div>
          )}
        </div>

        {/* Mobile responsive grid - single column on mobile, 2 columns on large screens */}
        <div ref={rostersRef} className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {displayTeams.map((team, index) => (
            <div key={team.id} className="relative">
              {/* Ranking Badge - only show if custom rankings exist */}
              {Object.keys(customRankings).length > 0 && (
                <div className="absolute -top-2 -left-2 w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm z-10 shadow-lg">
                  {customRankings[team.id] || (index + 1)}
                </div>
              )}
              <TeamCard
                team={team}
                onPlayerSelect={handleOpenPlayerPanel}
                onPlayerRemove={handleRemovePlayer}
                playerRatings={playerRatings}
                onExportTeam={handleExportTeam}
                statRankings={statRankings}
              />
            </div>
          ))}
        </div>
      </main>

      <RankingsModal
        isOpen={isRankingsOpen}
        onClose={() => setIsRankingsOpen(false)}
        teams={displayTeams}
        onRankingChange={handleRankingChange}
      />

      <PlayerSelectionPanel
        isOpen={isPlayerPanelOpen}
        onClose={() => {
          setIsPlayerPanelOpen(false);
          setSelectedTeam(null);
          setSelectedSlot(null);
        }}
        onPlayerSelect={handlePlayerPanelSelect}
        availablePlayers={availablePlayers}
        selectedTeam={selectedTeam}
        selectedSlot={selectedSlot}
        playerRatings={playerRatings}
      />

      <FreeAgentsModal
        isOpen={isFreeAgentsOpen}
        onClose={() => setIsFreeAgentsOpen(false)}
        freeAgents={availablePlayers}
        playerRatings={playerRatings}
      />
    </div>
  );
}