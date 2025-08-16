export interface Player {
  id: string;
  player_name: string;
  role: 'AR' | 'SMG';
  slayer_rating: number;
  hp_k10m?: number;
  hp_dmg10m?: number;
  hp_obj10m?: number;
  hp_eng10m?: number;
  snd_kpr?: number;
  first_bloods?: number;
  opd_win_pct_decimal?: number;
  plants_defuses_combined?: number;
  ctl_k10m?: number;
  ctl_dmg10m?: number;
  ctl_eng10m?: number;
  zone_captures?: number;
  total_maps?: number;
  game_time_min?: number;
  avatar?: string;
}

// This will be populated by loading the CSV file
export let PLAYERS_DATA: Player[] = []; 