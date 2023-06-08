from .Neo4j_Relation_Worker import Relation_Worker
from .Neo4j_Similarity_Worker import Similarity_Worker
import numpy as np
import pandas as pd

class Recommender:
    def __init__(self, player_names):
        self.player_names = player_names

    def create_similarity_dfs(self):
        """This function will create a similarity matrix between all players
        The similarity matrix will be a dataframe with the index and columns being the player_name
        The values will be the similarity score between the two players"""
        similarity_worker = Similarity_Worker()
        similarity_types = ["all"]  # TODO don't have this hard-coded! Make a function in the similarity worker that returns the similarity types

        # Get all similar players for each player, and the similarity score, put that in a dataframe
        similarity_dfs = dict()
        for similarity_type in similarity_types:
            # Get all similarities of the specified type
            df = similarity_worker.get_all_similarities_of_type(similarity_type)

            # Pivot the dataframe to create a matrix
            df = df.pivot(index='player1', columns='player2', values='similarity')

            # Create a square dataframe with all players
            all_players_df = pd.DataFrame(index=self.player_names, columns=self.player_names)

            # Fill in the similarity scores
            for player1 in all_players_df.index:
                for player2 in all_players_df.columns:
                    if player1 in df.index and player2 in df.columns:
                        all_players_df.loc[player1, player2] = df.loc[player1, player2]
                    else:
                        all_players_df.loc[player1, player2] = np.nan

            # Store the dataframe in the dictionary
            similarity_dfs[similarity_type] = all_players_df

        self.similarity_dfs = similarity_dfs


    def recommend_individual(self, player_names, similarity_type, used_id=None):
        # TODO add filter options like "gender"
        # Take the list of names and find the similarity scores for each player. Then return the top "amount" players
        similarities = self.similarity_dfs[similarity_type][player_names].dropna()

        # Transform the dataframe to a list of tuples
        similarities = similarities.stack().reset_index().sort_values(0, ascending=False)

        # Rename the columns
        similarities.columns = ['rec_player', 'player', 'similarity']

        # Give 2 recs per player in the list
        similarities = similarities.groupby('player').head(2)

        if used_id is not None:
            # Save recommendation relation to database

            rec_players = similarities['rec_player'].unique()
            similarities = similarities[similarities['rec_player'].isin(rec_players)]

            relation_worker = Relation_Worker()
            prev_rec_players = relation_worker.get_player_recommendations(used_id)
            prev_rec_players = prev_rec_players['player_name'].unique()

            # Delete players from the db that were already recommended if they are not in rec_players
            for prev_rec_player in prev_rec_players:
                if prev_rec_player not in rec_players:
                    relation_worker.delete_player_recommendation(used_id, prev_rec_player)
                else:
                    rec_players = rec_players[rec_players != prev_rec_player]

            relation_worker.create_recommend_relations(used_id, rec_players, similarities, similarity_type)
            relation_worker.close()
        
        # Turn similarities into list of dictionaries
        similarities = similarities.to_dict('records')
        return similarities


# Get players from the database
# Compute similarity between players using euclidean similarity on the numeric features
# Compute cosine similarity between players using the categorical features
# Combine the two similarities using a weighted average based on the input of the user

# Return similar player based on the similarity score and an input player