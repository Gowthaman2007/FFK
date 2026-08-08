export type Tournament = {
  id: string;
  name: string;
  number: number;
  date: string;
  status: "upcoming" | "live" | "completed";
  total_matches: number;
  current_match: number;
  created_at: string;
};

export type Team = {
  id: string;
  tournament_id: string;
  team_name: string;
  team_code: string;
  logo_url: string | null;
  created_at: string;
};

export type Match = {
  id: string;
  tournament_id: string;
  match_number: number;
  map: string | null;
  status: "upcoming" | "live" | "completed";
  start_time: string | null;
  end_time: string | null;
};

export type MatchResult = {
  id: string;
  match_id: string;
  team_id: string;
  placement: number | null;
  kills: number;
  placement_points: number;
  kill_points: number;
  total_points: number;
  updated_at: string;
};

export type ScoringRule = { id: string; tournament_id: string; placement: number; points: number };
export type TournamentSettings = { id: string; tournament_id: string; kill_point_value: number };

export type LeaderboardRow = {
  team_id: string;
  team_name: string;
  team_code: string;
  logo_url: string | null;
  matches_played: number;
  kills: number;
  placement_points: number;
  kill_points: number;
  total_points: number;
};
