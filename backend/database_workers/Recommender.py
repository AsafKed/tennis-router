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


    def recommend_individual(self, player_names, similarity_type, user_id=None):
        all_similarities = self.similarity_dfs[similarity_type][player_names].dropna()
        all_similarities = all_similarities.stack().reset_index()
        all_similarities.columns = ['rec_player', 'player', 'similarity']

        # Define a function that will return the top 2 players who are not in the liked list.
        def top_2_not_liked(group):
            group['similarity'] = pd.to_numeric(group['similarity'])
            return group[~group['rec_player'].isin(player_names)].nlargest(2, 'similarity')

        # Group by player and apply the function
        similarities = all_similarities.groupby('player').apply(top_2_not_liked).reset_index(drop=True)

        rec_players_dict = {}  # Initialize an empty dictionary for recommended players
        for index, row in similarities.iterrows():
            if row['rec_player'] in rec_players_dict:
                # If the player already exists in the dictionary, update the similarity score to the maximum
                rec_players_dict[row['rec_player']] = max(row['similarity'], rec_players_dict[row['rec_player']])
            else:
                # If the player does not exist in the dictionary, add it
                rec_players_dict[row['rec_player']] = row['similarity']

        if user_id is not None:
            print(f"\nUpdating recommendations for user {user_id}\n")
            # Interaction with the database happens here.
            relation_worker = Relation_Worker()
            prev_rec_players = relation_worker.get_player_recommend_relations(user_id)

            prev_rec_players_set = set()
            if prev_rec_players:
                # Convert list of dictionaries to DataFrame
                prev_rec_players_df = pd.DataFrame(prev_rec_players)

                # Convert to a set for efficient membership testing.
                prev_rec_players_set = set(prev_rec_players_df['player_name'].unique())

            # Players to be removed from the database: those in the previous list but not in the current one.
            to_be_removed = prev_rec_players_set - set(rec_players_dict.keys())
            for player in to_be_removed:
                relation_worker.delete_player_recommend(user_id, player)

            # If less than 2 recommendations, add more while avoiding previous ones.
            while len(rec_players_dict) < 2*len(player_names) and len(rec_players_dict) < 3*len(player_names):
                additional_recs = all_similarities[~all_similarities['rec_player'].isin(set(list(rec_players_dict.keys()) + list(prev_rec_players_set)))]
                additional_recs = additional_recs.sort_values('similarity', ascending=False).head(1)
                for index, row in additional_recs.iterrows():
                    if row['rec_player'] not in rec_players_dict.keys():
                        rec_players_dict[row['rec_player']] = row['similarity']

            print(f"\nCreating player recommend relations for players {list(rec_players_dict.keys())}\n")
            for player, similarity in rec_players_dict.items():
                relation_worker.create_player_recommend(user_id, player, similarity, 'all', 'player')

            relation_worker.close()

        return list(rec_players_dict.keys())




            # Create new relations
            # for player in rec_players:
            #     relation_worker.create_player_recommend(user_id, player, similarities[similarities['rec_player'] == player]['similarity'].values[0], similarity_type)
            # relation_worker.create_player_recommend(user_id, rec_players, similarities, similarity_type)
            # relation_worker.close()
        
        # Turn similarities into list of dictionaries
        # similarities = similarities.to_dict('records')
        # return similarities

    def recommend_matches(self, user_id: str):
        """Recommend matches based on the players and the days."""

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

        # Get the matches for those days
        formatted_days = []
        if days is not None:
            formatted_days = [datetime.strptime(day, "%d/%m/%Y").strftime("%Y-%m-%d") for day in days]

        # Get recommendations for today
        today = datetime(2023, 6, 13).strftime("%Y-%m-%d")
        # today = datetime.today().strftime("%Y-%m-%d")
        formatted_days = [today]

        # Get all matches
        player_worker = Player_Worker()
        matches = player_worker.get_all_matches()
        player_worker.close()

        # Extract the dates from the matches
        match_dates = [match['match_date'] for match in matches]

        # Find the intersection of the user's days and the match dates
        intersecting_days = list(set(formatted_days) & set(match_dates))
        matches_on_days = [match for match in matches if match['match_date'] in intersecting_days]

        # Define weights
        weights = {
            'liked': 1.0,
            'recommended_by_player': 0.75,
            'similar_by_player': 0.5,
        }

        # Change the lists of matches to a dictionary to avoid duplicates
        all_matches = {}

        # 1. Check if the liked players are in the matches
        liked_player_matches = [match for match in matches_on_days if any(player in match['match_name'] for player in liked_players)]
        for match in liked_player_matches:
            match['priority'] = weights['liked']
            match['recommendation_type'] = 'liked'
            if match['match_name'] not in all_matches or match['priority'] > all_matches[match['match_name']]['priority']:
                all_matches[match['match_name']] = match

        # 2. Check if the recommended players are in the matches
        recommended_player_matches = [match for match in matches_on_days if any(player in match['match_name'] for player in _recommended_p_df['player_name'])]
        for match in recommended_player_matches:
            match_players = match['match_name'].split(' vs ')
            similarity_scores = []
            for player_name in match_players:
                if player_name in _recommended_p_df['player_name'].values:
                    similarity_scores.append(_recommended_p_df[_recommended_p_df['player_name'] == player_name]['similarity'].values[0])
                else:
                    # Calculate similarity to liked and recommended players
                    if player_name in self.similarity_dfs['all'].index:
                        similarity_liked = self.similarity_dfs['all'].loc[player_name, liked_players].max()
                        similarity_recommended = self.similarity_dfs['all'].loc[player_name, _recommended_p_df['player_name']].max()
                        similarity_scores.append(max(similarity_liked, similarity_recommended))
            
            # Filter out invalid entries (non-floats) in similarity_scores
            similarity_scores = [score for score in similarity_scores if isinstance(score, (int, float))]

            max_similarity = max(similarity_scores) if similarity_scores else 0
            match['priority'] = max_similarity * weights['recommended_by_player']
            match['recommendation_type'] = 'recommended_by_player'
            if match['match_name'] not in all_matches or match['priority'] > all_matches[match['match_name']]['priority']:
                all_matches[match['match_name']] = match

        # 3. Check for similar players
        # get list of matches that are not in liked_player_matches or recommended_player_matches
        matches_on_days = [match for match in matches_on_days if match not in liked_player_matches and match not in recommended_player_matches]
        if matches_on_days:
        # if not liked_player_matches and not recommended_player_matches:
            match_player_names = [name.split(' vs ')[0] for name in [match['match_name'] for match in matches_on_days]]
            match_player_names += [name.split(' vs ')[1] for name in [match['match_name'] for match in matches_on_days]]
            match_player_names = list(set(match_player_names))  # Remove duplicates

            for player_name in match_player_names:
                # Add condition to check if the player_name exists in the DataFrame
                if player_name in self.similarity_dfs['all'].index:
                    similarity_liked = self.similarity_dfs['all'].loc[player_name, liked_players].max()
                    similarity_recommended = self.similarity_dfs['all'].loc[player_name, _recommended_p_df['player_name']].max()
                    priority = max(similarity_liked, similarity_recommended) * weights['similar_by_player']

                    for match in matches_on_days:
                        if player_name in match['match_name']:
                            match['priority'] = priority
                            match['recommendation_type'] = 'similar_by_player'
                            if match['match_name'] not in all_matches or match['priority'] > all_matches[match['match_name']]['priority']:
                                all_matches[match['match_name']] = match

        # At the end, sort the matches by priority
        all_matches = sorted(all_matches.values(), key=lambda x: x.get('priority', 0), reverse=True)

        return all_matches


    
    # def recommend_matches_for_groups(self, user_id: str):
        # Get the users of the groups the user is in

        # Run the recommend_matches function for each user to get their priority for every match

        # Combine the priorities of the matches for each user in an easy to use data structure


