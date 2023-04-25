import pandas as pd
from .. Neo4j_Player_Worker import Player_Worker as Worker
from tqdm import tqdm

class TennisEditor:
    def __init__(self, data):
        """Preferably, data should come from https://github.com/JeffSackmann/tennis_atp"""
        self.data = data
        self.prepare_historic_data()

    def find_matches_by_id(self, id):
        """Needed for aggregating data about individuals"""
        # Initialize the dataframes as empty but with the same columns as the original dataframe
        id_won_matches_2022 = pd.DataFrame(columns=self.data.columns)
        id_lost_matches_2022 = pd.DataFrame(columns=self.data.columns)

        # Find the rows where name is present in the winner_name or loser_name columns
        if len(self.data[self.data['winner_id'] == id]) > 0:
            id_won_matches_2022 = self.data[self.data['winner_id'] == id]
        if len(self.data[self.data['loser_id'] == id]) > 0:
            id_lost_matches_2022 = self.data[self.data['loser_id'] == id]
        id_matches_2022 = pd.concat([id_won_matches_2022, id_lost_matches_2022])
        
        id_matches_index = id_matches_2022.index

        # Get the name of the player
        name = id_matches_2022.iloc[0]['winner_name'] if id_matches_2022.iloc[0]['winner_id'] == id else id_matches_2022.iloc[0]['loser_name']

        # As a dictionary, return the name of the player, a list of the index numbers of the rows where the player is present and the ratio of the player's presence in the winner_name to loser_name columns
        return {'name': name, 'id': id, 'matches': [id_matches_index]}
    
    def make_person(self, id):
            # From all people, get the row where the winner_id is equal to the id
        index = self.find_matches_by_id(id)['matches']

        # Get the rows from the matches dataframe based on the index, split into won and lost
        matches = self.data.iloc[index[0]]
        won_matches = matches.loc[self.data['winner_id'] == id]
        lost_matches = matches.loc[self.data['loser_id'] == id]

        # Do it this way to prevent single positional indexer is out-of-bounds error
        use_won_matches = True if len(won_matches) > 0 else False
        name = won_matches.iloc[0]['winner_name'] if use_won_matches else lost_matches.iloc[0]['loser_name']
        rank = won_matches.iloc[0]['winner_rank'] if use_won_matches else lost_matches.iloc[0]['loser_rank']
        rank_points = won_matches.iloc[0]['winner_rank_points'] if use_won_matches else lost_matches.iloc[0]['loser_rank_points']

        # Create a dictionary of lists of wanted properties (same as above), using the won_matches and lost_matches dataframes
        person = {
            'name': name,
            'id': id,
            'rank': rank,
            'rank_points': rank_points,
            'matches_2022': index,
            'won_matches_2022': len(won_matches),
            'lost_matches_2022': len(lost_matches),
            'win_percent': len(won_matches) / len(matches),
            'latest_date': matches.iloc[0]['tourney_date'],
            'tourney_names': list(matches['tourney_name'].unique()),
            # summed stats
            'sum_aces': won_matches['w_ace'].sum() + lost_matches['l_ace'].sum(),
            'sum_double_faults': won_matches['w_df'].sum() + lost_matches['l_df'].sum(),
            'sum_service_points': won_matches['w_svpt'].sum() + lost_matches['l_svpt'].sum(),
            'sum_first_serve_points': won_matches['w_1stIn'].sum() + lost_matches['l_1stIn'].sum(),
            'sum_first_serve_points_won': won_matches['w_1stWon'].sum() + lost_matches['l_1stWon'].sum(),
            'sum_second_serve_points_won': won_matches['w_2ndWon'].sum() + lost_matches['l_2ndWon'].sum(),
            'sum_serve_games': won_matches['w_SvGms'].sum() + lost_matches['l_SvGms'].sum(),
            'sum_break_points_saved': won_matches['w_bpSaved'].sum() + lost_matches['l_bpSaved'].sum(),
            'sum_break_points_faced': won_matches['w_bpFaced'].sum() + lost_matches['l_bpFaced'].sum(),
            # average stats
            'avg_aces': (won_matches['w_ace'].sum() + lost_matches['l_ace'].sum()) / len(matches),
            'avg_double_faults': (won_matches['w_df'].sum() + lost_matches['l_df'].sum()) / len(matches),
            'avg_service_points': (won_matches['w_svpt'].sum() + lost_matches['l_svpt'].sum()) / len(matches),
            'avg_first_serve_points': (won_matches['w_1stIn'].sum() + lost_matches['l_1stIn'].sum()) / len(matches),
            'avg_first_serve_points_won': (won_matches['w_1stWon'].sum() + lost_matches['l_1stWon'].sum()) / len(matches),
            'avg_second_serve_points_won': (won_matches['w_2ndWon'].sum() + lost_matches['l_2ndWon'].sum()) / len(matches),
            'avg_serve_games': (won_matches['w_SvGms'].sum() + lost_matches['l_SvGms'].sum()) / len(matches),
            'avg_break_points_saved': (won_matches['w_bpSaved'].sum() + lost_matches['l_bpSaved'].sum()) / len(matches),
            'avg_break_points_faced': (won_matches['w_bpFaced'].sum() + lost_matches['l_bpFaced'].sum()) / len(matches)
        }
        
        return person

    def prepare_historic_data(self):
        """Prepares the data for the database"""
        unique_ids = set(list(self.data['winner_id'].unique()) + list(self.data['loser_id'].unique()))

        # Do this using tqdm to show progress
        all_players = []
        for id in tqdm(unique_ids):
            person = self.make_person(id)
            all_players.append(person)

        # Get list of all matches as dictionaries, without columns related to the general winner or loser data
        all_matches = self.data[[col for col in self.data.columns if 'loser' not in col and 'winner' not in col]].to_dict('records')
        
        # Create a dictionary of all people and all matches
        self.players = all_players
        self.matches = all_matches


    def upload_players_to_db(self):
        """Uploads all players to the database"""
        worker = Worker()
        for player in tqdm(self.players):
            # Create a new player in the database
            worker.create_player(name=player['name'], player_id=player['id'])
            # Using worker.add_data_to_player, upload the following data points: name, player_id, rank, rank_points, win_count, loss_count, tournaments_played, win_percent, aces_avg, double_faults_avg, service_points_avg, first_serve_points_won_avg, second_serve_points_won_avg, serve_games_avg, break_points_saved_avg, break_points_faced_avg
            worker.add_data_to_player(name=player['name'], player_id=player['id'], rank=player['rank'], 
                                      rank_points=player['rank_points'], win_count=player['won_matches_2022'], 
                                      loss_count=player['lost_matches_2022'], tournaments_played=player['tourney_names'], 
                                      win_percent=player['win_percent'], aces_avg=player['avg_aces'], 
                                      double_faults_avg=player['avg_double_faults'], 
                                      service_points_avg=player['avg_service_points'], 
                                      first_serve_points_won_avg=player['avg_first_serve_points_won'], 
                                      second_serve_points_won_avg=player['avg_second_serve_points_won'], 
                                      serve_games_avg=player['avg_serve_games'], 
                                      break_points_saved_avg=player['avg_break_points_saved'], 
                                      break_points_faced_avg=player['avg_break_points_faced'])
        worker.close()


    def upload_matches_to_db(self):
        """Uploads all matches to the database"""
        worker = Worker()
        for match in tqdm(self.matches):
            # Create a new match in the database
            worker.create_match(tourney_id=match['tourney_id'], tourney_name=match['tourney_name'],
                                tourney_date=match['tourney_date'], match_num=match['match_num'],
                                winner_id=match['winner_id'], loser_id=match['loser_id'],
                                score=match['score'], best_of=match['best_of'], round=match['round'],
                                minutes=match['minutes'], w_ace=match['w_ace'], w_df=match['w_df'],
                                w_svpt=match['w_svpt'], w_1stIn=match['w_1stIn'], w_1stWon=match['w_1stWon'],
                                w_2ndWon=match['w_2ndWon'], w_SvGms=match['w_SvGms'], w_bpSaved=match['w_bpSaved'],
                                w_bpFaced=match['w_bpFaced'], l_ace=match['l_ace'], l_df=match['l_df'],
                                l_svpt=match['l_svpt'], l_1stIn=match['l_1stIn'], l_1stWon=match['l_1stWon'],
                                l_2ndWon=match['l_2ndWon'], l_SvGms=match['l_SvGms'], l_bpSaved=match['l_bpSaved'],
                                l_bpFaced=match['l_bpFaced'])
        worker.close()

    def connect_player_to_match(self):
        """Connects all players to all matches"""
        # worker = Worker()
        # for player in self.players:
        #     # Get all matches for the player
        #     matches = worker.find_matches_by_player_id(player['id'])
        #     for match in matches:
        #         # Connect the player to the match
        #         worker.connect_player_to_match(player['id'], match['id'])
        # worker.close()
        pass

    def find_match_by_player_name(self, player_name):
        """Finds a match by player name"""
        pass

