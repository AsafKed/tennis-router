from neo4j import GraphDatabase

# Import error raises
from .Neo4j_Errors import Uniqueness_Check

# This enables os.getenv() to read the .env file
import os
from dotenv import load_dotenv

# Other imports
import math

# Load the .env file
load_dotenv()

class Relation_Worker:
    def __init__(self):
        uri = os.getenv("NEO4J_URI")
        player = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")

        self.driver = GraphDatabase.driver(uri, auth=(player, password))

    def close(self):
        # Don't forget to close the driver connection when you are finished with it
        self.driver.close()
        
    ##############################
    # Add user LIKES player
    ##############################
    def create_likes_relation(self, user_id, player_id):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._create_likes_relation, user_id, player_id)

    @staticmethod
    def _create_likes_relation(tx, user_id, player_id):
        query = """ MATCH (u:User {user_id: $user_id}), (p:Player {player_id: $player_id})
                    MERGE (u)-[:LIKES]->(p)
                """
        tx.run(query, user_id=user_id, player_id=player_id)

    ##############################
    # Delete user LIKES player
    ##############################
    def delete_likes_relation(self, user_id, player_id):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._delete_likes_relation, user_id, player_id)

    @staticmethod
    def _delete_likes_relation(tx, user_id, player_id):
        query = """ MATCH (u:User {user_id: $user_id})-[r:LIKES]->(p:Player {player_id: $player_id})
                    DELETE r
                """
        tx.run(query, user_id=user_id, player_id=player_id)

    ##############################
    # Get similar players
    ##############################
    def get_similar_players(self, user_id):
        with self.driver.session(database="neo4j") as session:
            similar_players = session.execute_read(self._get_similar_players, user_id)
            return similar_players

    @staticmethod
    def _get_similar_players(tx, user_id):
        query = """ MATCH (u:User {user_id: $user_id})-[:LIKES]->(p:Player)-[:PLAYED]->(m:Match)<-[:PLAYED]-(other:Player)
                    WHERE NOT (u)-[:LIKES]->(other)
                    WITH other, COUNT(DISTINCT m) AS common_matches
                    RETURN other.player_id AS player_id, common_matches
                    ORDER BY common_matches DESC
                    LIMIT 5
                """
        result = tx.run(query, user_id=user_id).data()
        return result
    
    ##############################
    # Get recommended players
    ##############################
    # TODO: use built in similarity function for this
    def create_recommend_relations(self, user_id, similar_players):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._create_recommend_relations, user_id, similar_players)

    @staticmethod
    def _create_recommend_relations(tx, user_id, similar_players):
        query = """ UNWIND $similar_players AS similar_player
                    MATCH (u:User {user_id: $user_id}), (p:Player {player_id: similar_player.player_id})
                    MERGE (u)-[:RECOMMEND]->(p)
                """
        tx.run(query, user_id=user_id, similar_players=similar_players)

    ##############################
    # Delete recommend relations
    ##############################
    def delete_recommend_relations(self, user_id):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._delete_recommend_relations, user_id)

    @staticmethod
    def _delete_recommend_relations(tx, user_id):
        query = """ MATCH (u:User {user_id: $user_id})-[r:RECOMMEND]->(:Player)
                    DELETE r
                """
        tx.run(query, user_id=user_id)

    ##############################
    # Get liked players
    ##############################
    def get_liked_players(self, user_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_liked_players, user_id)
            print(result)
            return result

    @staticmethod
    def _get_liked_players(tx, user_id):
        query = """ MATCH (u:User {user_id: $user_id})-[:LIKES]->(p:Player)
                    RETURN p.name AS name, p.player_id AS player_id, p.rank as rank, p.image as image
                    ORDER BY p.name
                """
        result = tx.run(query, user_id=user_id).data()
        return result
