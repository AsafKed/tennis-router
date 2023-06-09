from neo4j import GraphDatabase
import numpy as np
import pandas as pd

# Import helpers
from .Neo4j_Errors import Uniqueness_Check
from .Neo4j_Helpers import normalize_players

# This enables os.getenv() to read the .env file
import os
from dotenv import load_dotenv

# Load the .env file
load_dotenv()


class Parameter_Worker:
    def __init__(self):
        uri = os.getenv("NEO4J_URI")
        user = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")

        self.driver = GraphDatabase.driver(uri, auth=(user, password))

        # Import from Excel the tag categories
        self.tag_categories = pd.read_excel("data/Tag_Categories.xlsx", sheet_name="Categories")

    def close(self):
        # Don't forget to close the driver connection when you are finished with it
        self.driver.close()

    #############################
    # # Get parameter options # #
    #############################
    def get_parameter_options(self):
        with self.driver.session() as session:
            result = session.read_transaction(self._get_parameter_options)
            return self._process_parameter_options(result)

    @staticmethod
    def _get_parameter_options(tx):
        query = """MATCH (p:Player) 
            RETURN 
                p.play_style AS play_style,
                p.favorite_shot AS favorite_shot,
                p.years_on_tour AS years_on_tour,
                p.country_zone AS country_zone,
                p.gender AS gender,
                p.height AS height,
                p.career_high_rank AS career_high_rank,
                2023 - p.career_high_year AS career_high_years_ago,
                p.personality_tags AS personality_tags,
                p.previous_libema_winner AS previous_winner
            """

        result = tx.run(query)
        return result.data()

    def _process_parameter_options(self, data):
        play_style = set()
        favorite_shot = set()
        years_on_tour = []
        country_zone = set()
        gender = set()
        height = []
        career_high_rank = []
        career_high_years_ago = []
        personality_tags = set()
        previous_winner = set()

        for row in data:
            play_style.add(row["play_style"])
            favorite_shot.add(row["favorite_shot"])
            years_on_tour.append(row["years_on_tour"])
            country_zone.add(row["country_zone"])
            gender.add(row["gender"])
            height.append(row["height"])
            career_high_rank.append(row["career_high_rank"])
            career_high_years_ago.append(row["career_high_years_ago"])
            previous_winner.add(row["previous_winner"])

        years_on_tour = ['Fewer', 'Medium', 'More']
        height = ['Shorter', 'Medium', 'Taller']
        career_high_rank = ['Lower', 'Medium', 'Higher']
        career_high_years_ago = ['Peak was not recent', 'Peak was recent but not this year', 'Peak is this year']
        personality_tags = sorted(list(self.tag_categories['Category'].unique()))
        # Remove "Ignore" from personality tags
        personality_tags.remove("Ignore")

        return {
            "play_style": list(play_style),
            "favorite_shot": list(favorite_shot),
            "years_on_tour": years_on_tour,
            "country_zone": list(country_zone),
            "gender": list(gender),
            "height": height,
            "career_high_rank": career_high_rank,
            "career_high_years_ago": career_high_years_ago,
            "previous_winner": list(previous_winner),
            "personality_tags": personality_tags
        }

    def get_personality_tags(self):
        with self.driver.session() as session:
            result = session.read_transaction(self._get_personality_tags)
            return self._process_personality_tags(result)
        
    @staticmethod
    def _get_personality_tags(tx):
        query = """MATCH (p:Player) 
            RETURN p.personality_tags AS personality_tags
            """

        result = tx.run(query)
        return result.data()
        
    def _process_personality_tags(self, data):
        personality_tags = set()

        for row in data:
            personality_tags.add(row["personality_tags"])

        # Flatten personality tags (each player has a list of tags)
        personality_tags = set([tag for tags in personality_tags for tag in tags.split(", ")])

        return {
            "personality_tags": sorted(list(personality_tags)),
        }
    
    #############################
    # Get players by parameters #
    #############################
    def get_players_by_preferences(self, preferences):
        with self.driver.session() as session:
            result = session.execute_read(self._get_players_by_preferences, preferences)
            return list(result)

    @staticmethod
    def _get_players_by_preferences(tx, preferences):
        category_to_quantile = {
            'Fewer': [0, 33],
            'Medium': [33, 66],
            'More': [66, 100],
            'Shorter': [0, 33],
            'Taller': [66, 100],
            'Lower': [66, 100],
            'Higher': [0, 33],
            'Peak was not recent': [66, 100],
            'Peak was recent but not this year': [33, 66],
            'Peak is this year': [0, 33],
        }

        query = """
        MATCH (p:Player)
        """
        if any(preferences.values()):  # Check if any preferences are set
            query += "WHERE "
            for key, value in preferences.items():
                if isinstance(value, list) and value:  # If value is a non-empty list
                    if key in ['years_on_tour', 'height', 'career_high_rank', 'career_high_years_ago']:
                        for category in value:
                            quantile = category_to_quantile[category]
                            query += f"(percentileCont(p.{key}, 0.01) >= {quantile[0]} AND percentileCont(p.{key}, 0.01) <= {quantile[1]}) AND "
                    else:
                        query += f"(p.{key} IN {value}) AND "
                elif isinstance(value, str) and value:  # If value is a non-empty string
                    query += f"(p.{key} = '{value}') AND "
            query = query[:-5]  # remove the last " AND "
        query += "RETURN p"
        result = tx.run(query)
        return [dict(record["p"]) for record in result]

    #############################
    # Save user preferences
    #############################
    def save_user_preferences(self, user_id, preferences):
        with self.driver.session() as session:
            session.write_transaction(self._save_user_preferences, user_id, preferences)

    @staticmethod
    def _save_user_preferences(tx, user_id, preferences):
        query = """
        MATCH (u:User {id: $user_id})
        SET u.preferences = $preferences
        """
        tx.run(query, user_id=user_id, preferences=preferences)
