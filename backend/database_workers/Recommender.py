from .Neo4j_Relation_Worker import Relation_Worker
from .Neo4j_Similarity_Worker import Similarity_Worker
from .Neo4j_Player_Worker import Player_Worker
from .Neo4j_User_Worker import User_Worker
import numpy as np
import pandas as pd
from datetime import datetime

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

            # Sort by 'similarity', placing NaNs at the end
            df = df.sort_values(by='similarity', ascending=False, na_position='last')

            # Remove duplicates, keeping the first (highest similarity) value
            df = df.drop_duplicates(subset=['player1', 'player2'])

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

            # Fill in the diagonal with 0, so as not to compare a player to themselves
            np.fill_diagonal(all_players_df.values, 0)

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
            prev_rec_players = relation_worker.get_player_recommend_relations(used_id)
            prev_rec_players = prev_rec_players['player_name'].unique()

            # Delete players from the db that were already recommended if they are not in rec_players
            for prev_rec_player in prev_rec_players:
                if prev_rec_player not in rec_players:
                    relation_worker.delete_player_recommend(used_id, prev_rec_player)
                else:
                    rec_players = rec_players[rec_players != prev_rec_player]

            relation_worker.create_player_recommend(used_id, rec_players, similarities, similarity_type)
            relation_worker.close()
        
        # Turn similarities into list of dictionaries
        similarities = similarities.to_dict('records')
        return similarities
    
    def recommend_matches(self, user_id: str):
        """Recommend matches based on the players and the days.

        This gives us 3 rankings:
            1. The ranking of the matches with the liked players and the same day
            2. The ranking of the matches with the recommended players and the same day
            3. The ranking of the matches with the similar players and the same day
        """
        # Get the days
        user_worker = User_Worker()
        days = user_worker.get_user_settings(user_id)['days']
        user_worker.close()

        # Get the liked players
        relation_worker = Relation_Worker()
        liked_players = relation_worker.get_liked_players_names(user_id)

        # Get relation types between user and players
        _recommended_p = relation_worker.get_player_recommend_relations(user_id)
        relation_worker.close()

        # Convert the list of dictionaries to a DataFrame
        _recommended_p_df = pd.DataFrame(_recommended_p)

        print(liked_players)
        print(_recommended_p_df)

        # Get the matches for those days
        formatted_days = [datetime.strptime(day, "%d/%m/%Y").strftime("%Y-%m-%d") for day in days]

        # Get all matches
        player_worker = Player_Worker()
        matches = player_worker.get_all_matches()
        player_worker.close()


        # Extract the dates from the matches
        match_dates = [match['match_date'] for match in matches]

        # Find the intersection of the user's days and the match dates
        intersecting_days = list(set(formatted_days) & set(match_dates))
        matches_on_days = [match for match in matches if match['match_date'] in intersecting_days]

        # 1. Check if the liked players are in the matches by checking if the player names are in the match_name. If so, add that match to a list of dictionaries with priority 1
        liked_player_matches = [match for match in matches_on_days if any(player in match['match_name'] for player in liked_players)]
        for match in liked_player_matches:
            match['priority'] = 1

        # 2. Check if the recommended players are in the matches by checking if the player names are in the match_name. If so, add that match to a list of dictionaries with priority equal to similarity
        recommended_player_matches = [match for match in matches_on_days if any(player in match['match_name'] for player in _recommended_p_df['player_name'])]
        for match in recommended_player_matches:
            player_name = next(player for player in _recommended_p_df['player_name'] if player in match['match_name'])
            match['priority'] = _recommended_p_df[_recommended_p_df['player_name'] == player_name]['similarity'].values[0]

        # If there are no found matches yet, extract the player names from the matches, then rank them by similarities to the liked players and to the recommended players. Then add the matches to the list of dictionaries with priority equal to the higher similarity (max similarity between those players and recommended players)
        if not liked_player_matches and not recommended_player_matches:
            match_player_names = [name.split(' vs ')[0] for name in [match['match_name'] for match in matches_on_days]]
            match_player_names += [name.split(' vs ')[1] for name in [match['match_name'] for match in matches_on_days]]
            match_player_names = list(set(match_player_names))  # Remove duplicates

            for player_name in match_player_names:
                similarity_liked = self.similarity_dfs['all'].loc[player_name, liked_players].max()
                similarity_recommended = self.similarity_dfs['all'].loc[player_name, _recommended_p_df['player_name']].max()
                priority = max(similarity_liked, similarity_recommended)

                for match in matches_on_days:
                    if player_name in match['match_name']:
                        match['priority'] = priority

        # Combine all the matches
        all_matches = liked_player_matches + recommended_player_matches + matches_on_days

        for match in all_matches:
            match['recommendation_type'] = 'liked' if match in liked_player_matches else 'recommended_by_player' if match in recommended_player_matches else 'similar_by_player'

        # Sort the matches by priority
        all_matches.sort(key=lambda x: x['priority'], reverse=True)

        return all_matches
