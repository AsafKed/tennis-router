from neo4j import GraphDatabase

# Import error raises
from .Neo4j_Errors import Uniqueness_Check

# This enables os.getenv() to read the .env file
import os
from dotenv import load_dotenv

from datetime import datetime

class Player_Worker:
    def __init__(self):
        uri = os.getenv("NEO4J_URI")
        player = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")

        self.driver = GraphDatabase.driver(uri, auth=(player, password))


    ############################
    # Create player
    ############################
    def create_player(self, name, player_id, rank, rank_points, win_count, lose_count, tournaments_played, win_percent, aces_avg, double_faults_avg, service_points_avg, first_serve_points_won_avg, second_serve_points_won_avg, serve_games_avg, break_points_saved_avg, break_points_faced_avg):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._create_and_return_player, name, player_id, rank, rank_points, win_count, lose_count, tournaments_played, win_percent, aces_avg, double_faults_avg, service_points_avg, first_serve_points_won_avg, second_serve_points_won_avg, serve_games_avg, break_points_saved_avg, break_points_faced_avg
            )

            return result

    @staticmethod
    def _create_and_return_player(tx, name, player_id, rank, rank_points, win_count, lose_count, tournaments_played, win_percent, aces_avg, double_faults_avg, service_points_avg, first_serve_points_won_avg, second_serve_points_won_avg, serve_games_avg, break_points_saved_avg, break_points_faced_avg):
        # MERGE will try to match the entire pattern and if it does not exist, it creates it.
        query = """ MERGE (p:Player { name: $name, player_id: $player_id, 
                    SET rank: $rank, rank_points: $rank_points, win_count: $win_count, lose_count: $lose_count, tournaments_played: $tournaments_played, win_percent: $win_percent, aces_avg: $aces_avg, double_faults_avg: $double_faults_avg, service_points_avg: $service_points_avg, first_serve_points_won_avg: $first_serve_points_won_avg, second_serve_points_won_avg: $second_serve_points_won_avg, serve_games_avg: $serve_games_avg, break_points_saved_avg: $break_points_saved_avg, break_points_faced_avg: $break_points_faced_avg })
                    RETURN p.name AS name, p.player_id AS player_id, p.rank AS rank, p.rank_points AS rank_points, p.win_count AS win_count, p.lose_count AS lose_count, p.tournaments_played AS tournaments_played, p.win_percent AS win_percent, p.aces_avg AS aces_avg, p.double_faults_avg AS double_faults_avg, p.service_points_avg AS service_points_avg, p.first_serve_points_won_avg AS first_serve_points_won_avg, p.second_serve_points_won_avg AS second_serve_points_won_avg, p.serve_games_avg AS serve_games_avg, p.break_points_saved_avg AS break_points_saved_avg, p.break_points_faced_avg AS break_points_faced_avg
                """
        result = tx.run(query, name=name, player_id=player_id)

        # Turn the result into a list of dictionaries
        result = result.data()

        # Check that only one person with this name and id exists
        Uniqueness_Check(result)

        person = result[0]
        return person
    
    ############################
    # Create match
    ############################
    def create_match(self, match_name, match_id, match_date, match_time):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(self._create_and_return_match, match_name, match_id, match_date, match_time)

            print("Result in main method:", result)
        return result

    @staticmethod
    def _create_and_return_match(tx, match_name, match_id, match_date, match_time):
        # MERGE will try to match the entire pattern and if it does not exist, it creates it.
        query = """ MERGE (m:Match { match_name: $match_name, match_id: $match_id, match_date: $match_date, match_time: $match_time }) 
                RETURN m.match_name AS match_name, m.match_id AS match_id, m.match_date as match_date, m.match_time as match_time
            """
        result = tx.run(query, match_name=match_name, match_id=match_id, match_date=match_date, match_time=match_time).data()
        Uniqueness_Check(result)
        return result[0]
    
    ############################
    # Add player to match
    ############################
    # Check if player is already in match
    def player_in_match(self, player_id: str, match_name: str):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._player_in_match, player_id, match_name
            )
            # If player_id in list of returned players, return true, otherwise, false
            if len(result) > 0:
                for player in result:
                    if player["player_id"] == player_id:
                        return True
            return False
        
    @staticmethod
    def _player_in_match(tx, player_id: str, match_name: str):
        query = """ MATCH (p:Player { player_id: $player_id })
                MATCH (m:Match { match_name: $match_name })
                MATCH (p)-[r:PLAYS]->(m)
                RETURN p.name AS name, p.player_id AS player_id, m.match_name AS match_name, m.date AS date, m.time as time
            """
        result = tx.run(
            query, player_id=player_id, match_name=match_name
        ).data()
        return result

    # Add player to match
    def add_player_to_match(self, player_id: str, match_name: str):
        player_in_match = self.player_in_match(player_id, match_name)
        if not player_in_match:
            with self.driver.session(database="neo4j") as session:
                result = session.execute_write(
                    self._add_player_to_match, player_id, match_name
                )

                return result

    @staticmethod
    def _add_player_to_match(tx, player_id: str, match_name: str):
        # Get today's date in the format YYYY-MM-DD
        today = datetime.today().strftime("%Y-%m-%d")

        query = """ MATCH (p:Player { player_id: $player_id })
                MATCH (m:Match { match_name: $match_name })
                MERGE (p)-[r:PLAYS]->(m)
                RETURN p.name AS name, p.player_id AS player_id, m.match_name AS match_name, m.date AS date, m.time AS time
            """
        result = tx.run(
            query, player_id=player_id, match_name=match_name, today=today
        ).data()
        Uniqueness_Check(result)
        person = result[0]
        return person