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
        user = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")

        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        # Don't forget to close the driver connection when you are finished with it
        self.driver.close()

    ############################
    # Create player
    ############################
    # Male
    def create_player(self, name):
        """Create a player in the database
        
        Arguments:
            name {string} -- The name of the player

        Returns:
            Player (dictionary) -- As uploaded to the database

        """
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._create_and_return_player, name)

        
    @staticmethod
    def _create_and_return_player(tx, name):
        # MERGE will try to match the entire pattern and if it does not exist, it creates it.
        query = """ MERGE (p:Player { name: $name })
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
    def add_personal_data_to_player(self, name, country, country_zone, rank, rank_level, status, experience, play_style, previous_win_year, previous_libema_winner, age, height, favorite_shot, hand, personality_tags, personality_long, grass_advantage, career_high_rank, years_on_tour, coach, image_url, gender, country_code, career_high_year):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._add_personal_data_to_player, name, country, country_zone, rank, rank_level, status, experience, play_style, previous_win_year, previous_libema_winner, age, height, favorite_shot, hand, personality_tags, personality_long, grass_advantage, career_high_rank, years_on_tour, coach, image_url, gender, country_code, career_high_year)

            return result
        
    @staticmethod
    def _add_personal_data_to_player(tx, name, country, country_zone, rank, rank_level, status, experience, play_style, previous_win_year, previous_libema_winner, age, height, favorite_shot, hand, personality_tags, personality_long, grass_advantage, career_high_rank, years_on_tour, coach, image_url, gender, country_code, career_high_year):
        query = """ MATCH (p { name: $name })
                    SET p.country = $country, p.country_zone = $country_zone, p.rank = $rank, p.rank_level = $rank_level, p.status = $status, p.experience = $experience, p.play_style = $play_style, p.previous_win_year = $previous_win_year, p.previous_libema_winner = $previous_libema_winner, 
                    p.age = $age, p.height = $height, p.favorite_shot = $favorite_shot, p.hand = $hand, p.personality_tags = $personality_tags, p.personality_long = $personality_long,
                    p.grass_advantage = $grass_advantage, p.career_high_rank = $career_high_rank, p.years_on_tour = $years_on_tour, p.coach = $coach, p.image_url = $image_url, p.gender = $gender, p.country_code = $country_code, p.career_high_year = $career_high_year
                    RETURN p.name, p.player_id, p.country, p.rank, p.rank_level, p.status, p.experience, p.play_style, p.age, p.height, p.favorite_shot, p.hand, p.personality_tags, p.personality_long,
                    p.grass_advantage, p.career_high_rank, p.years_on_tour, p.coach, p.image_url, p.gender, p.country_code, p.career_high_year
                """
        result = tx.run(query, name=name, country=country, country_zone=country_zone, rank=rank, rank_level=rank_level, status=status, experience=experience, play_style=play_style, previous_win_year=previous_win_year, previous_libema_winner=previous_libema_winner,
                        age=age, height=height, favorite_shot=favorite_shot, hand=hand, personality_tags=personality_tags, personality_long=personality_long,
                        grass_advantage=grass_advantage, career_high_rank=career_high_rank, years_on_tour=years_on_tour, coach=coach, image_url=image_url, gender=gender, country_code=country_code,
                        career_high_year=career_high_year)

        # Turn the result into a list of dictionaries
        result = result.data()

        # Check that only one person with this name and id exists
        Uniqueness_Check(result)

        person = result[0]
        return person

    ############################
    # Get player data
    ############################
    def get_player_data(self, name):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._get_player_data, name)
            return result

    @staticmethod
    def _get_player_data(tx, name):
        query = """ MATCH (p { name: $name })
                    RETURN p.name AS name, p.country AS country, p.rank AS rank, p.rank_level AS rank_level, p.previous_libema_winner AS previous_libema_winner, p.status AS status, p.experience AS experience, p.play_style AS play_style, p.style AS style, p.age AS age, p.height AS height, p.favorite_shot AS favorite_shot, p.hand AS hand, p.personality_tags AS personality_tags, p.personality_long AS personality_long,
                    p.grass_advantage AS grass_advantage, p.career_high_rank AS career_high_rank, p.years_on_tour AS years_on_tour, p.coach AS coach, p.image_url AS image_url, p.gender AS gender, p.country_code AS country_code, p.career_high_year AS career_high_year, p.country_zone AS country_zone
                """

        result = tx.run(query, name=name)

        # Turn the result into a list of dictionaries
        result = result.data()

        # Check that only one person with this name and id exists
        Uniqueness_Check(result)

        person = result[0]

        # Split the personality_tags string into a list
        person['personality_tags'] = person['personality_tags'].lower().split(', ')

        return person
    
    # Get player data for all players
    def get_all_players_with_personal_data(self):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._get_all_players_with_personal_data)
            return result
        
    @staticmethod
    def _get_all_players_with_personal_data(tx):
        query = """ MATCH (p:Player)
                    RETURN p.name AS name, p.country AS country, p.rank AS rank, p.rank_level AS rank_level, p.status AS status, p.experience AS experience, p.play_style AS play_style, p.style AS style, p.age AS age, p.height AS height, p.favorite_shot AS favorite_shot, p.hand AS hand, p.personality_tags AS personality_tags, p.personality_long AS personality_long,
                    p.grass_advantage AS grass_advantage, p.career_high_rank AS career_high_rank, p.years_on_tour AS years_on_tour, p.coach AS coach, p.image_url AS image_url, p.gender AS gender, p.country_code AS country_code, p.career_high_year AS career_high_year, p.previous_libema_winner AS previous_libema_winner,
                    p.country_zone AS country_zone
                """

        result = tx.run(query)

        # Turn the result into a list of dictionaries
        result = result.data()

        # Split the personality_tags string into a list
        for person in result:
            person['personality_tags'] = person['personality_tags'].lower().split(', ')

        return result
    
    # Upload any data for a player to the database (new properties or update properties)
    def upload_player_data(self, name, **kwargs):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._upload_player_data, name, **kwargs)
            return result
        
    @staticmethod
    def _upload_player_data(tx, name, kwargs):
        query = """ MATCH (p:Player { name: $name })
                    SET p += $kwargs
                """

        result = tx.run(query, name=name, kwargs=kwargs)

        return result
    
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
    # Create match simple
    ############################
    def create_match_simple(self, match_date, match_time, match_location, match_name):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(self._create_and_return_match_simple, match_date=match_date, match_time=match_time, match_location=match_location, match_name=match_name)

        return result
    
    @staticmethod
    def _create_and_return_match_simple(tx, **kwargs):
        query = """ MERGE (m:Match {match_name: $match_name})
                    ON CREATE SET m += $props
                    ON MATCH SET m += $props
                    RETURN m
                """

        non_null_properties = {k: v for k, v in kwargs.items() if v is not None}
        result = tx.run(query, {'match_name': kwargs['match_name'], 'props': non_null_properties})
        return result.single()[0]
    
    ############################
    # Add player to match (historical)
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
                RETURN p.name AS name, p.player_id AS player_id, m.match_name AS match_name, m.date AS date, m.match_time as time
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
    # Add player to match (simple)
    ############################
    # Check if player is already in match
    def player_in_match_simple(self, player_name: str, match_name: str):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._player_in_match_simple, player_name, match_name
            )
            # If player_id in list of returned players, return true, otherwise, false
            if len(result) > 0:
                for player in result:
                    if player["name"] == player_name:
                        return True
            return False
        
    @staticmethod
    def _player_in_match_simple(tx, player_name: str, match_name: str):
        query = """ MATCH (p:Player { name: $player_name })
                MATCH (m:Match { match_name: $match_name })
                MATCH (p)-[r:PLAYS]->(m)
                RETURN p.name AS name, m.match_name AS match_name, m.date AS date, m.match_time as time
            """
        result = tx.run(
            query, player_name=player_name, match_name=match_name
        ).data()
        return result
    
    def create_player_match_relationship_simple(self, player_name, match_name):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._create_player_match_relationship_simple, player_name, match_name)

    @staticmethod
    def _create_player_match_relationship_simple(tx, player_name, match_name):
        query = """ MATCH (p:Player {name: $player_name})
                    MATCH (m:Match {match_name: $match_name})
                    MERGE (p)-[r:PLAYS]->(m)
                """
        tx.run(query, {'player_name': player_name, 'match_name': match_name})

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
                    RETURN p.name AS name, p.rank as rank, p.image_url as image_url, p.gender as gender, p.country_code as country_code
                    ORDER BY p.name
                """
        result = tx.run(query).data()
        return result
    
    ############################
    # Get player names
    ############################
    def get_player_names(self):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_player_names)
            return result
        
    @staticmethod
    def _get_player_names(tx):
        query = """ MATCH (p:Player)
                    RETURN p.name AS name
                    ORDER BY p.name
                """
        result = tx.run(query).data()
        return result
    
    ############################
    # Get matches by day
    ############################
    def get_matches_by_day(self, date):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_matches_by_day, date)
            return result
        
    @staticmethod
    def _get_matches_by_day(tx, date):
        query = """ MATCH (m:Match)
                    WHERE date(m.date) = date($date)
                    RETURN m.match_name AS match_name, m.match_date AS match_date, m.match_time as match_time, m.match_location as match_location
                    ORDER BY m.match_time
                """
        result = tx.run(query, date=date).data()
        return result
    
    ############################
    # Get all matches
    ############################
    def get_all_matches(self):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_all_matches)
            return result
        
    @staticmethod
    def _get_all_matches(tx):
        query = """ MATCH (m:Match)
                    RETURN m.match_name AS match_name, m.match_date AS match_date, m.match_time as match_time, m.match_location as match_location
                    ORDER BY m.match_time
                """
        result = tx.run(query).data()
        return result