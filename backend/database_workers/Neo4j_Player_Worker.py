from neo4j import GraphDatabase

# Import helpers
from .Neo4j_Errors import Uniqueness_Check
from .Neo4j_Helpers import normalize_players

# This enables os.getenv() to read the .env file
import os
from dotenv import load_dotenv

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
    # Male
    def create_player_male(self, name):
        """Create a player in the database
        
        Arguments:
            name {string} -- The name of the player

        Returns:
            Player (dictionary) -- As uploaded to the database

        """
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._create_and_return_player_male, name)

        
    @staticmethod
    def _create_and_return_player_male(tx, name):
        # MERGE will try to match the entire pattern and if it does not exist, it creates it.
        query = """ MERGE (p:PlayerMale { name: $name })
                    RETURN p.name AS name
                """
        result = tx.run(query, name=name)

        # Turn the result into a list of dictionaries
        result = result.data()

        # Check that only one person with this name and id exists
        Uniqueness_Check(result)

        person = result[0]
        return person
    
    # Female
    def create_player_female(self, name):
        """Create a player in the database
        
        Arguments:
            name {string} -- The name of the player

        Returns:
            Player (dictionary) -- As uploaded to the database

        """
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._create_and_return_player_female, name)
            
    @staticmethod
    def _create_and_return_player_female(tx, name):
        # MERGE will try to match the entire pattern and if it does not exist, it creates it.
        query = """ MERGE (p:PlayerFemale { name: $name })
                    RETURN p.name AS name
                """
        result = tx.run(query, name=name)

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
    
    # Add personal data to player with the following properties: country, rank, status, experience, play_style, previous_win_year, style, age, height, favorite_shot, hand, personality_tags, personality_long, grass_advantage, career_high_rank, years_on_tour, coach
    def add_personal_data_to_player(self, name, country, rank, rank_level, status, experience, play_style, previous_win_year, style, age, height, favorite_shot, hand, personality_tags, personality_long, grass_advantage, career_high_rank, years_on_tour, coach):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._add_personal_data_to_player, name, country, rank, rank_level, status, experience, play_style, previous_win_year, style, age, height, favorite_shot, hand, personality_tags, personality_long, grass_advantage, career_high_rank, years_on_tour, coach)

            return result
        
    @staticmethod
    def _add_personal_data_to_player(tx, name, country, rank, rank_level, status, experience, play_style, previous_win_year, style, age, height, favorite_shot, hand, personality_tags, personality_long, grass_advantage, career_high_rank, years_on_tour, coach):
        query = """ MATCH (p { name: $name })
                    SET p.country = $country, p.rank = $rank, p.rank_level = $rank_level, p.status = $status, p.experience = $experience, p.play_style = $play_style, p.previous_win_year = $previous_win_year,
                    p.style = $style, p.age = $age, p.height = $height, p.favorite_shot = $favorite_shot, p.hand = $hand, p.personality_tags = $personality_tags, p.personality_long = $personality_long,
                    p.grass_advantage = $grass_advantage, p.career_high_rank = $career_high_rank, p.years_on_tour = $years_on_tour, p.coach = $coach
                    RETURN p.name, p.player_id, p.country, p.rank, p.rank_level, p.status, p.experience, p.play_style, p.style, p.age, p.height, p.favorite_shot, p.hand, p.personality_tags, p.personality_long,
                    p.grass_advantage, p.career_high_rank, p.years_on_tour, p.coach
                """
        result = tx.run(query, name=name, country=country, rank=rank, rank_level=rank_level, status=status, experience=experience, play_style=play_style, previous_win_year=previous_win_year,
                        style=style, age=age, height=height, favorite_shot=favorite_shot, hand=hand, personality_tags=personality_tags, personality_long=personality_long,
                        grass_advantage=grass_advantage, career_high_rank=career_high_rank, years_on_tour=years_on_tour, coach=coach)

        # Turn the result into a list of dictionaries
        result = result.data()

        # Check that only one person with this name and id exists
        Uniqueness_Check(result)

        person = result[0]
        return person


    ############################
    # Create match
    ############################
    def create_match(self, match_name, match_date, match_time, 
                 tourney_id, tourney_name, surface, draw_size,
                 tourney_level, tourney_date, match_num, score, best_of, round,
                 minutes, w_ace, w_df, w_svpt, w_1stIn, w_1stWon, w_2ndWon, w_SvGms,
                 w_bpSaved, w_bpFaced, l_ace, l_df, l_svpt, l_1stIn, l_1stWon, l_2ndWon,
                 l_SvGms, l_bpSaved, l_bpFaced):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(self._create_and_return_match, match_name=match_name, match_date=match_date, match_time=match_time, 
                                            tourney_id=tourney_id, tourney_name=tourney_name, surface=surface, draw_size=draw_size,
                                            tourney_level=tourney_level, tourney_date=tourney_date, match_num=match_num, score=score, best_of=best_of, round=round,
                                            minutes=minutes, w_ace=w_ace, w_df=w_df, w_svpt=w_svpt, w_1stIn=w_1stIn, w_1stWon=w_1stWon, w_2ndWon=w_2ndWon, w_SvGms=w_SvGms,
                                            w_bpSaved=w_bpSaved, w_bpFaced=w_bpFaced, l_ace=l_ace, l_df=l_df, l_svpt=l_svpt, l_1stIn=l_1stIn, l_1stWon=l_1stWon, l_2ndWon=l_2ndWon,
                                            l_SvGms=l_SvGms, l_bpSaved=l_bpSaved, l_bpFaced=l_bpFaced)

        return result

    @staticmethod 
    def _create_and_return_match(tx, **kwargs):
        query = """ MERGE (m:Match {match_num: $match_num, match_name: $match_name, tourney_id: $tourney_id})
                    ON CREATE SET m += $props
                    ON MATCH SET m += $props
                    RETURN m
                """

        non_null_properties = {k: v for k, v in kwargs.items() if v is not None}
        result = tx.run(query, {'match_num': kwargs['match_num'], 'match_name': kwargs['match_name'], 'tourney_id': kwargs['tourney_id'], 'props': non_null_properties})
        return result.single()[0]

    
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

    def create_player_match_relationship(self, player_id, match_num, tourney_id, relationship_type):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._create_player_match_relationship, player_id, match_num, tourney_id, relationship_type)

    @staticmethod
    def _create_player_match_relationship(tx, player_id, match_num, tourney_id, relationship_type):
        query = """
            MATCH (p:Player {player_id: $player_id})
            MATCH (m:Match {match_num: $match_num, tourney_id: $tourney_id})
            MERGE (p)-[r:PLAYED {result: $relationship_type}]->(m)
        """
        tx.run(query, {'player_id': player_id, 'match_num': match_num, 
                        'tourney_id': tourney_id,
                        'relationship_type': relationship_type})

    ############################
    # Get all players
    ############################
    def get_all_players(self):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_all_players)
            # If a player has a NaN rank, set the rank to "Unranked"
            return normalize_players(result)
        
    @staticmethod
    def _get_all_players(tx):
        query = """ MATCH (p:Player)
                    RETURN p.name AS name, p.player_id AS player_id, p.rank as rank
                    ORDER BY p.name
                """
        result = tx.run(query).data()
        return result
    
    ############################
    # Get player by id
    ############################
    def get_player_by_id(self, player_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_player_by_id, player_id)
            return result
        
    @staticmethod
    def _get_player_by_id(tx, player_id):
        query = """ MATCH (p:Player {player_id: $player_id})
                    RETURN p.name AS name, p.player_id AS player_id
                """
        result = tx.run(query, player_id=player_id).data()
        return result