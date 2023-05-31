import pandas as pd
from neo4j import GraphDatabase

# To use the .env file
import os
from dotenv import load_dotenv
load_dotenv()

from .Neo4j_Player_Worker import Player_Worker

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
    # Create euclidian similarity relations with scores (0–1) based on numeric features
    #############################
    def create_euclidian_similarities(self):
        with self.driver.session() as session:
            session.execute_write(self._create_log_values)
            session.execute_write(self._scale_properties)
            session.execute_write(self._write_scaled_properties)
            session.execute_write(self._create_euclidian_similarities)
            session.execute_write(self._rank_euclidian_similarities)


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
        check_query = """ CALL gds.graph.exists('euclidian_similarity_graph') YIELD exists """
        result = tx.run(check_query)
        graph_exists = result.single()[0]

        # If the in-memory graph exists, drop it
        if graph_exists:
            drop_query = """ CALL gds.graph.drop('euclidian_similarity_graph') """
            tx.run(drop_query)
        else:
            print("No graph to drop")

        # Create a new in-memory graph
        create_query = """ CALL gds.graph.project(
                            'euclidian_similarity_graph',
                            'Player',
                            '*',
                            {nodeProperties: ['log_rank', 'age', 'height', 'log_career_high_rank', 'years_on_tour', 'career_high_year']
                            }
                        )
                    """
        tx.run(create_query)

        # Scale the properties
        query = """ CALL gds.alpha.scaleProperties.mutate(
                        'euclidian_similarity_graph',
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
                            'euclidian_similarity_graph',
                            ['scaled_properties']
                        )
                        YIELD propertiesWritten
                    """
            
            tx.run(query)

    @staticmethod
    def _create_euclidian_similarities(tx):
        query = """ MATCH (p1:Player), (p2:Player)
                    WHERE id(p1) <> id(p2)
                    WITH p1, p2, gds.similarity.euclidean(p1.scaled_properties, p2.scaled_properties) AS similarity
                    MERGE (p1)-[r:SIMILAR_EUCLIDIAN]->(p2)
                    SET r.score = similarity
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


    #############################
    # Get similarities between all players
    #############################
    def get_all_similarities(self):
        with self.driver.session() as session:
            result = session.read_transaction(self._get_all_similarities)
            return pd.DataFrame(result)

    @staticmethod
    def _get_all_similarities(tx):
        query = """ MATCH (p1:Player)-[s:SIMILAR_EUCLIDIAN]->(p2:Player)
                    RETURN p1.name AS player1, s.score AS similarity, s.rank as rank, p2.name AS player2
                """
        
        result = tx.run(query)
        return result.data()
