# TODO: write something here
from ..database_workers.Neo4j_Player_Worker import Player_Worker
import numpy as np

class Similarity_Based_Recommender:
    def __init__(self):
        # Retrieve player data
        player_worker = Player_Worker()
        self.players_unscaled = player_worker.get_all_players_with_personal_data()
        player_worker.close()

    def scale_players(self):
        self.players = self.players_unscaled.copy()
        # Take the log of the rank and career_high_rank, as those are much more skewed than the other features, and this normalizes them.
        self.players['rank'] = self.players['rank'].apply(lambda x: np.log(x))
        self.players['career_high_rank'] = self.players['career_high_rank'].apply(lambda x: np.log(x))
        
        # Scale the numeric features to be between 0 and 1. These are: rank, age, height, career_high_rank, years_on_tour, career_high_year
        self.players['rank'] = (self.players['rank'] - self.players['rank'].min()) / (self.players['rank'].max() - self.players['rank'].min())
        self.players['age'] = (self.players['age'] - self.players['age'].min()) / (self.players['age'].max() - self.players['age'].min())
        self.players['height'] = (self.players['height'] - self.players['height'].min()) / (self.players['height'].max() - self.players['height'].min())
        self.players['career_high_rank'] = (self.players['career_high_rank'] - self.players['career_high_rank'].min()) / (self.players['career_high_rank'].max() - self.players['career_high_rank'].min())
        self.players['years_on_tour'] = (self.players['years_on_tour'] - self.players['years_on_tour'].min()) / (self.players['years_on_tour'].max() - self.players['years_on_tour'].min())
        self.players['career_high_year'] = (self.players['career_high_year'] - self.players['career_high_year'].min()) / (self.players['career_high_year'].max() - self.players['career_high_year'].min())

    def compute_euclidian_similarity(self):
        """Computes numeric similarity (1-distance) for all pairwise combinations of players"""
        
        

    def recommend(self, player_id):
        pass

# Get players from the database
# Compute similarity between players using euclidean similarity on the numeric features
# Compute cosine similarity between players using the categorical features
# Combine the two similarities using a weighted average based on the input of the user

# Return similar player based on the similarity score and an input player