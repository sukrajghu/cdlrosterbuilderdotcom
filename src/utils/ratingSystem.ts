import { Player } from '../dats/players';

// Individual stat rating for a player
interface StatRating {
  stat: string;
  value: number;
  rank: number;
  rating: number;
}

// Game mode ratings (best 2 of 3)
interface GameModeRatings {
  hp: StatRating[];
  snd: StatRating[];
  ctl: StatRating[];
  bestHP: StatRating[];
  bestSND: StatRating[];
  bestCTL: StatRating[];
}

// Combined player data structure
interface CombinedPlayer extends Player {
  cdl_games: number;
  challengers_games: number;
  pool: 'CDL' | 'Challengers';
  combined_stats: {
    hp_k10m: number;
    hp_dmg10m: number;
    hp_obj10m: number;
    snd_kpr: number;
    first_bloods_per_snd_map: number;  // Changed from first_bloods to normalize by SND maps played
    plants_defuses_per_snd_map: number;
    ctl_k10m: number;
    ctl_dmg10m: number;
    zone_captures_per_ctl_map: number;
  };
}

export class EnhancedRatingSystem {
  private allPlayers: CombinedPlayer[] = [];
  private cdlPoolARs: CombinedPlayer[] = [];
  private cdlPoolSMGs: CombinedPlayer[] = [];
  private challengersPoolARs: CombinedPlayer[] = [];
  private challengersPoolSMGs: CombinedPlayer[] = [];
  private cdlAverages: { [key: string]: number } = {};

  constructor(cdlPlayers: Player[], challengersPlayers: Player[]) {
    this.mergeAndCombinePlayers(cdlPlayers, challengersPlayers);
    this.calculateCDLAverages();
    this.separatePlayersByPool();
  }

  /**
   * Merge duplicate players and combine their stats
   */
  private mergeAndCombinePlayers(cdlPlayers: Player[], challengersPlayers: Player[]): void {
    const playerMap = new Map<string, CombinedPlayer>();

    // Process CDL players first
    cdlPlayers.forEach(player => {
      const normalizedName = player.player_name.toLowerCase().trim();
      const cdlGames = (player as any).total_maps || 0;
      
      // Add derived stats
      const sndMaps = (player as any).snd_maps || (cdlGames > 0 ? Math.round(cdlGames * 0.33) : 10);
      const ctlMaps = (player as any).ctl_maps || (cdlGames > 0 ? Math.round(cdlGames * 0.33) : 10);
      
      const combinedPlayer: CombinedPlayer = {
        ...player,
        id: `combined_${normalizedName.replace(/[^a-z0-9]/g, '_')}`,
        cdl_games: cdlGames,
        challengers_games: 0,
        pool: cdlGames >= 35 ? 'CDL' : 'Challengers',
        combined_stats: {
          hp_k10m: player.hp_k10m || 0,
          hp_dmg10m: player.hp_dmg10m || 0,
          hp_obj10m: player.hp_obj10m || 0,
          snd_kpr: player.snd_kpr || 0,
          first_bloods_per_snd_map: sndMaps > 0 ? (player.first_bloods || 0) / sndMaps : 0,
          plants_defuses_per_snd_map: sndMaps > 0 ? (player.plants_defuses_combined || 0) / sndMaps : 0,
          ctl_k10m: player.ctl_k10m || 0,
          ctl_dmg10m: player.ctl_dmg10m || 0,
          zone_captures_per_ctl_map: ctlMaps > 0 ? (player.zone_captures || 0) / ctlMaps : 0
        }
      };

      playerMap.set(normalizedName, combinedPlayer);
    });

    // Process Challengers players and merge with CDL data
    challengersPlayers.forEach(challengersPlayer => {
      const normalizedName = challengersPlayer.player_name.toLowerCase().trim();
      const challengersGames = (challengersPlayer as any).total_maps || 0;
      
      // Add derived stats for challengers
      const sndMaps = (challengersPlayer as any).snd_maps || (challengersGames > 0 ? Math.round(challengersGames * 0.33) : 10);
      const ctlMaps = (challengersPlayer as any).ctl_maps || (challengersGames > 0 ? Math.round(challengersGames * 0.33) : 10);
      
      const challengersStats = {
        hp_k10m: challengersPlayer.hp_k10m || 0,
        hp_dmg10m: challengersPlayer.hp_dmg10m || 0,
        hp_obj10m: challengersPlayer.hp_obj10m || 0,
        snd_kpr: challengersPlayer.snd_kpr || 0,
        first_bloods_per_snd_map: sndMaps > 0 ? (challengersPlayer.first_bloods || 0) / sndMaps : 0,
        plants_defuses_per_snd_map: sndMaps > 0 ? (challengersPlayer.plants_defuses_combined || 0) / sndMaps : 0,
        ctl_k10m: challengersPlayer.ctl_k10m || 0,
        ctl_dmg10m: challengersPlayer.ctl_dmg10m || 0,
        zone_captures_per_ctl_map: ctlMaps > 0 ? (challengersPlayer.zone_captures || 0) / ctlMaps : 0
      };

      if (playerMap.has(normalizedName)) {
        // Merge with existing CDL player
        const existingPlayer = playerMap.get(normalizedName)!;
        existingPlayer.challengers_games = challengersGames;
        
        // Apply weighting based on CDL games
        const cdlGames = existingPlayer.cdl_games;
        let cdlWeight: number, challengersWeight: number;
        
        if (cdlGames >= 35) {
          cdlWeight = 0.95;
          challengersWeight = 0.05;
        } else if (cdlGames >= 20) {
          cdlWeight = 0.80;
          challengersWeight = 0.20;
        } else if (cdlGames >= 11) {
          cdlWeight = 0.65;
          challengersWeight = 0.35;
        } else {
          cdlWeight = 0.50;
          challengersWeight = 0.50;
        }

        // Combine stats with weighting
        Object.keys(existingPlayer.combined_stats).forEach(statKey => {
          const cdlValue = (existingPlayer.combined_stats as any)[statKey];
          const challengersValue = (challengersStats as any)[statKey];
          (existingPlayer.combined_stats as any)[statKey] = (cdlValue * cdlWeight) + (challengersValue * challengersWeight);
        });

      } else {
        // Create new player (Challengers only)
        const combinedPlayer: CombinedPlayer = {
          ...challengersPlayer,
          id: `combined_${normalizedName.replace(/[^a-z0-9]/g, '_')}`,
          cdl_games: 0,
          challengers_games: challengersGames,
          pool: 'Challengers',
          combined_stats: challengersStats
        };

        playerMap.set(normalizedName, combinedPlayer);
      }
    });

    this.allPlayers = Array.from(playerMap.values());
    console.log(`Merged players: ${this.allPlayers.length} unique players from ${cdlPlayers.length} CDL + ${challengersPlayers.length} Challengers`);
  }

  /**
   * Calculate CDL averages for normalization
   */
  private calculateCDLAverages(): void {
    const cdlQualifiedPlayers = this.allPlayers.filter(p => p.cdl_games >= 35);
    
    if (cdlQualifiedPlayers.length === 0) {
      console.warn('No CDL qualified players found for averages calculation');
      return;
    }

    const statKeys = Object.keys(cdlQualifiedPlayers[0].combined_stats);
    
    statKeys.forEach(statKey => {
      const total = cdlQualifiedPlayers.reduce((sum, player) => {
        return sum + ((player.combined_stats as any)[statKey] || 0);
      }, 0);
      
      this.cdlAverages[statKey] = total / cdlQualifiedPlayers.length;
    });

    console.log('CDL Averages calculated:', this.cdlAverages);
  }

  /**
   * Separate players by pool and role
   */
  private separatePlayersByPool(): void {
    this.cdlPoolARs = this.allPlayers.filter(p => p.pool === 'CDL' && p.role === 'AR');
    this.cdlPoolSMGs = this.allPlayers.filter(p => p.pool === 'CDL' && p.role === 'SMG');
    this.challengersPoolARs = this.allPlayers.filter(p => p.pool === 'Challengers' && p.role === 'AR');
    this.challengersPoolSMGs = this.allPlayers.filter(p => p.pool === 'Challengers' && p.role === 'SMG');
    
    console.log(`Pool separation - CDL ARs: ${this.cdlPoolARs.length}, CDL SMGs: ${this.cdlPoolSMGs.length}`);
    console.log(`Challengers ARs: ${this.challengersPoolARs.length}, Challengers SMGs: ${this.challengersPoolSMGs.length}`);
  }

  /**
   * Normalize challengers stats against CDL averages
   */
  private normalizeChallengersStats(player: CombinedPlayer): { [key: string]: number } {
    const normalizedStats: { [key: string]: number } = {};
    
    Object.keys(player.combined_stats).forEach(statKey => {
      const playerStat = (player.combined_stats as any)[statKey] || 0;
      const cdlAverage = this.cdlAverages[statKey] || 0;
      
      if (cdlAverage === 0) {
        normalizedStats[statKey] = playerStat;
        return;
      }
      
      if (playerStat >= cdlAverage) {
        // If player stat >= CDL average: average of both
        normalizedStats[statKey] = (playerStat + cdlAverage) / 2;
      } else {
        // If player stat < CDL average: average of both, then subtract the difference (double penalty)
        const average = (playerStat + cdlAverage) / 2;
        const difference = cdlAverage - average;
        normalizedStats[statKey] = playerStat - difference;
      }
    });
    
    return normalizedStats;
  }

  /**
   * Convert rank to CDL rating scale (99-50)
   */
  private rankToCDLRating(rank: number): number {
    if (rank === 1) return 99;
    if (rank === 2) return 97;
    if (rank === 3) return 95;
    if (rank === 4) return 93;
    if (rank === 5) return 91;
    if (rank === 6) return 89;
    if (rank === 7) return 87;
    if (rank === 8) return 85;
    if (rank === 9) return 83;
    if (rank === 10) return 81;
    if (rank === 11) return 79;
    if (rank === 12) return 77;
    if (rank === 13) return 75;
    if (rank === 14) return 73;
    if (rank === 15) return 71;
    if (rank === 16) return 69;
    if (rank === 17) return 67;
    if (rank === 18) return 65;
    if (rank === 19) return 63;
    if (rank === 20) return 61;
    if (rank === 21) return 59;
    if (rank === 22) return 57;
    /*if (rank === 23) return 55;
    if (rank === 24) return 53;
    if (rank === 25) return 51;
    if (rank >= 26) return 50;*/
    if (rank >= 23) return 55;
    return 55;
  }

  /**
   * Convert rank to Challengers rating scale (80-50)
   */
  private rankToChallengersRating(rank: number, totalPlayers: number): number {
    if (totalPlayers <= 1) return 80;
    
    // Scale 80 down to 50, decreasing by 2s
    // 80, 78, 76, 74, 72, 70, 68, 66, 64, 62, 60, 58, 56, 54, 52, 50
    const maxRating = 75;
    const minRating = 50;
    const step = 2;
    
    const rating = maxRating - ((rank - 1) * step);
    return Math.max(minRating, rating);
  }

  /**
   * Rank players within their role and pool for a specific stat
   */
  private rankPlayersByStat(players: CombinedPlayer[], statName: string, useNormalized: boolean = false): Map<string, number> {
    const rankMap = new Map<string, number>();
    
    // Filter players who have this stat
    const playersWithStat = players.filter(p => {
      const statValue = useNormalized ? 
        this.normalizeChallengersStats(p)[statName] : 
        (p.combined_stats as any)[statName];
      return statValue !== null && statValue !== undefined && !isNaN(statValue);
    });
    
    if (playersWithStat.length === 0) {
      return rankMap;
    }
    
    // Sort by stat value (highest first)
    playersWithStat.sort((a, b) => {
      const aValue = useNormalized ? 
        this.normalizeChallengersStats(a)[statName] : 
        (a.combined_stats as any)[statName];
      const bValue = useNormalized ? 
        this.normalizeChallengersStats(b)[statName] : 
        (b.combined_stats as any)[statName];
      return bValue - aValue;
    });
    
    // Assign ranks (1 = best)
    playersWithStat.forEach((player, index) => {
      rankMap.set(player.id, index + 1);
    });
    
    return rankMap;
  }

  /**
   * Calculate stat rating for a player
   */
  private calculateStatRating(player: CombinedPlayer, statName: string): StatRating {
    const playerRole = player.role;
    const playerPool = player.pool;
    
    let rolePlayers: CombinedPlayer[];
    let useNormalized = false;
    let rankToRatingFunc: (rank: number, total?: number) => number;
    
    if (playerPool === 'CDL') {
      rolePlayers = playerRole === 'AR' ? this.cdlPoolARs : this.cdlPoolSMGs;
      rankToRatingFunc = this.rankToCDLRating;
    } else {
      rolePlayers = playerRole === 'AR' ? this.challengersPoolARs : this.challengersPoolSMGs;
      useNormalized = true;
      rankToRatingFunc = (rank: number) => this.rankToChallengersRating(rank, rolePlayers.length);
    }
    
    // Get rank within role and pool for this stat
    const rankMap = this.rankPlayersByStat(rolePlayers, statName, useNormalized);
    const rank = rankMap.get(player.id) || rolePlayers.length;
    
    // Convert rank to rating
    const rating = rankToRatingFunc(rank, rolePlayers.length);
    
    // Get stat value (normalized if Challengers)
    const statValue = useNormalized ? 
      this.normalizeChallengersStats(player)[statName] : 
      (player.combined_stats as any)[statName] || 0;
    
    return {
      stat: statName,
      value: statValue,
      rank: rank,
      rating: rating
    };
  }

  /**
   * Calculate game mode ratings for a player
   */
  private calculateGameModeRatings(player: CombinedPlayer): GameModeRatings {
    // Hardpoint stats
    const hp = [
      this.calculateStatRating(player, 'hp_k10m'),
      this.calculateStatRating(player, 'hp_dmg10m'),
      this.calculateStatRating(player, 'hp_obj10m')
    ];

    // Search & Destroy stats
    const snd = [
      this.calculateStatRating(player, 'snd_kpr'),
      this.calculateStatRating(player, 'first_bloods_per_snd_map'),  // Updated stat name
      this.calculateStatRating(player, 'plants_defuses_per_snd_map')
    ];

    // Control stats
    const ctl = [
      this.calculateStatRating(player, 'ctl_k10m'),
      this.calculateStatRating(player, 'ctl_dmg10m'),
      this.calculateStatRating(player, 'zone_captures_per_ctl_map')
    ];

    // Get best 2 of 3 for each mode
    const bestHP = this.getBest2Of3(hp);
    const bestSND = this.getBest2Of3(snd);
    const bestCTL = this.getBest2Of3(ctl);

    return {
      hp,
      snd,
      ctl,
      bestHP,
      bestSND,
      bestCTL
    };
  }

  /**
   * Get best 2 of 3 stats (remove the lowest rating)
   */
  private getBest2Of3(stats: StatRating[]): StatRating[] {
    return stats
      .sort((a, b) => b.rating - a.rating) // Sort by rating (highest first)
      .slice(0, 2); // Take best 2
  }

  /**
   * Calculate overall rating for a player
   */
  public calculatePlayerRating(player: CombinedPlayer): number {
    const gameModeRatings = this.calculateGameModeRatings(player);
    
    // Combine best 2 from each game mode (6 total ratings)
    const best6Ratings = [
      ...gameModeRatings.bestHP,
      ...gameModeRatings.bestSND,
      ...gameModeRatings.bestCTL
    ];

    // Calculate average of the 6 ratings
    const averageRating = best6Ratings.reduce((sum, stat) => sum + stat.rating, 0) / 6;

    return Math.round(averageRating * 100) / 100;
  }

  /**
   * Calculate ratings for all players
   */
  public calculateAllRatings(): Map<string, number> {
    const ratings = new Map<string, number>();
    
    this.allPlayers.forEach(player => {
      const rating = this.calculatePlayerRating(player);
      ratings.set(player.id, rating);
    });

    return ratings;
  }

  /**
   * Get all players in the new combined format
   */
  public getAllPlayers(): CombinedPlayer[] {
    return this.allPlayers;
  }

  /**
   * Convert CombinedPlayer back to original Player format for compatibility
   */
  public getPlayersInOriginalFormat(): Player[] {
    return this.allPlayers.map(combinedPlayer => {
      const originalPlayer: Player = {
        id: combinedPlayer.id,
        player_name: combinedPlayer.player_name,
        role: combinedPlayer.role,
        slayer_rating: combinedPlayer.slayer_rating,
        hp_k10m: combinedPlayer.combined_stats.hp_k10m,
        hp_dmg10m: combinedPlayer.combined_stats.hp_dmg10m,
        hp_obj10m: combinedPlayer.combined_stats.hp_obj10m,
        hp_eng10m: combinedPlayer.hp_eng10m,
        snd_kpr: combinedPlayer.combined_stats.snd_kpr,
        first_bloods: combinedPlayer.first_bloods, // Keep original for compatibility
        opd_win_pct_decimal: combinedPlayer.opd_win_pct_decimal,
        plants_defuses_combined: combinedPlayer.plants_defuses_combined,
        ctl_k10m: combinedPlayer.combined_stats.ctl_k10m,
        ctl_dmg10m: combinedPlayer.combined_stats.ctl_dmg10m,
        ctl_eng10m: combinedPlayer.ctl_eng10m,
        zone_captures: combinedPlayer.zone_captures,
        total_maps: Math.max(combinedPlayer.cdl_games, combinedPlayer.challengers_games),
        game_time_min: combinedPlayer.game_time_min
      };

      return originalPlayer;
    });
  }

  /**
   * Get player rankings and ratings (for debugging)
   */
  public getPlayerRankings(): any {
    const allPlayersWithRatings = this.allPlayers.map(p => ({
      name: p.player_name,
      role: p.role,
      pool: p.pool,
      cdlGames: p.cdl_games,
      challengersGames: p.challengers_games,
      rating: this.calculatePlayerRating(p)
    }));

    // Sort by rating (highest first)
    allPlayersWithRatings.sort((a, b) => b.rating - a.rating);

    return {
      all: allPlayersWithRatings,
      byPool: {
        CDL: allPlayersWithRatings.filter(p => p.pool === 'CDL'),
        Challengers: allPlayersWithRatings.filter(p => p.pool === 'Challengers')
      },
      byRole: {
        AR: allPlayersWithRatings.filter(p => p.role === 'AR'),
        SMG: allPlayersWithRatings.filter(p => p.role === 'SMG')
      },
      counts: {
        total: allPlayersWithRatings.length,
        cdlPool: this.cdlPoolARs.length + this.cdlPoolSMGs.length,
        challengersPool: this.challengersPoolARs.length + this.challengersPoolSMGs.length
      }
    };
  }

  /**
   * Get detailed breakdown for a player (for debugging)
   */
  public getPlayerBreakdown(player: CombinedPlayer): any {
    const gameModeRatings = this.calculateGameModeRatings(player);
    const finalRating = this.calculatePlayerRating(player);
    const normalizedStats = player.pool === 'Challengers' ? this.normalizeChallengersStats(player) : null;

    return {
      player: player.player_name,
      role: player.role,
      pool: player.pool,
      cdlGames: player.cdl_games,
      challengersGames: player.challengers_games,
      combinedStats: player.combined_stats,
      normalizedStats: normalizedStats,
      hardpoint: {
        all: gameModeRatings.hp,
        best2: gameModeRatings.bestHP,
        average: gameModeRatings.bestHP.reduce((sum, s) => sum + s.rating, 0) / 2
      },
      searchAndDestroy: {
        all: gameModeRatings.snd,
        best2: gameModeRatings.bestSND,
        average: gameModeRatings.bestSND.reduce((sum, s) => sum + s.rating, 0) / 2
      },
      control: {
        all: gameModeRatings.ctl,
        best2: gameModeRatings.bestCTL,
        average: gameModeRatings.bestCTL.reduce((sum, s) => sum + s.rating, 0) / 2
      },
      finalRating
    };
  }
}