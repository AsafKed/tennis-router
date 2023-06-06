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

        years_on_tour = np.percentile(years_on_tour, [33, 66])
        height = np.percentile(height, [33, 66])
        career_high_rank = np.percentile(career_high_rank, [33, 66])
        career_high_years_ago = np.percentile(career_high_years_ago, [33, 66])
        personality_tags = sorted(list(self.tag_categories['Category'].unique()))
        # Remove "Ignore" from personality tags
        personality_tags.remove("Ignore")

        return {
            "play_style": list(play_style),
            "favorite_shot": list(favorite_shot),
            "years_on_tour": years_on_tour.tolist(),
            "country_zone": list(country_zone),
            "gender": list(gender),
            "height": height.tolist(),
            "career_high_rank": career_high_rank.tolist(),
            "career_high_years_ago": career_high_years_ago.tolist(),
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
    