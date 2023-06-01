from neo4j import GraphDatabase

# To use the .env file
import os
from dotenv import load_dotenv
load_dotenv()

from .Neo4j_Player_Worker import Player_Worker

# Other imports
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer

class Similarity_Worker:
    def __init__(self):
        uri = os.getenv('NEO4J_URI')
        user = os.getenv('NEO4J_USERNAME')
        password = os.getenv('NEO4J_PASSWORD')

        self.driver = GraphDatabase.driver(uri, auth=(user, password))

        self.get_players()

    def close(self):
        self.driver.close()

    def get_players(self):
        player_worker = Player_Worker()
        self.players = player_worker.get_all_players_with_personal_data()
        player_worker.close()

    #############################
    # Create euclidean similarity relations with scores (0–1) based on numeric features
    #############################
    def create_numeric_similarities(self):
        with self.driver.session() as session:
            session.execute_write(self._create_log_values)
            session.execute_write(self._scale_properties)
            session.execute_write(self._write_scaled_properties)
            session.execute_write(self._create_euclidean_similarities)

    @staticmethod
    def _create_log_values(tx):
        query = """ MATCH (p:Player)
                    SET p.log_rank = log(p.rank)
                    SET p.log_career_high_rank = log(p.career_high_rank)
                    RETURN p
                """
        
        result = tx.run(query)
        return result
    
    @staticmethod
    def _scale_properties(tx):
        # Check if the in-memory graph exists
        check_query = """ CALL gds.graph.exists('euclidean_similarity_graph') YIELD exists """
        result = tx.run(check_query)
        graph_exists = result.single()[0]

        # If the in-memory graph exists, drop it
        if graph_exists:
            drop_query = """ CALL gds.graph.drop('euclidean_similarity_graph') """
            tx.run(drop_query)
        else:
            print("No graph to drop")

        # Create a new in-memory graph
        create_query = """ CALL gds.graph.project(
                            'euclidean_similarity_graph',
                            'Player',
                            '*',
                            {nodeProperties: ['log_rank', 'age', 'height', 'log_career_high_rank', 'years_on_tour', 'career_high_year']
                            }
                        )
                    """
        tx.run(create_query)

        # Scale the properties
        query = """ CALL gds.alpha.scaleProperties.mutate(
                        'euclidean_similarity_graph',
                        {nodeProperties: ['log_rank', 'age', 'height', 'log_career_high_rank', 'years_on_tour', 'career_high_year'],
                        scaler: 'minMax',
                        mutateProperty: 'scaled_properties'})
                        YIELD nodePropertiesWritten
                """
        
        tx.run(query)


    @staticmethod
    def _write_scaled_properties(tx):
        # Check if the scaled_properties already exist
        check_query = """ MATCH (p:Player)
                        WHERE p.scaled_properties IS NOT NULL
                        RETURN count(p) > 0 as exists 
                    """
        result = tx.run(check_query)
        exists = result.single()[0]

        # Take the in_memory graph and write the scaled properties to the database
        if not exists:
            query = """ CALL gds.graph.nodeProperties.write(
                            'euclidean_similarity_graph',
                            ['scaled_properties']
                        )
                        YIELD propertiesWritten
                    """
            
            tx.run(query)

    @staticmethod
    def _create_euclidean_similarities(tx):
        query = """ MATCH (p1:Player), (p2:Player)
                    WHERE id(p1) <> id(p2)
                    WITH p1, p2, gds.similarity.euclidean(p1.scaled_properties, p2.scaled_properties) AS similarity
                    MERGE (p1)-[r:SIMILARITY]->(p2)
                    SET r.numeric = similarity
                """
        
        tx.run(query)

    # This had a ranking, but I'm leaving it out because ranking is a directed property, but the relations are undirected

    #############################
    # Create cosine similarity relations with scores (0–1) based on categorical features
    #############################
    def create_cosine_similarities(self):
        # Get the players
        player_worker = Player_Worker()
        players = player_worker.get_all_players_with_personal_data()
        player_worker.close()

        # Create similarity relations between all players based on the categorical features

    # TODO edit this, I do not like the output (see the jupter notebook, as long as you keep it like this, it's not working well enough to be uploaded to the db)
    # Do one-hot encoding for the handedness of each player, the playing_style, the country (turn this into regions!), won libema or not, status, the grass_advantage
    def create_one_hot_encoding(self):
        # Turn self.players into a dataframe
        players_df = pd.DataFrame(self.players)

        # One-hot encode the categorical features
        one_hot_hand = pd.get_dummies(players_df['hand'], prefix='hand')
        one_hot_play_style = pd.get_dummies(players_df['play_style'], prefix='play_style')
        one_hot_country_zone = pd.get_dummies(players_df['country_zone'], prefix='country_zone')
        one_hot_libema = pd.get_dummies(players_df['previous_libema_winner'], prefix='previous_libema_winner')
        one_hot_status = pd.get_dummies(players_df['status'], prefix='status')
        one_hot_grass_advantage = pd.get_dummies(players_df['grass_advantage'], prefix='grass_advantage')
        one_hot_favorite_shot = pd.get_dummies(players_df['favorite_shot'], prefix='favorite_shot')
        

        # Concatenate the one-hot encoded features to the players_df
        players_df = pd.concat([players_df, one_hot_hand, one_hot_play_style, one_hot_country_zone, one_hot_libema, one_hot_status, one_hot_grass_advantage, one_hot_favorite_shot], axis=1)

        # Drop the categorical features
        players_df = players_df.drop(['hand', 'play_style', 'country_zone', 'previous_libema_winner', 'status', 'grass_advantage', 'favorite_shot'], axis=1)

        # Turn the dataframe into a list of dictionaries
        players = players_df.to_dict('records')

        # Update the players in the database (gotta do this per player)
        for player in players:
            print(player)
            player_worker = Player_Worker()
            player_worker.upload_player_data(player)
            player_worker.close()
            break
        



    
    
    #############################
    # Create overlap similarity relations with scores (0–1) based on personality tags (takes into account differing set size)
    #############################
    # Create BOW vectors for the personality_tags of each player
    def create_bow_vectors(self):
        all_tags = set()
        for player in self.players:
            tags = set(player['personality_tags'])
            all_tags.update(tags)

        all_tags = sorted(all_tags)

        # Create a CountVectorizer with the unique tags as the vocabulary
        vectorizer = CountVectorizer(vocabulary=list(all_tags))

        # Create a BOW representation for each player
        for player in self.players:
            bow = vectorizer.transform([' '.join(player['personality_tags'])]).toarray()[0]
            player['personality_tags_bow'] = bow.tolist()

        # Upload the BOW representations to Neo4j
        with self.driver.session() as session:
            for player in self.players:
                session.execute_write(self._upload_bow, player)

    @staticmethod
    def _upload_bow(tx, player):
        query = """ MATCH (p:Player {name: $name})
                    SET p.personality_tags_bow = $bow
                """
        tx.run(query, name=player['name'], bow=player['personality_tags_bow'])

    # Create overlap similarity relations between all players based on the BOW representations
    def create_tag_similarities(self):
        with self.driver.session() as session:
            result = session.execute_write(self._create_cosine_similarities)
            return result
        
    @staticmethod
    def _create_cosine_similarities(tx):
        query = """ MATCH (p1:Player)-[s:SIMILARITY]-(p2:Player)
                    WHERE p1 <> p2
                    WITH p1, p2, s, p1.personality_tags_bow AS p1_tags, p2.personality_tags_bow AS p2_tags
                    SET s.tag_similarity = gds.similarity.cosine(p1_tags, p2_tags)
                    RETURN p1.name, p2.name, s.tag_similarity AS cosineSimilarity
                """
        
        result = tx.run(query)
        return result


    #############################
    # Create jaccard similarity relations with scores (0–1) based on categorical properties (works well with same set size)
    #############################
    def create_jaccard_similarities(self):
        with self.driver.session() as session:
            result = session.execute_write(self._create_jaccard_similarities)
            return result
        
    @staticmethod
    def _create_jaccard_similarities(tx):
        query = """ MATCH (p1:Player)-[s:SIMILARITY]-(p2:Player)
                    WHERE p1 <> p2
                    WITH p1, p2, s, [p1.play_style, p1.status, p1.grass_advantage, p1.hand, p1.previous_libema_winner, p1.country_zone, p1.favorite_shot, p1.coach] AS p1_properties, [p2.play_style, p2.status, p2.grass_advantage, p2.hand, p2.previous_libema_winner, p2.country_zone, p2.favorite_shot, p2.coach] AS p2_properties
                    SET s.jaccard = gds.similarity.jaccard(p1_properties, p2_properties)
                    RETURN p1.name, p2.name, s.jaccard AS jaccardSimilarity
                """
        
        result = tx.run(query)
        return result


    #############################
    # Get similarities between all players
    #############################
    def get_all_similarities(self):
        with self.driver.session() as session:
            result = session.execute_read(self._get_all_similarities)
            return pd.DataFrame(result)

    @staticmethod
    def _get_all_similarities(tx):
        query = """ MATCH (p1:Player)-[s:SIMILARITY]->(p2:Player)
                    RETURN p1.name AS player1, s.numeric AS numeric, s.tag_similarity as tag_similarity, p2.name AS player2
                """
        
        result = tx.run(query)
        return result.data()
