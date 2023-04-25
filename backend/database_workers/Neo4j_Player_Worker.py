from neo4j import GraphDatabase

# Import error raises
from .Neo4j_Errors import Uniqueness_Check

# This enables os.getenv() to read the .env file
import os
from dotenv import load_dotenv

from datetime import datetime

# Load the .env file
load_dotenv()

class Player_Worker:
    def __init__(self):
        uri = os.getenv("NEO4J_URI")
        player = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")

        self.driver = GraphDatabase.driver(uri, auth=(player, password))

    def close(self):
        # Don't forget to close the driver connection when you are finished with it
        self.driver.close()

    ############################
    # Create player
    ############################
    def create_player(self, name, player_id):
        """Create a player in the database
        
        Arguments:
            name {string} -- The name of the player
            player_id {string} -- The id of the player

        Returns:
            Player (dictionary) -- As uploaded to the database

        """
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._create_and_return_player, name, player_id)

            print(f"{result} has been created")
        
    @staticmethod
    def _create_and_return_player(tx, name, player_id):
        # MERGE will try to match the entire pattern and if it does not exist, it creates it.
        query = """ MERGE (p:Player { name: $name, player_id: $player_id })
                    RETURN p.name AS name, p.player_id AS player_id
                """
        result = tx.run(query, name=name, player_id=player_id)

        # Turn the result into a list of dictionaries
        result = result.data()

        # Check that only one person with this name and id exists
        Uniqueness_Check(result)

        person = result[0]
        return person
    
    # Add data to player
    def add_data_to_player(self, name, player_id, rank, rank_points, win_count, loss_count, tournaments_played, win_percent, aces_avg, double_faults_avg, service_points_avg, first_serve_points_won_avg, second_serve_points_won_avg, serve_games_avg, break_points_saved_avg, break_points_faced_avg):
        """Add a player's details in the database
        
        Arguments:
            name {string} -- The name of the player
            player_id {string} -- The id of the player
            rank {int} -- The rank of the player
            rank_points {int} -- The rank points of the player
            win_count {int} -- The win count of the player
            loss_count {int} -- The lose count of the player
            tournaments_played {int} -- The tournaments played of the player
            win_percent {float} -- The win percent of the player
            aces_avg {float} -- The aces average of the player
            double_faults_avg {float} -- The double faults average of the player
            service_points_avg {float} -- The service points average of the player
            first_serve_points_avg {float} -- The first serve points average of the player
            first_serve_points_won_avg {float} -- The first serve points won average of the player
            second_serve_points_won_avg {float} -- The second serve points won average of the player
            serve_games_avg {float} -- The serve games average of the player
            break_points_saved_avg {float} -- The break points saved average of the player
            break_points_faced_avg {float} -- The break points faced average of the player

        Returns:
            Player (dictionary) -- As uploaded to the database

        """
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._add_data_to_player, name, player_id, rank, rank_points, win_count, loss_count, tournaments_played, win_percent, aces_avg, double_faults_avg, service_points_avg, first_serve_points_won_avg, second_serve_points_won_avg, serve_games_avg, break_points_saved_avg, break_points_faced_avg)

            return result
        
    @staticmethod
    def _add_data_to_player(tx, name, player_id, rank, rank_points, win_count, loss_count, tournaments_played, win_percent, aces_avg, double_faults_avg, service_points_avg, first_serve_points_won_avg, second_serve_points_won_avg, serve_games_avg, break_points_saved_avg, break_points_faced_avg):
        query = """ MATCH (p:Player { name: $name, player_id: $player_id })
                    SET p.rank = $rank, p.rank_points = $rank_points, p.win_count = $win_count, p.loss_count = $loss_count, p.tournaments_played = $tournaments_played, p.win_percent = $win_percent, p.aces_avg = $aces_avg, p.double_faults_avg = $double_faults_avg, p.service_points_avg = $service_points_avg, p.first_serve_points_won_avg = $first_serve_points_won_avg, p.second_serve_points_won_avg = $second_serve_points_won_avg, p.serve_games_avg = $serve_games_avg, p.break_points_saved_avg = $break_points_saved_avg, p.break_points_faced_avg = $break_points_faced_avg
                    RETURN p.name, p.player_id, p.rank, p.rank_points, p.win_count, p.loss_count, p.tournaments_played, p.win_percent, p.aces_avg, p.double_faults_avg, p.service_points_avg, p.first_serve_points_won_avg, p.second_serve_points_won_avg, p.serve_games_avg, p.break_points_saved_avg, p.break_points_faced_avg
                """
        result = tx.run(query, name=name, player_id=player_id, rank=rank, rank_points=rank_points, win_count=win_count, loss_count=loss_count, tournaments_played=tournaments_played, win_percent=win_percent, aces_avg=aces_avg, double_faults_avg=double_faults_avg, service_points_avg=service_points_avg, first_serve_points_won_avg=first_serve_points_won_avg, second_serve_points_won_avg=second_serve_points_won_avg, serve_games_avg=serve_games_avg, break_points_saved_avg=break_points_saved_avg, break_points_faced_avg=break_points_faced_avg)

        # Turn the result into a list of dictionaries
        result = result.data()

        # Check that only one person with this name and id exists
        Uniqueness_Check(result)

        person = result[0]
        return person

    ############################
    # Create match
    ############################
    def create_match(self, match_name, match_id, match_date, match_time, 
                     tourney_id, tourney_name, surface, draw_size, 
                     tourney_level, tourney_date, match_num, score, best_of, round, 
                     minutes, w_ace, w_df, w_svpt, w_1stIn, w_1stWon, w_2ndWon, w_SvGms, 
                     w_bpSaved, w_bpFaced, l_ace, l_df, l_svpt, l_1stIn, l_1stWon, l_2ndWon, 
                     l_SvGms, l_bpSaved, l_bpFaced):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(self._create_and_return_match, match_name, match_id, match_date, match_time, 
                                           tourney_id, tourney_name, surface, draw_size,
                                           tourney_level, tourney_date, match_num, score, best_of, round,
                                           minutes, w_ace, w_df, w_svpt, w_1stIn, w_1stWon, w_2ndWon, w_SvGms,
                                           w_bpSaved, w_bpFaced, l_ace, l_df, l_svpt, l_1stIn, l_1stWon, l_2ndWon,
                                           l_SvGms, l_bpSaved, l_bpFaced)

            print("Result in main method:", result)
        return result

    @staticmethod 
    def _create_and_return_match(tx, match_name, match_id, match_date, match_time,
                                    tourney_id, tourney_name, surface, draw_size,
                                    tourney_level, tourney_date, match_num, score, best_of, round,
                                    minutes, w_ace, w_df, w_svpt, w_1stIn, w_1stWon, w_2ndWon, w_SvGms,
                                    w_bpSaved, w_bpFaced, l_ace, l_df, l_svpt, l_1stIn, l_1stWon, l_2ndWon,
                                    l_SvGms, l_bpSaved, l_bpFaced):
        query = """ MERGE (m:Match { match_name: $match_name, match_id: $match_id, match_date: $match_date, match_time: $match_time,
                    tourney_id: $tourney_id, tourney_name: $tourney_name, surface: $surface, draw_size: $draw_size,
                    tourney_level: $tourney_level, tourney_date: $tourney_date, match_num: $match_num, score: $score, best_of: $best_of, round: $round,
                    minutes: $minutes, w_ace: $w_ace, w_df: $w_df, w_svpt: $w_svpt, w_1stIn: $w_1stIn, w_1stWon: $w_1stWon, w_2ndWon: $w_2ndWon, w_SvGms: $w_SvGms,
                    w_bpSaved: $w_bpSaved, w_bpFaced: $w_bpFaced, l_ace: $l_ace, l_df: $l_df, l_svpt: $l_svpt, l_1stIn: $l_1stIn, l_1stWon: $l_1stWon, l_2ndWon: $l_2ndWon,
                    l_SvGms: $l_SvGms, l_bpSaved: $l_bpSaved, l_bpFaced: $l_bpFaced })
                    RETURN m.match_name AS match_name, m.match_id AS match_id, m.match_date AS match_date, m.match_time AS match_time,
                    m.tourney_id AS tourney_id, m.tourney_name AS tourney_name, m.surface AS surface, m.draw_size AS draw_size,
                    m.tourney_level AS tourney_level, m.tourney_date AS tourney_date, m.match_num AS match_num, m.score AS score, m.best_of AS best_of, m.round AS round,
                    m.minutes AS minutes, m.w_ace AS w_ace, m.w_df AS w_df, m.w_svpt AS w_svpt, m.w_1stIn AS w_1stIn, m.w_1stWon AS w_1stWon, m.w_2ndWon AS w_2ndWon, m.w_SvGms AS w_SvGms,
                    m.w_bpSaved AS w_bpSaved, m.w_bpFaced AS w_bpFaced, m.l_ace AS l_ace, m.l_df AS l_df, m.l_svpt AS l_svpt, m.l_1stIn AS l_1stIn, m.l_1stWon AS l_1stWon, m.l_2ndWon AS l_2ndWon,
                    m.l_SvGms AS l_SvGms, m.l_bpSaved AS l_bpSaved, m.l_bpFaced AS l_bpFaced
                    """
        result = tx.run(query, match_name=match_name, match_id=match_id, match_date=match_date, match_time=match_time,
                        tourney_id=tourney_id, tourney_name=tourney_name, surface=surface, draw_size=draw_size,
                        tourney_level=tourney_level, tourney_date=tourney_date, match_num=match_num, score=score, best_of=best_of, round=round,
                        minutes=minutes, w_ace=w_ace, w_df=w_df, w_svpt=w_svpt, w_1stIn=w_1stIn, w_1stWon=w_1stWon, w_2ndWon=w_2ndWon, w_SvGms=w_SvGms,
                        w_bpSaved=w_bpSaved, w_bpFaced=w_bpFaced, l_ace=l_ace, l_df=l_df, l_svpt=l_svpt, l_1stIn=l_1stIn, l_1stWon=l_1stWon, l_2ndWon=l_2ndWon,
                        l_SvGms=l_SvGms, l_bpSaved=l_bpSaved, l_bpFaced=l_bpFaced)
        return result.data()
    
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