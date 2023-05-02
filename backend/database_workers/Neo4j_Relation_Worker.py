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
    # Add user-player relation
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
