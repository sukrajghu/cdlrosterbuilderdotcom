import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Plus, ChevronLeft, TrendingUp, Users, Download, Camera } from "lucide-react";
import { Player } from './dats/players';
import { EnhancedRatingSystem } from './utils/ratingSystem';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import { Analytics } from "@vercel/analytics/react"

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
    first_bloods_per_snd_map: number;
    plants_defuses_per_snd_map: number;
    ctl_k10m: number;
    ctl_dmg10m: number;
    zone_captures_per_ctl_map: number;
  };
}

// CDL Team configurations
const CDL_TEAMS = [
  { id: 'heretics', name: 'MIAMI HERETICS', brandColor: '#FF6D17', logo: '/team-logos/heretics.png' },
  { id: 'optic', name: 'OPTIC TEXAS', brandColor: '#92C850', logo: '/team-logos/optic.png' },
  { id: 'thieves', name: 'LA THIEVES', brandColor: '#FF0000', logo: '/team-logos/thieves.png' },
  { id: 'faze', name: 'ATLANTA FAZE', brandColor: '#E43C2F', logo: '/team-logos/faze.png' },
  { id: 'koi', name: 'TORONTO KOI', brandColor: '#4B9BEC', logo: '/team-logos/koi.png' },
  { id: 'falcons', name: 'VEGAS FALCONS', brandColor: '#01BE6E', logo: '/team-logos/falcons.png' },
  { id: 'surge', name: 'VANCOUVER SURGE', brandColor: '#00667D', logo: '/team-logos/surge.png' },
  { id: 'breach', name: 'BOSTON BREACH', brandColor: '#03FF5C', logo: '/team-logos/breach.png' },
  { id: 'ravens', name: 'CAROLINA ROYAL RAVENS', brandColor: '#0083C1', logo: '/team-logos/ravens.png' },
  { id: 'g2', name: 'MINNESOTA ROKKR', brandColor: '#342565', logo: '/team-logos/g2.png' },
  { id: 'cloud9', name: 'CLOUD9 NY', brandColor: '#00AEEF', logo: '/team-logos/cloud9.png' },
  { id: 'gentlemates', name: 'LA GENTLE M8', brandColor: '#F947B7', logo: '/team-logos/gentlem8.png' }
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
                  <h1 className="text-sm sm:text-xl font-black text-white block truncate tracking-wide">
                    CDL<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">ROSTER</span>BUILDER
                  </h1>

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
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-gray-800 flex-shrink-0 border-2 border-gray-600 shadow-md"
                    style={{ 
                      backgroundImage: team.logo ? `url(${team.logo})` : 'none',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!team.logo && (
                      <span className="text-gray-300 font-black">
                        {team.name.split(' ')[0].charAt(0)}
                      </span>
                    )}
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
                    {team.players.slice(0, 4).map((player, playerIndex) => (
                      <div
                        key={playerIndex}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium relative overflow-hidden"
                      >
                        {player ? (
                          <>
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-600 rounded-full z-10" id={`fallback-${player.id}-ranking-${playerIndex}`}>
                              <span className="text-gray-300">{player.player_name.charAt(0)}</span>
                            </div>
                            <img
                              src={player.avatar || `/player-images/${player.player_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                              alt={player.player_name}
                              className="absolute inset-0 w-full h-full object-cover rounded-full z-30"
                              onLoad={(_e) => {
                                const fallback = document.getElementById(`fallback-${player.id}-ranking-${playerIndex}`);
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
                  <div className="text-red-400 font-medium"> 
                    {(() => { 
                      const sndMaps = (player as any).snd_maps || ((player as any).total_maps ? Math.round(((player as any).total_maps * 0.33)) : 10); 
                      const fbPerSnd = sndMaps > 0 ? (player.first_bloods || 0) / sndMaps : 0; 
                      return fbPerSnd.toFixed(2);
                    })()} 
                  </div>
                    <div className="text-gray-500">FB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-indigo-400 font-medium">
                      {(() => {
                        const sndMaps = (player as any).snd_maps || ((player as any).total_maps ? Math.round(((player as any).total_maps * 0.33)) : 10);
                        const plantsDefusesPerMap = sndMaps > 0 ? (player.plants_defuses_combined || 0) / sndMaps : 0;
                        return plantsDefusesPerMap.toFixed(2);
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
                        return zonesCapturesPerMap.toFixed(2);
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
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl bg-gray-800 flex-shrink-0 border-2 border-gray-600 shadow-lg"
              style={{ 
                backgroundImage: team.logo ? `url(${team.logo})` : 'none',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            >
              {!team.logo && (
                <span className="text-gray-300 font-black text-xl sm:text-2xl">
                  {team.name.split(' ')[0].charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 
              className="font-bold text-sm sm:text-lg text-white truncate"
              style={{ 
                lineHeight: '1.8',
                paddingBottom: '4px',
                minHeight: '24px'
              }}
            >
              {team.name}
            </h3>

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
                    
                    {/* UPDATED: Rating badge - keep purple background in same position but move number up */}
                    <div className="absolute top-1 left-1 bg-purple-500 text-white px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded text-xs font-bold z-40 flex items-start">
                      <span className="transform -translate-y-0.5">{Math.round(playerRating)}</span>
                    </div>
                    
                    {/* UPDATED: Player name - move up from bottom */}
                    <div className="absolute bottom-2 left-0 right-0 z-50">
                    <div className="bg-gradient-to-t from-black/90 to-transparent px-1 sm:px-2 pt-3 pb-2">
                      <div className="text-white text-xs font-medium text-center">
                        {player.player_name}
                      </div>
                    </div>
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
          <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Team Statistics
          </h3>
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
              <div className={`font-medium ${getRankColor('first_bloods_per_snd_map', team.id)}`}>{team.stats.first_bloods_per_snd_map.toFixed(2)}</div>
              <div className="text-gray-500 text-xs">FB/SND</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${getRankColor('plants_defuses_per_snd_map', team.id)}`}>{team.stats.plants_defuses_per_snd_map.toFixed(2)}</div>
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
              <div className={`font-medium ${getRankColor('zone_captures_per_ctl_map', team.id)}`}>{team.stats.zone_captures_per_ctl_map.toFixed(2)}</div>
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
  const [ratingSystem, setRatingSystem] = useState<EnhancedRatingSystem | null>(null);
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
      
      const cdlResponse = await fetch('/cdl_roles_corrected.csv');
      if (!cdlResponse.ok) {
        throw new Error('Could not load CDL CSV file. Make sure cdl_roles_corrected.csv is in the public folder.');
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
                const ratingSystemInstance = new EnhancedRatingSystem(cdlPlayers, challengersPlayers);
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
                
                console.log(` Dual-Pool System Loaded:`);
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
        snd_kpr: 0, first_bloods_per_snd_map: 0, plants_defuses_per_snd_map: 0,
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

  // Replace your export functions with this clean, professional version:

const generateEnhancedTeamExport = async (teamId: string) => {
  const team = teams.find(t => t.id === teamId);
  if (!team) return;

  const exportContainer = document.createElement('div');
  exportContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 1400px;
    height: 1400px;
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
    font-family: 'Arial Black', Arial, sans-serif;
    color: white;
    position: relative;
    overflow: hidden;
  `;

  // Calculate team stats
  const teamStats = calculateTeamStats(team.players);
  const teamRating = Math.round(calculateTeamRating(team.players));

  exportContainer.innerHTML = `
    <!-- ✅ Enhanced Background & Atmosphere -->
    
    <!-- Dynamic Radial Glows -->
    <div style="position: absolute; top: 20%; left: 20%; width: 600px; height: 600px; background: radial-gradient(circle, ${team.brandColor}15 0%, transparent 60%); filter: blur(40px); border-radius: 50%;"></div>
    <div style="position: absolute; bottom: 15%; right: 25%; width: 500px; height: 500px; background: radial-gradient(circle, ${team.brandColor}20 0%, transparent 70%); filter: blur(30px); border-radius: 50%;"></div>
    <div style="position: absolute; top: 50%; left: 50%; width: 800px; height: 800px; background: radial-gradient(circle, ${team.brandColor}08 0%, transparent 80%); filter: blur(60px); border-radius: 50%; transform: translate(-50%, -50%);"></div>
    
    <!-- Floating Particles with Animation -->
    <div style="position: absolute; inset: 0;">
      <div style="position: absolute; top: 15%; left: 8%; width: 4px; height: 4px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 15px ${team.brandColor}80;"></div>
      <div style="position: absolute; top: 25%; right: 12%; width: 3px; height: 3px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 10px #ffffff60;"></div>
      <div style="position: absolute; top: 65%; left: 15%; width: 5px; height: 5px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 20px ${team.brandColor}80;"></div>
      <div style="position: absolute; bottom: 20%; right: 20%; width: 2px; height: 2px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 8px #ffffff40;"></div>
      <div style="position: absolute; top: 40%; left: 6%; width: 3px; height: 3px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 12px ${team.brandColor}60;"></div>
      <div style="position: absolute; bottom: 35%; left: 80%; width: 4px; height: 4px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 15px #ffffff50;"></div>
    </div>
    
    <!-- Enhanced Tech Grid with Multiple Layers -->
    <div style="position: absolute; inset: 0; opacity: 0.15;">
      <div style="
        position: absolute; 
        inset: 0; 
        background-image: 
          linear-gradient(${team.brandColor}40 1px, transparent 1px),
          linear-gradient(90deg, ${team.brandColor}40 1px, transparent 1px);
        background-size: 40px 40px;
      "></div>
      <div style="
        position: absolute; 
        inset: 0; 
        background-image: 
          linear-gradient(${team.brandColor}20 1px, transparent 1px),
          linear-gradient(90deg, ${team.brandColor}20 1px, transparent 1px);
        background-size: 80px 80px;
        transform: translate(20px, 20px);
      "></div>
    </div>
      
    <!-- Enhanced Circuit Pattern Networks -->
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 100%;">
      <!-- Main Circuit Lines -->
      <div style="position: absolute; top: 18%; left: -15%; width: 130%; height: 4px; background: linear-gradient(90deg, transparent, ${team.brandColor}60, ${team.brandColor}80, ${team.brandColor}60, transparent); transform: rotate(-12deg); box-shadow: 0 0 15px ${team.brandColor}50;"></div>
      <div style="position: absolute; top: 38%; right: -15%; width: 130%; height: 3px; background: linear-gradient(90deg, transparent, ${team.brandColor}50, ${team.brandColor}70, transparent); transform: rotate(18deg); box-shadow: 0 0 10px ${team.brandColor}40;"></div>
      <div style="position: absolute; bottom: 42%; left: -15%; width: 130%; height: 4px; background: linear-gradient(90deg, transparent, ${team.brandColor}55, ${team.brandColor}75, ${team.brandColor}55, transparent); transform: rotate(-8deg); box-shadow: 0 0 12px ${team.brandColor}45;"></div>
      
      <!-- Secondary Circuit Lines -->
      <div style="position: absolute; top: 28%; left: -10%; width: 120%; height: 2px; background: linear-gradient(90deg, transparent, ${team.brandColor}30, transparent); transform: rotate(-5deg);"></div>
      <div style="position: absolute; bottom: 30%; right: -10%; width: 120%; height: 2px; background: linear-gradient(90deg, transparent, ${team.brandColor}35, transparent); transform: rotate(15deg);"></div>
    </div>
      
    <!-- Enhanced Geometric Elements with Layered Depth -->
    <div style="position: absolute; inset: 0;">
      <!-- Main Corner Elements -->
      <div style="position: absolute; top: -100px; left: -100px; width: 300px; height: 300px; border: 4px solid ${team.brandColor}50; transform: rotate(45deg); border-radius: 25px; box-shadow: 0 0 30px ${team.brandColor}30;"></div>
      <div style="position: absolute; top: -60px; left: -60px; width: 220px; height: 220px; border: 2px solid ${team.brandColor}30; transform: rotate(30deg); border-radius: 20px;"></div>
      
      <div style="position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border: 3px solid ${team.brandColor}40; border-radius: 50%; box-shadow: 0 0 25px ${team.brandColor}25;"></div>
      <div style="position: absolute; top: -30px; right: -30px; width: 160px; height: 160px; border: 2px solid ${team.brandColor}20; border-radius: 50%;"></div>
      
      <div style="position: absolute; bottom: -100px; right: -100px; width: 300px; height: 300px; border: 4px solid ${team.brandColor}45; transform: rotate(-25deg); border-radius: 20px; box-shadow: 0 0 35px ${team.brandColor}25;"></div>
      <div style="position: absolute; bottom: -70px; left: -70px; width: 240px; height: 240px; border: 3px solid ${team.brandColor}35; border-radius: 50%; box-shadow: 0 0 20px ${team.brandColor}20;"></div>
    </div>
      
    <!-- Enhanced Circuit Networks with Glowing Connection Points -->
    <div style="position: absolute; top: 25%; right: 8%; width: 150px; height: 100px;">
      <div style="width: 100%; height: 3px; background: linear-gradient(90deg, ${team.brandColor}40, ${team.brandColor}60, ${team.brandColor}40); margin-bottom: 20px; box-shadow: 0 0 8px ${team.brandColor}50;"></div>
      <div style="width: 70%; height: 2px; background: linear-gradient(90deg, ${team.brandColor}30, ${team.brandColor}50); margin-bottom: 20px; box-shadow: 0 0 6px ${team.brandColor}40;"></div>
      <div style="width: 85%; height: 3px; background: linear-gradient(90deg, ${team.brandColor}35, ${team.brandColor}55, ${team.brandColor}35); box-shadow: 0 0 8px ${team.brandColor}45;"></div>
      
      <!-- Glowing Connection Points -->
      <div style="position: absolute; right: 0; top: 0; width: 12px; height: 12px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 20px ${team.brandColor}80;"></div>
      <div style="position: absolute; right: 30%; top: 20px; width: 10px; height: 10px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 15px ${team.brandColor}70;"></div>
      <div style="position: absolute; right: 15%; bottom: 0; width: 12px; height: 12px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 20px ${team.brandColor}80;"></div>
    </div>
    
    <!-- Mirror Circuit Network -->
    <div style="position: absolute; bottom: 25%; left: 8%; width: 140px; height: 90px;">
      <div style="width: 90%; height: 2px; background: linear-gradient(90deg, ${team.brandColor}30, ${team.brandColor}50, ${team.brandColor}30); margin-bottom: 18px; box-shadow: 0 0 6px ${team.brandColor}40;"></div>
      <div style="width: 100%; height: 3px; background: linear-gradient(90deg, ${team.brandColor}40, ${team.brandColor}60); margin-bottom: 18px; box-shadow: 0 0 8px ${team.brandColor}50;"></div>
      <div style="width: 75%; height: 2px; background: linear-gradient(90deg, ${team.brandColor}35, ${team.brandColor}55); box-shadow: 0 0 6px ${team.brandColor}45;"></div>
      
      <!-- Connection Points -->
      <div style="position: absolute; left: 88%; top: 0; width: 10px; height: 10px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 15px ${team.brandColor}70;"></div>
      <div style="position: absolute; right: 0; top: 18px; width: 12px; height: 12px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 20px ${team.brandColor}80;"></div>
      <div style="position: absolute; left: 73%; bottom: 0; width: 10px; height: 10px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 15px ${team.brandColor}70;"></div>
    </div>
    
    <!-- Additional Tech Elements with Enhanced Glow -->
    <div style="position: absolute; bottom: 30%; right: 12%; width: 3px; height: 120px; background: linear-gradient(180deg, transparent, ${team.brandColor}50, ${team.brandColor}70, ${team.brandColor}50, transparent); box-shadow: 0 0 10px ${team.brandColor}50;"></div>
    <div style="position: absolute; top: 30%; left: 5%; width: 3px; height: 100px; background: linear-gradient(180deg, transparent, ${team.brandColor}45, ${team.brandColor}65, transparent); box-shadow: 0 0 8px ${team.brandColor}45;"></div>
    
    <!-- ✅ Visible Logo Integration - Top-Left Logo -->
    <div style="position: absolute; top: 40px; left: 40px; z-index: 100;">
      <div style="
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, ${team.brandColor}, ${team.brandColor}dd);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 30px ${team.brandColor}80, 0 0 60px ${team.brandColor}50;
        border: 3px solid rgba(255,255,255,0.3);
        overflow: hidden;
        position: relative;
      ">
        <!-- Enhanced Inner Glow -->
        <div style="position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 30%, ${team.brandColor}20 100%); border-radius: 50%;"></div>
        
        <img 
          src="/apple-touch-icon.png" 
          style="
            width: 50px; 
            height: 50px; 
            object-fit: contain;
            filter: drop-shadow(0 2px 8px rgba(0,0,0,0.8));
            z-index: 10;
            position: relative;
          "
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        />
        <span style="
          display: none;
          font-size: 36px;
          font-weight: 900;
          color: white;
          text-shadow: 0 2px 8px rgba(0,0,0,0.8);
          z-index: 10;
          position: relative;
        ">R</span>
      </div>
    </div>

    <!-- Header Section -->
    <div style="text-align: center; padding: 30px 60px 30px; position: relative;">
      <div style="
        background: linear-gradient(135deg, #1f2937, #374151); 
        color: white; 
        display: inline-block; 
        padding: 20px 60px;
        position: relative;
        clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%);
        margin-bottom: 15px;
        border: 2px solid ${team.brandColor}60;
        box-shadow: 0 0 40px ${team.brandColor}40, 0 0 80px ${team.brandColor}20;
      ">
        <!-- Team Color Accent Bar -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${team.brandColor}, ${team.brandColor}dd, ${team.brandColor}); box-shadow: 0 0 15px ${team.brandColor}60;"></div>
        
        <div style="font-size: 28px; font-weight: 900; margin: 0 0 6px 0; letter-spacing: 2px; text-shadow: 0 0 20px ${team.brandColor}50;">${team.name}</div>
        <div style="font-size: 16px; font-weight: 700; margin: 0; letter-spacing: 1px; color: #94a3b8;">CDLROSTERBUILDER.COM</div>
      </div>
    </div>

    <!-- ✅ Player Cards with NO Overlays -->
    <div style="display: flex; justify-content: center; gap: 35px; margin-bottom: 40px; padding: 0 60px;">
      ${team.players.map((player, _) => {
        if (!player) {
          return `
            <div style="text-align: center; flex: 1; max-width: 240px;">
              <!-- Rating Number -->
              <div style="font-size: 64px; font-weight: 900; color: #4b5563; margin-bottom: 20px; line-height: 1; text-shadow: 0 0 20px rgba(75, 85, 99, 0.5);">?</div>
              
              <!-- Player Image -->
              <div style="
                width: 160px;
                height: 160px;
                margin: 0 auto 20px;
                border-radius: 10px;
                overflow: hidden;
                background: linear-gradient(135deg, #374151, #4b5563);
                border: 3px solid #4b5563;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6b7280;
                font-size: 16px;
                font-weight: 700;
                box-shadow: 0 0 20px rgba(75, 85, 99, 0.3);
              ">
                NO PLAYER
              </div>
              
              <!-- Player Name -->
              <div style="
                background: linear-gradient(135deg, #374151, #4b5563);
                color: white;
                padding: 12px;
                font-size: 18px;
                font-weight: 900;
                letter-spacing: 1px;
                border-radius: 6px;
                border: 2px solid #6b7280;
                box-shadow: 0 0 12px rgba(107, 114, 128, 0.3);
              ">
                TBD
              </div>
            </div>
          `;
        }

        const playerRating = Math.round(playerRatings.get(player.id) || player.slayer_rating);

        return `
          <div style="text-align: center; flex: 1; max-width: 240px;">
            <!-- Rating Number with Enhanced Glow -->
            <div style="
              font-size: 64px; 
              font-weight: 900; 
              color: white; 
              margin-bottom: 20px; 
              line-height: 1;
              text-shadow: 0 0 30px ${team.brandColor}90, 0 0 60px ${team.brandColor}60;
              filter: drop-shadow(0 3px 8px rgba(0,0,0,0.6));
            ">${playerRating}</div>
            
            <!-- Player Image with NO Overlays -->
            <div style="
              width: 160px;
              height: 160px;
              margin: 0 auto 20px;
              border-radius: 10px;
              overflow: hidden;
              background: #1f2937;
              position: relative;
              border: 3px solid ${team.brandColor}90;
              box-shadow: 0 0 25px ${team.brandColor}50, 0 0 50px ${team.brandColor}30;
            ">
              <img 
                src="${player.avatar || `/player-images/${player.player_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}" 
                style="
                  width: 100%; 
                  height: 100%; 
                  object-fit: cover; 
                  object-position: center top;
                  filter: saturate(1.2) contrast(1.1) brightness(1.05);
                "
                onerror="this.style.display='none';"
              />
            </div>
            
            <!-- Enhanced Player Name Section -->
            <div style="
              background: linear-gradient(135deg, #1f2937, #374151);
              color: white;
              padding: 12px;
              font-size: 18px;
              font-weight: 900;
              letter-spacing: 1px;
              text-transform: uppercase;
              border-radius: 6px;
              border: 2px solid ${team.brandColor}70;
              box-shadow: 0 0 20px ${team.brandColor}40, 0 0 40px ${team.brandColor}20;
              position: relative;
              overflow: hidden;
            ">
              <!-- Gradient Overlay -->
              <div style="position: absolute; inset: 0; background: linear-gradient(135deg, ${team.brandColor}15 0%, transparent 50%, ${team.brandColor}10 100%);"></div>
              
              <!-- Enhanced Typography with Shadow -->
              <div style="position: relative; z-index: 10; text-shadow: 0 2px 6px rgba(0,0,0,0.8), 0 0 12px ${team.brandColor}30;">
                ${player.player_name}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- ✅ Upgraded Stats Section with Visual Progress Bars -->
    <div style="padding: 0 60px; margin-bottom: 60px;">
      <div style="
        background: linear-gradient(135deg, rgba(31, 41, 59, 0.95), rgba(55, 65, 81, 0.8));
        border: 3px solid ${team.brandColor}60;
        border-radius: 20px;
        padding: 50px;
        backdrop-filter: blur(20px);
        box-shadow: 0 0 60px ${team.brandColor}35, 0 0 120px ${team.brandColor}20;
        position: relative;
        overflow: hidden;
      ">
        <!-- Enhanced Card Accent with Glow -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, ${team.brandColor}, ${team.brandColor}cc, ${team.brandColor}); box-shadow: 0 0 20px ${team.brandColor}60;"></div>
        
        <!-- Enhanced Background Tech Pattern -->
        <div style="position: absolute; inset: 0; opacity: 0.08;">
          <div style="
            background-image: 
              linear-gradient(${team.brandColor}60 1px, transparent 1px),
              linear-gradient(90deg, ${team.brandColor}60 1px, transparent 1px);
            background-size: 30px 30px;
            width: 100%;
            height: 100%;
          "></div>
          <div style="
            background-image: 
              linear-gradient(${team.brandColor}30 1px, transparent 1px),
              linear-gradient(90deg, ${team.brandColor}30 1px, transparent 1px);
            background-size: 60px 60px;
            width: 100%;
            height: 100%;
            transform: translate(15px, 15px);
          "></div>
        </div>
        
        <h2 style="font-size: 48px; font-weight: 900; color: white; margin-bottom: 45px; letter-spacing: 3px; text-shadow: 0 2px 8px rgba(0,0,0,0.6), 0 0 25px ${team.brandColor}40; text-align: center; position: relative; z-index: 10;">TEAM STATS</h2>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-bottom: 30px;">
          <!-- ✅ Enhanced Hardpoint Stats with Progress Bars -->
          <div style="text-align: center; background: rgba(0,0,0,0.6); padding: 35px 25px; border-radius: 16px; border: 2px solid ${team.brandColor}40; box-shadow: 0 0 30px ${team.brandColor}25; position: relative; overflow: hidden;">
            <!-- Gradient Accent Bar -->
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #60a5fa, #34d399, #a78bfa);"></div>
            
            <div style="font-size: 22px; color: ${team.brandColor}; font-weight: 900; margin-bottom: 25px; letter-spacing: 2px; text-shadow: 0 0 15px ${team.brandColor}50;">HARDPOINT</div>
            
            <!-- K/10M -->
            <div style="margin-bottom: 20px; position: relative;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 16px; color: #94a3b8; font-weight: 700;">K/10M:</span>
                <span style="font-size: 20px; font-weight: 900; color: #60a5fa; text-shadow: 0 0 10px #60a5fa50;">${teamStats.hp_k10m.toFixed(1)}</span>
              </div>
            </div>
            
            <!-- DMG -->
            <div style="margin-bottom: 20px; position: relative;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 16px; color: #94a3b8; font-weight: 700;">DMG:</span>
                <span style="font-size: 20px; font-weight: 900; color: #34d399; text-shadow: 0 0 10px #34d39950;">${Math.round(teamStats.hp_dmg10m)}</span>
              </div>
            </div>
            
            <!-- OBJ -->
            <div style="position: relative;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 16px; color: #94a3b8; font-weight: 700;">OBJ:</span>
                <span style="font-size: 20px; font-weight: 900; color: #a78bfa; text-shadow: 0 0 10px #a78bfa50;">${teamStats.hp_obj10m.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <!-- ✅ Enhanced Search & Destroy Stats with Progress Bars -->
          <div style="text-align: center; background: rgba(0,0,0,0.6); padding: 35px 25px; border-radius: 16px; border: 2px solid ${team.brandColor}40; box-shadow: 0 0 30px ${team.brandColor}25; position: relative; overflow: hidden;">
            <!-- Gradient Accent Bar -->
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #fbbf24, #f87171, #a855f7);"></div>
            
            <div style="font-size: 22px; color: ${team.brandColor}; font-weight: 900; margin-bottom: 25px; letter-spacing: 2px; text-shadow: 0 0 15px ${team.brandColor}50;">SEARCH & DESTROY</div>
            
            <!-- KPR -->
            <div style="margin-bottom: 20px; position: relative;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 16px; color: #94a3b8; font-weight: 700;">KPR:</span>
                <span style="font-size: 20px; font-weight: 900; color: #fbbf24; text-shadow: 0 0 10px #fbbf2450;">${teamStats.snd_kpr.toFixed(2)}</span>
              </div>
            </div>
            
            <!-- FB/SND -->
            <div style="margin-bottom: 20px; position: relative;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 16px; color: #94a3b8; font-weight: 700;">FB/SND:</span>
                <span style="font-size: 20px; font-weight: 900; color: #f87171; text-shadow: 0 0 10px #f8717150;">${teamStats.first_bloods_per_snd_map.toFixed(2)}</span>
              </div>
            </div>
            
            <!-- P+D/SND -->
            <div style="position: relative;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 16px; color: #94a3b8; font-weight: 700;">P+D/SND:</span>
                <span style="font-size: 20px; font-weight: 900; color: #a855f7; text-shadow: 0 0 10px #a855f750;">${teamStats.plants_defuses_per_snd_map.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- ✅ Enhanced Control Stats with Progress Bars -->
          <div style="text-align: center; background: rgba(0,0,0,0.6); padding: 35px 25px; border-radius: 16px; border: 2px solid ${team.brandColor}40; box-shadow: 0 0 30px ${team.brandColor}25; position: relative; overflow: hidden;">
            <!-- Gradient Accent Bar -->
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #06b6d4, #ec4899, #fb923c);"></div>
            
            <div style="font-size: 22px; color: ${team.brandColor}; font-weight: 900; margin-bottom: 25px; letter-spacing: 2px; text-shadow: 0 0 15px ${team.brandColor}50;">CONTROL</div>
            
            <!-- K/10M -->
            <div style="margin-bottom: 20px; position: relative;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 16px; color: #94a3b8; font-weight: 700;">K/10M:</span>
                <span style="font-size: 20px; font-weight: 900; color: #06b6d4; text-shadow: 0 0 10px #06b6d450;">${teamStats.ctl_k10m.toFixed(1)}</span>
              </div>
            </div>
            
            <!-- DMG -->
            <div style="margin-bottom: 20px; position: relative;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 16px; color: #94a3b8; font-weight: 700;">DMG:</span>
                <span style="font-size: 20px; font-weight: 900; color: #ec4899; text-shadow: 0 0 10px #ec489950;">${Math.round(teamStats.ctl_dmg10m)}</span>
              </div>
            </div>
            
            <!-- Zones/CTL -->
            <div style="position: relative;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 16px; color: #94a3b8; font-weight: 700;">Zones/CTL:</span>
                <span style="font-size: 20px; font-weight: 900; color: #fb923c; text-shadow: 0 0 10px #fb923c50;">${teamStats.zone_captures_per_ctl_map.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Overall Rating - Enhanced Pattern Design -->
    <div style="display: flex; justify-content: center; padding: 0 40px; margin-bottom: 80px;">
      <div style="
        background: linear-gradient(135deg, rgba(0,0,0,0.98), rgba(31, 41, 59, 0.95));
        border: 3px solid ${team.brandColor}70;
        border-radius: 16px;
        padding: 30px 40px;
        text-align: center;
        backdrop-filter: blur(20px);
        box-shadow: 0 0 60px ${team.brandColor}40, 0 0 120px ${team.brandColor}25;
        position: relative;
        overflow: hidden;
        width: 280px;
      ">
        <!-- Enhanced Geometric Pattern Background -->
        <div style="position: absolute; inset: 0; opacity: 0.08;">
          <div style="position: absolute; top: 15px; left: 15px; width: 30px; height: 30px; border: 2px solid ${team.brandColor}; transform: rotate(45deg);"></div>
          <div style="position: absolute; top: 15px; right: 15px; width: 25px; height: 25px; border: 2px solid ${team.brandColor}; border-radius: 50%;"></div>
          <div style="position: absolute; bottom: 15px; left: 15px; width: 25px; height: 25px; border: 2px solid ${team.brandColor}; border-radius: 50%;"></div>
          <div style="position: absolute; bottom: 15px; right: 15px; width: 30px; height: 30px; border: 2px solid ${team.brandColor}; transform: rotate(45deg);"></div>
          
          <div style="position: absolute; top: 50%; left: 10px; width: 20px; height: 20px; background: ${team.brandColor}; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); transform: translateY(-50%);"></div>
          <div style="position: absolute; top: 50%; right: 10px; width: 20px; height: 20px; background: ${team.brandColor}; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); transform: translateY(-50%) rotate(180deg);"></div>
        </div>
        
        <!-- Enhanced Circuit Board Pattern -->
        <div style="position: absolute; top: 12px; left: 12px; width: 40px; height: 40px; opacity: 0.15;">
          <div style="position: absolute; top: 10px; left: 0; width: 30px; height: 2px; background: ${team.brandColor}; box-shadow: 0 0 6px ${team.brandColor}60;"></div>
          <div style="position: absolute; top: 20px; left: 5px; width: 20px; height: 2px; background: ${team.brandColor}; box-shadow: 0 0 4px ${team.brandColor}50;"></div>
          <div style="position: absolute; top: 30px; left: 0; width: 25px; height: 2px; background: ${team.brandColor}; box-shadow: 0 0 6px ${team.brandColor}60;"></div>
          <div style="position: absolute; top: 8px; left: 28px; width: 4px; height: 4px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 8px ${team.brandColor}80;"></div>
          <div style="position: absolute; top: 18px; left: 23px; width: 3px; height: 3px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 6px ${team.brandColor}70;"></div>
          <div style="position: absolute; top: 28px; left: 24px; width: 4px; height: 4px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 8px ${team.brandColor}80;"></div>
        </div>
        
        <!-- Mirror Circuit Pattern -->
        <div style="position: absolute; bottom: 12px; right: 12px; width: 40px; height: 40px; opacity: 0.15; transform: rotate(180deg);">
          <div style="position: absolute; top: 10px; left: 0; width: 30px; height: 2px; background: ${team.brandColor}; box-shadow: 0 0 6px ${team.brandColor}60;"></div>
          <div style="position: absolute; top: 20px; left: 5px; width: 20px; height: 2px; background: ${team.brandColor}; box-shadow: 0 0 4px ${team.brandColor}50;"></div>
          <div style="position: absolute; top: 30px; left: 0; width: 25px; height: 2px; background: ${team.brandColor}; box-shadow: 0 0 6px ${team.brandColor}60;"></div>
          <div style="position: absolute; top: 8px; left: 28px; width: 4px; height: 4px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 8px ${team.brandColor}80;"></div>
          <div style="position: absolute; top: 18px; left: 23px; width: 3px; height: 3px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 6px ${team.brandColor}70;"></div>
          <div style="position: absolute; top: 28px; left: 24px; width: 4px; height: 4px; background: ${team.brandColor}; border-radius: 50%; box-shadow: 0 0 8px ${team.brandColor}80;"></div>
        </div>
        
        <!-- Enhanced Top Accent Line -->
        <div style="position: absolute; top: 0; left: 20%; right: 20%; height: 3px; background: linear-gradient(90deg, transparent, ${team.brandColor}, transparent); box-shadow: 0 0 12px ${team.brandColor}60;"></div>
        
        <!-- Enhanced Corner Accent Elements -->
        <div style="position: absolute; top: -2px; left: -2px; width: 20px; height: 20px; border-top: 3px solid ${team.brandColor}; border-left: 3px solid ${team.brandColor}; box-shadow: 0 0 12px ${team.brandColor}50;"></div>
        <div style="position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; border-top: 3px solid ${team.brandColor}; border-right: 3px solid ${team.brandColor}; box-shadow: 0 0 12px ${team.brandColor}50;"></div>
        <div style="position: absolute; bottom: -2px; left: -2px; width: 20px; height: 20px; border-bottom: 3px solid ${team.brandColor}; border-left: 3px solid ${team.brandColor}; box-shadow: 0 0 12px ${team.brandColor}50;"></div>
        <div style="position: absolute; bottom: -2px; right: -2px; width: 20px; height: 20px; border-bottom: 3px solid ${team.brandColor}; border-right: 3px solid ${team.brandColor}; box-shadow: 0 0 12px ${team.brandColor}50;"></div>
        
        <h2 style="font-size: 20px; font-weight: 900; color: white; margin-bottom: 15px; letter-spacing: 1px; text-shadow: 0 2px 6px rgba(0,0,0,0.6), 0 0 15px ${team.brandColor}40; position: relative; z-index: 10;">TEAM OVERALL</h2>
        
        <!-- Main Rating Display with Enhanced Effects -->
        <div style="position: relative; z-index: 10;">
          <div style="
            font-size: 56px; 
            font-weight: 900; 
            color: ${team.brandColor}; 
            line-height: 1;
            text-shadow: 0 0 30px ${team.brandColor}60, 0 0 60px ${team.brandColor}40;
            filter: drop-shadow(0 3px 8px rgba(0,0,0,0.8));
            margin-bottom: 8px;
          ">${teamRating}</div>
          <div style="font-size: 14px; color: #94a3b8; font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">RATING</div>
        </div>
      </div>
    </div>

    <!-- ✅ Enhanced Footer Branding -->
    <div style="position: absolute; bottom: 30px; right: 40px;">
      <div style="
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, ${team.brandColor}, ${team.brandColor}dd);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 30px ${team.brandColor}80, 0 0 60px ${team.brandColor}50;
        border: 3px solid rgba(255,255,255,0.3);
        overflow: hidden;
        position: relative;
      ">
        <!-- Enhanced Inner Glow Effect -->
        <div style="position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 20%, ${team.brandColor}25 100%); border-radius: 50%;"></div>
        
        <!-- Subtle Animated Ring -->
        <div style="position: absolute; inset: -3px; border: 2px solid ${team.brandColor}40; border-radius: 50%; opacity: 0.6;"></div>
        
        <img 
          src="/apple-touch-icon.png" 
          style="
            width: 36px; 
            height: 36px; 
            object-fit: contain;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.9)) saturate(1.1) brightness(1.05);
            z-index: 10;
            position: relative;
          "
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        />
        <span style="
          display: none;
          font-size: 30px;
          font-weight: 900;
          color: white;
          text-shadow: 0 2px 6px rgba(0,0,0,0.9);
          z-index: 10;
          position: relative;
        ">R</span>
      </div>
    </div>
  `;

  document.body.appendChild(exportContainer);

  try {
    const canvas = await html2canvas(exportContainer, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      width: 1400,
      height: 1400,
      allowTaint: true
    });

    const link = document.createElement('a');
    link.download = `${team.name.toLowerCase().replace(/\s+/g, '-')}-team-roster-enhanced.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } finally {
    document.body.removeChild(exportContainer);
  }
};

const generateProfessionalAllTeamsExport = async () => {
  const exportContainer = document.createElement('div');
  exportContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 1400px;
    min-height: 1200px;
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
    font-family: 'Arial Black', Arial, sans-serif;
    color: white;
    position: relative;
    overflow: hidden;
    padding: 40px;
    box-sizing: border-box;
  `;

  // Get team data with ratings
  const displayTeams = getDisplayTeams();

  const teamsHTML = displayTeams.map(team => {
    const teamRating = Math.round(calculateTeamRating(team.players));
    
    return `
      <div style="
        background: linear-gradient(135deg, ${team.brandColor}15 0%, rgba(0,0,0,0.8) 100%);
        border: 2px solid ${team.brandColor}70;
        border-radius: 16px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 0 30px ${team.brandColor}30, 0 0 60px ${team.brandColor}15;
        height: 420px;
        display: flex;
        flex-direction: column;
      ">
        <!-- Team Header -->
        <div style="
          padding: 20px;
          border-bottom: 2px solid ${team.brandColor}40;
          background: linear-gradient(135deg, ${team.brandColor}20 0%, rgba(0,0,0,0.7) 100%);
          position: relative;
          overflow: hidden;
        ">
          <!-- Header accent line -->
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${team.brandColor}, ${team.brandColor}dd, ${team.brandColor}); box-shadow: 0 0 15px ${team.brandColor}60;"></div>
          
          <!-- Tech pattern overlay -->
          <div style="position: absolute; inset: 0; opacity: 0.1;">
            <div style="
              background-image: 
                linear-gradient(${team.brandColor}60 1px, transparent 1px),
                linear-gradient(90deg, ${team.brandColor}60 1px, transparent 1px);
              background-size: 20px 20px;
              width: 100%;
              height: 100%;
            "></div>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; position: relative; z-10;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <!-- Team Logo - Exactly Like Website -->
              <div style="
                width: 56px;
                height: 56px;
                background: #1f2937;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #374151;
                overflow: hidden;
                flex-shrink: 0;
              ">
                ${team.logo ? `
                  <img 
                    src="${team.logo}" 
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: contain;
                      object-position: center;
                    "
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                  />
                ` : ''}
                <span style="
                  ${team.logo ? 'display: none;' : 'display: block;'}
                  font-size: 24px;
                  font-weight: 900;
                  color: #6b7280;
                ">
                  ${team.name.split(' ')[0].charAt(0)}
                </span>
              </div>
              
              <!-- Team Info -->
              <div>
                <h3 style="
                  color: white;
                  font-size: 18px;
                  font-weight: 900;
                  margin: 0 0 4px 0;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  text-shadow: 0 2px 6px rgba(0,0,0,0.6), 0 0 12px ${team.brandColor}30;
                ">
                  ${team.name}
                </h3>
                <div style="color: #9ca3af; font-size: 12px; font-weight: 600;">
                  ${team.players.filter(p => p !== null).length}/4 Players
                </div>
              </div>
            </div>
            
            <!-- Team Rating -->
            <div style="text-align: right;">
              <div style="
                color: ${team.brandColor};
                font-size: 28px;
                font-weight: 900;
                line-height: 1;
                text-shadow: 0 0 20px ${team.brandColor}60, 0 0 40px ${team.brandColor}40;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,0.8));
                margin-bottom: 2px;
              ">
                ${teamRating > 0 ? teamRating : '--'}
              </div>
              <div style="color: #9ca3af; font-size: 11px; font-weight: 700; letter-spacing: 1px;">RATING</div>
            </div>
          </div>
        </div>
        
        <!-- Players Grid -->
        <div style="
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 8px; 
          padding: 16px;
          flex: 1;
        ">
          ${team.players.map((player, index) => {
            if (player) {
              const playerRating = Math.round(playerRatings.get(player.id) || player.slayer_rating);
              return `
                <div style="
                  aspect-ratio: 1;
                  background: #1f2937;
                  border-radius: 8px;
                  position: relative;
                  overflow: hidden;
                  border: 1px solid ${team.brandColor}30;
                ">
                  <!-- Player Image Background -->
                  <div style="
                    position: absolute;
                    inset: 0;
                    background: #374151;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                  " id="fallback-${player.id}-all-${index}">
                    <span style="font-size: 20px; font-weight: 900; color: #6b7280;">
                      ${player.player_name.charAt(0)}
                    </span>
                  </div>
                  
                  <!-- Actual Player Image -->
                  <img 
                    src="${player.avatar || `/player-images/${player.player_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}" 
                    style="
                      position: absolute;
                      inset: 0;
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      object-position: center top;
                      z-index: 20;
                    "
                    onload="document.getElementById('fallback-${player.id}-all-${index}').style.display='none';"
                    onerror="this.style.display='none';"
                  />
                  
                  <!-- Enhanced Rating Badge -->
                  <div style="
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    background: linear-gradient(135deg, #9333ea, #7c3aed);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-weight: 900;
                    font-size: 11px;
                    z-index: 30;
                    box-shadow: 0 0 12px rgba(147, 51, 234, 0.6), 0 2px 4px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.3);
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    min-width: 24px;
                    text-align: center;
                  ">
                    ${playerRating}
                  </div>
                  
                  <!-- Player Name -->
                  <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
                    padding: 8px 4px 2px;
                    z-index: 30;
                  ">
                    <div style="
                      color: white;
                      font-size: 9px;
                      font-weight: 700;
                      text-align: center;
                      text-transform: uppercase;
                      letter-spacing: 0.3px;
                      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                    ">
                      ${player.player_name}
                    </div>
                  </div>
                </div>
              `;
            } else {
              return `
                <div style="
                  aspect-ratio: 1;
                  background: #374151;
                  border-radius: 8px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: #6b7280;
                  font-size: 12px;
                  font-weight: 600;
                  border: 1px dashed #6b7280;
                ">
                  TBD
                </div>
              `;
            }
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  exportContainer.innerHTML = `
    <!-- Enhanced Background Effects -->
    
    <!-- Dynamic Radial Glows -->
    <div style="position: absolute; top: 10%; left: 10%; width: 600px; height: 600px; background: radial-gradient(circle, #9333ea15 0%, transparent 60%); filter: blur(40px); border-radius: 50%;"></div>
    <div style="position: absolute; bottom: 10%; right: 15%; width: 500px; height: 500px; background: radial-gradient(circle, #ea580c20 0%, transparent 70%); filter: blur(30px); border-radius: 50%;"></div>
    <div style="position: absolute; top: 50%; left: 50%; width: 800px; height: 800px; background: radial-gradient(circle, #8b5cf608 0%, transparent 80%); filter: blur(60px); border-radius: 50%; transform: translate(-50%, -50%);"></div>
    
    <!-- Floating Particles -->
    <div style="position: absolute; inset: 0;">
      <div style="position: absolute; top: 12%; left: 8%; width: 4px; height: 4px; background: #9333ea; border-radius: 50%; box-shadow: 0 0 15px #9333ea80;"></div>
      <div style="position: absolute; top: 25%; right: 12%; width: 3px; height: 3px; background: #ea580c; border-radius: 50%; box-shadow: 0 0 10px #ea580c60;"></div>
      <div style="position: absolute; top: 65%; left: 15%; width: 5px; height: 5px; background: #8b5cf6; border-radius: 50%; box-shadow: 0 0 20px #8b5cf680;"></div>
      <div style="position: absolute; bottom: 20%; right: 20%; width: 2px; height: 2px; background: #ffffff; border-radius: 50%; box-shadow: 0 0 8px #ffffff40;"></div>
      <div style="position: absolute; top: 40%; left: 6%; width: 3px; height: 3px; background: #ea580c; border-radius: 50%; box-shadow: 0 0 12px #ea580c60;"></div>
      <div style="position: absolute; bottom: 35%; left: 85%; width: 4px; height: 4px; background: #9333ea; border-radius: 50%; box-shadow: 0 0 15px #9333ea50;"></div>
    </div>
    
    <!-- Enhanced Tech Grid -->
    <div style="position: absolute; inset: 0; opacity: 0.08;">
      <div style="
        background-image: 
          linear-gradient(#9333ea40 1px, transparent 1px),
          linear-gradient(90deg, #9333ea40 1px, transparent 1px);
        background-size: 40px 40px;
        width: 100%;
        height: 100%;
      "></div>
      <div style="
        background-image: 
          linear-gradient(#ea580c20 1px, transparent 1px),
          linear-gradient(90deg, #ea580c20 1px, transparent 1px);
        background-size: 80px 80px;
        width: 100%;
        height: 100%;
        transform: translate(20px, 20px);
      "></div>
    </div>
    
    <!-- Circuit Pattern Networks -->
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 100%;">
      <div style="position: absolute; top: 15%; left: -10%; width: 120%; height: 3px; background: linear-gradient(90deg, transparent, #9333ea60, #9333ea80, #9333ea60, transparent); transform: rotate(-8deg); box-shadow: 0 0 15px #9333ea50;"></div>
      <div style="position: absolute; top: 35%; right: -10%; width: 120%; height: 2px; background: linear-gradient(90deg, transparent, #ea580c50, #ea580c70, transparent); transform: rotate(12deg); box-shadow: 0 0 10px #ea580c40;"></div>
      <div style="position: absolute; bottom: 30%; left: -10%; width: 120%; height: 3px; background: linear-gradient(90deg, transparent, #8b5cf655, #8b5cf675, #8b5cf655, transparent); transform: rotate(-5deg); box-shadow: 0 0 12px #8b5cf645;"></div>
    </div>
    
    <!-- Enhanced Geometric Elements -->
    <div style="position: absolute; inset: 0;">
      <div style="position: absolute; top: -80px; left: -80px; width: 200px; height: 200px; border: 3px solid #9333ea40; transform: rotate(45deg); border-radius: 20px; box-shadow: 0 0 25px #9333ea25;"></div>
      <div style="position: absolute; top: -40px; right: -40px; width: 150px; height: 150px; border: 2px solid #ea580c30; border-radius: 50%; box-shadow: 0 0 20px #ea580c20;"></div>
      <div style="position: absolute; bottom: -60px; right: -60px; width: 180px; height: 180px; border: 3px solid #8b5cf635; transform: rotate(-20deg); border-radius: 15px; box-shadow: 0 0 25px #8b5cf620;"></div>
      <div style="position: absolute; bottom: -50px; left: -50px; width: 160px; height: 160px; border: 2px solid #9333ea25; border-radius: 50%; box-shadow: 0 0 15px #9333ea15;"></div>
    </div>

    <!-- Enhanced Header Section -->
    <div style="text-align: center; margin-bottom: 50px; position: relative; z-index: 100;">
      <!-- Simple centered header like the individual export -->
      <div style="
        background: linear-gradient(135deg, #1f2937, #374151); 
        color: white; 
        display: inline-block; 
        padding: 25px 80px;
        position: relative;
        clip-path: polygon(0 0, calc(100% - 25px) 0, 100% 100%, 25px 100%);
        margin-bottom: 20px;
        border: 2px solid #9333ea60;
        box-shadow: 0 0 40px #9333ea40, 0 0 80px #9333ea20;
      ">
        <!-- Team Color Accent Bar -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #9333ea, #ea580c, #9333ea); box-shadow: 0 0 15px #9333ea60;"></div>
        
        <div style="font-size: 32px; font-weight: 900; margin: 0 0 8px 0; letter-spacing: 2px; text-shadow: 0 0 20px #9333ea50;">CDLROSTERBUILDER.COM</div>
        <div style="font-size: 16px; font-weight: 700; margin: 0; letter-spacing: 1px; color: #94a3b8;">My Lineup Predictions for the New Season!</div>
      </div>
    </div>

    <!-- Enhanced Teams Grid -->
    <div style="
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 25px;
      position: relative;
      z-index: 50;
    ">
      ${teamsHTML}
    </div>
    
    <!-- Enhanced Footer Logo -->
    <div style="position: absolute; bottom: 30px; right: 40px; z-index: 100;">
      <div style="
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #9333ea, #ea580c);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 25px #9333ea70, 0 0 50px #9333ea40;
        border: 2px solid rgba(255,255,255,0.2);
        overflow: hidden;
        position: relative;
      ">
        <!-- Enhanced Inner Glow -->
        <div style="position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 20%, #9333ea25 100%); border-radius: 50%;"></div>
        
        <img 
          src="/apple-touch-icon.png" 
          style="
            width: 30px;
            height: 30px;
            object-fit: contain;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.9));
            z-index: 10;
            position: relative;
          "
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        />
        <span style="
          display: none;
          font-size: 24px;
          font-weight: 900;
          color: white;
          text-shadow: 0 2px 6px rgba(0,0,0,0.9);
          z-index: 10;
          position: relative;
        ">R</span>
      </div>
    </div>
  `;

  document.body.appendChild(exportContainer);

  try {
    const canvas = await html2canvas(exportContainer, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      width: 1400,
      height: exportContainer.offsetHeight,
      allowTaint: true
    });

    const link = document.createElement('a');
    link.download = `cdl-all-rosters-enhanced-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } finally {
    document.body.removeChild(exportContainer);
  }
};

const handleExportTeam = async (teamId: string) => {
  await generateEnhancedTeamExport(teamId);
};

const handleExportRosters = async () => {
  await generateProfessionalAllTeamsExport();
};

  const calculateTeamStats = (players: (Player | null)[]) => {
    const validPlayers = players.filter((p): p is Player => p !== null);
    if (validPlayers.length === 0) {
      return {
        hp_k10m: 0, hp_dmg10m: 0, hp_obj10m: 0,
        snd_kpr: 0, first_bloods_per_snd_map: 0, plants_defuses_per_snd_map: 0,
        ctl_k10m: 0, ctl_dmg10m: 0, zone_captures_per_ctl_map: 0
      };
    }

    const count = validPlayers.length;
    
    const playersWithDerived = validPlayers.map(player => {
      const sndMaps = (player as any).snd_maps || ((player as any).total_maps ? Math.round(((player as any).total_maps * 0.33)) : 10);
      const ctlMaps = (player as any).ctl_maps || ((player as any).total_maps ? Math.round(((player as any).total_maps * 0.33)) : 10);
      
      return {
        ...player,
        first_bloods_per_snd_map: sndMaps > 0 ? (player.first_bloods || 0) / sndMaps : 0,
        plants_defuses_per_snd_map: sndMaps > 0 ? (player.plants_defuses_combined || 0) / sndMaps : 0,
        zone_captures_per_ctl_map: ctlMaps > 0 ? (player.zone_captures || 0) / ctlMaps : 0
      };
    });
    

    return {
      hp_k10m: playersWithDerived.reduce((sum, p) => sum + (p.hp_k10m || 0), 0) / count,
      hp_dmg10m: playersWithDerived.reduce((sum, p) => sum + (p.hp_dmg10m || 0), 0) / count,
      hp_obj10m: playersWithDerived.reduce((sum, p) => sum + (p.hp_obj10m || 0), 0) / count,
      snd_kpr: playersWithDerived.reduce((sum, p) => sum + (p.snd_kpr || 0), 0) / count,
      first_bloods_per_snd_map: playersWithDerived.reduce((sum, p) => sum + (p.first_bloods_per_snd_map || 0), 0) / count,      plants_defuses_per_snd_map: playersWithDerived.reduce((sum, p) => sum + p.plants_defuses_per_snd_map, 0) / count,
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
      'snd_kpr', 'first_bloods_per_snd_map', 'plants_defuses_per_snd_map',
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
              <li>Place <code>cdl_roles_corrected.csv</code> in the <code>public/</code> folder</li>
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
                  console.log(' Dual-Pool System Debug:', rankings);
                  
                  // Show some example player breakdowns
                  const allCombinedPlayers = ratingSystem.getAllPlayers();
                  const exampleCDL = allCombinedPlayers.find(p => p.pool === 'CDL');
                  const exampleChallengers = allCombinedPlayers.find(p => p.pool === 'Challengers');
                  
                  if (exampleCDL) {
                    console.log(' Example CDL player breakdown:', ratingSystem.getPlayerBreakdown(exampleCDL));
                  }
                  if (exampleChallengers) {
                    console.log(' Example Challengers player breakdown:', ratingSystem.getPlayerBreakdown(exampleChallengers));
                  }
                }}
                className="text-xs text-orange-400 hover:text-orange-300 underline"
              >
                Debug Dual-Pool System
              </button>
            </div>
          )}
        </div>
          <h2 className="text-xl font-black text-center mb-8 tracking-wide">
            Call Of Duty League <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">Esports Team Cards</span>
          </h2>


        {/* Mobile responsive grid - single column on mobile, 2 columns on large screens */}
        <div ref={rostersRef} className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {displayTeams.map((team, teamIndex) => (
            <div key={team.id} className="relative">
              {/* Ranking Badge - only show if custom rankings exist */}
              {Object.keys(customRankings).length > 0 && (
                <div className="absolute -top-2 -left-2 w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm z-10 shadow-lg">
                  {customRankings[team.id] || (teamIndex + 1)}
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

      <Analytics /> 
    </div>
  );
}