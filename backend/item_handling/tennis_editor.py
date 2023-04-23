import pandas as pd
from datetime import datetime

class Tennis_Editor:
    def __init__(self, data):
        """Preferably, data should come from https://github.com/JeffSackmann/tennis_atp"""
        self.data = data

    def prepare_data(self):
        """Prepares the data for the database"""
        def prepare_players():
            """Prepares the players for the database"""
            pass

        def prepare_matches():
            """Prepares the matches for the database"""
            pass

        pass

    def create_player(self, name, player_id, rank, rank_points, win_count, lose_count, tournaments_played, win_percent, aces_avg, double_faults_avg, service_points_avg, first_serve_points_won_avg, second_serve_points_won_avg, serve_games_avg, break_points_saved_avg, break_points_faced_avg):
        """Creates a player in the database"""
        pass

    def create_match(self):
        """Creates a match in the database"""
        pass

    def find_match_by_player_name(self, player_name):
        """Finds a match by player name"""
        pass

