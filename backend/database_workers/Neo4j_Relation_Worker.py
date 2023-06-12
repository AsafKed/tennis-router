from neo4j import GraphDatabase
# This enables os.getenv() to read the .env file
import os
from dotenv import load_dotenv

# Load the .env file
load_dotenv()
from datetime import datetime

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
    def create_likes_relation(self, user_id, player_name):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._create_likes_relation, user_id, player_name)

    @staticmethod
    def _create_likes_relation(tx, user_id, player_name):
        query = """ MATCH (u:User {user_id: $user_id}), (p:Player {name: $player_name})
                    MERGE (u)-[:LIKES]->(p)
                """
        tx.run(query, user_id=user_id, player_name=player_name)

    ##############################
    # Delete user LIKES player
    ##############################
    def delete_likes_relation(self, user_id, player_name):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._delete_likes_relation, user_id, player_name)

    @staticmethod
    def _delete_likes_relation(tx, user_id, player_name):
        query = """ MATCH (u:User {user_id: $user_id})-[r:LIKES]->(p:Player {name: $player_name})
                    DELETE r
                """
        tx.run(query, user_id=user_id, player_name=player_name)

    ##############################
    # Get liked players
    ##############################
    def get_liked_players(self, user_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_liked_players, user_id)
            return result

    @staticmethod
    def _get_liked_players(tx, user_id):
        query = """ MATCH (u:User {user_id: $user_id})-[:LIKES]->(p:Player)
                    RETURN p.name as name, p.country as country, p.rank as rank, p.rank_level as rank_level, p.status as status, p.experience as experience, p.play_style as play_style, p.age as age, p.height as height, p.favorite_shot as favorite_shot, p.hand as hand, p.personality_tags as personality_tags, p.personality_long as personality_long,
                    p.grass_advantage as grass_advantage, p.career_high_rank as career_high_rank, p.years_on_tour as years_on_tour, p.coach as coach, p.image_url as image_url, p.gender as gender
                    ORDER BY p.name
                """
        result = tx.run(query, user_id=user_id).data()
        return result
    
    def get_liked_players_names(self, user_id):
        liked_players = self.get_liked_players(user_id)
        liked_players_names = []
        
        for player in liked_players:
            liked_players_names.append(player["name"])
        
        return liked_players_names
    
    def get_liked_players_countries(self, user_id):
        liked_players = self.get_liked_players(user_id)
        liked_players_countries = []
        
        for player in liked_players:
            liked_players_countries.append(player["country"])
        
        return liked_players_countries


    def get_liked_player_attributes(self, user_id):
        liked_players = self.get_liked_players(user_id)
        liked_players_attributes = []
        
        for player in liked_players:
            player_attributes = {
                "rank": player["rank"],
                "rank_points": player["rank_points"],
                "win_count": player["win_count"],
                "loss_count": player["loss_count"],
                "tournaments_played": player["tournaments_played"],
                "win_percent": player["win_percent"],
                "aces_avg": player["aces_avg"],
                "double_faults_avg": player["double_faults_avg"],
                "service_points_avg": player["service_points_avg"],
                "first_serve_points_won_avg": player["first_serve_points_won_avg"],
                "second_serve_points_won_avg": player["second_serve_points_won_avg"],
                "serve_games_avg": player["serve_games_avg"],
                "break_points_saved_avg": player["break_points_saved_avg"],
                "break_points_faced_avg": player["break_points_faced_avg"]
            }
            liked_players_attributes.append(player_attributes)
        
        return liked_players_attributes

    
    ##############################
    # Get similar players
    ##############################
    def get_similar_players_based_on_attributes(self, user_id, attribute_weights):
        liked_players_attributes = self.get_liked_player_attributes(user_id)
        with self.driver.session(database="neo4j") as session:
            return session.execute_read(self._get_similar_players_based_on_attributes, user_id, liked_players_attributes, attribute_weights)

    @staticmethod
    def _get_similar_players_based_on_attributes(tx, user_id, liked_players_attributes, attribute_weights):
        attribute_weights_keys = list(attribute_weights.keys())
        attribute_weights_values = list(attribute_weights.values())

        query = """
                UNWIND $liked_players_attributes AS attrs
                MATCH (p:Player) WHERE NOT (p)<-[:LIKES]-(:User {user_id: $user_id})
                WITH p, attrs,
                    apoc.map.fromLists($attribute_weights_keys, $attribute_weights_values) AS attribute_weights
                WITH p, attrs,
                    reduce(s = 0, key IN keys(attribute_weights) |
                        s + (CASE key
                                WHEN 'rank' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'rank_points' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'win_count' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'loss_count' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'tournaments_played' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'win_percent' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'aces_avg' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'double_faults_avg' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'service_points_avg' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'first_serve_points_won_avg' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'second_serve_points_won_avg' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'serve_games_avg' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'break_points_saved_avg' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                WHEN 'break_points_faced_avg' THEN coalesce(attrs[key] * attribute_weights[key], 0)
                                ELSE 0
                                END)) AS attrs_weighted_sum,
                    reduce(t = 0, key IN keys(attribute_weights) |
                        t + (CASE key
                                WHEN 'rank' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'rank_points' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'win_count' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'loss_count' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'tournaments_played' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'win_percent' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'aces_avg' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'double_faults_avg' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'service_points_avg' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'first_serve_points_won_avg' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'second_serve_points_won_avg' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'serve_games_avg' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'break_points_saved_avg' THEN coalesce(p[key] * attribute_weights[key], 0)
                                WHEN 'break_points_faced_avg' THEN coalesce(p[key] * attribute_weights[key], 0)
                                ELSE 0
                                END)) AS player_weighted_sum
                WITH p, attrs_weighted_sum, player_weighted_sum,
                    gds.similarity.cosine(
                        collect(attrs_weighted_sum),
                        collect(player_weighted_sum)
                    ) AS similarity
                RETURN p.name AS name, similarity
                ORDER BY similarity DESC
                LIMIT 10
                """
        result = tx.run(query, user_id=user_id, liked_players_attributes=liked_players_attributes, attribute_weights_keys=attribute_weights_keys, attribute_weights_values=attribute_weights_values)
        return [record["player_name"] for record in result]



    ##############################
    # Create player recommendations
    ##############################
    def create_player_recommend(self, user_id, player_name, liked_player_name=None, similarity=None, similarity_type=None, recommendation_type='player'):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._create_player_recommend, user_id, player_name, liked_player_name, similarity, similarity_type, recommendation_type=recommendation_type)

    @staticmethod
    def _create_player_recommend(tx, user_id, player_name, liked_player_name, similarity, similarity_type, recommendation_type='player'):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        query = """ MATCH (u:User {user_id: $user_id})
                    MATCH (p:Player {name: $player_name})
                    MERGE (u)-[:RECOMMEND {time_created: $timestamp, recommendation_type: $recommendation_type, liked_player: $liked_player_name, similarity: $similarity, similarity_type: $similarity_type}]->(p)
                    MERGE (p)-[:RECOMMENDED_BY {time_created: $timestamp}]->(lp)
                """
        tx.run(query, user_id=user_id, player_name=player_name, timestamp=timestamp, liked_player_name=liked_player_name or "", similarity=similarity or "", similarity_type=similarity_type or "", recommendation_type=recommendation_type)

    ##############################
    # Delete player recommend relations
    ##############################
    def delete_player_recommend(self, user_id, player_name, recommendation_type='player'):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._delete_player_recommend, user_id, player_name, recommendation_type=recommendation_type)

    @staticmethod
    def _delete_player_recommend(tx, user_id, player_name, recommendation_type='player'):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # Copy the relation into a RECOMMENDED relation, and then delete the RECOMMEND relation
        query = """ MATCH (u:User {user_id: $user_id})-[r:RECOMMEND {recommendation_type: $recommendation_type}]->(p:Player {name: $player_name})
                    MERGE (u)-[:RECOMMENDED {time_removed: datetime()}]->(p)
                    DELETE r
                """
        tx.run(query, user_id=user_id, player_name=player_name, timestamp=timestamp, recommendation_type=recommendation_type)
    
    ##############################
    # Get player recommendations
    ##############################
    def get_player_recommend_relations(self, user_id, recommendation_type='player'):
        with self.driver.session(database="neo4j") as session:
            return session.execute_read(self._get_player_recommend_relations, user_id, recommendation_type=recommendation_type)
        
    @staticmethod
    def _get_player_recommend_relations(tx, user_id, recommendation_type='player'):
        # Get similarity weight, recommendation type, player name, and liked player name
        query = """ MATCH (u:User {user_id: $user_id})-[r:RECOMMEND {recommendation_type: $recommendation_type}]->(p:Player)
                    RETURN r.similarity AS similarity, r.similarity_type AS similarity_type,
                    r.recommendation_type AS recommendation_type, p.name AS player_name, 
                    r.liked_player AS liked_player_name
                """
        
        result = tx.run(query, user_id=user_id, recommendation_type=recommendation_type)
        # Return a list of dictionaries
        return [record.data() for record in result]

    ##############################
    # Create match recommendations
    ##############################
    def create_match_recommend(self, user_id, match_name, priority, recommendation_type='player'):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._create_match_recommend, user_id, match_name, priority, recommendation_type=recommendation_type)

    @staticmethod
    def _create_match_recommend(tx, user_id, match_name, priority, recommendation_type='player'):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        query = """ MATCH (u:User {user_id: $user_id})
                    MATCH (m:Match {match_name: $match_name})
                    MERGE (u)-[:RECOMMEND {time_created: $timestamp, recommendation_type: $recommendation_type, priority: $priority}]->(m)
                """
        tx.run(query, user_id=user_id, match_name=match_name, timestamp=timestamp, priority=priority, recommendation_type=recommendation_type)

    ##############################
    # Delete match recommend relations
    ##############################
    def delete_match_recommend(self, user_id, match_name, recommendation_type='player'):
        with self.driver.session(database="neo4j") as session:
            session.execute_write(self._delete_match_recommend, user_id, match_name, recommendation_type=recommendation_type)

    @staticmethod
    def _delete_match_recommend(tx, user_id, match_name, recommendation_type='player'):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # Copy the relation into a RECOMMENDED relation, and then delete the RECOMMEND relation
        query = """ MATCH (u:User {user_id: $user_id})-[r:RECOMMEND {recommendation_type: $recommendation_type}]->(m:Match {match_name: $match_name})
                    MERGE (u)-[:RECOMMENDED {time_removed: datetime()}]->(m)
                    DELETE r
                """
        tx.run(query, user_id=user_id, match_name=match_name, timestamp=timestamp, recommendation_type=recommendation_type)

    ##############################
    # Get match recommendations
    ##############################
    def get_match_recommend_relations(self, user_id, recommendation_type='player'):
        with self.driver.session(database="neo4j") as session:
            return session.execute_read(self._get_match_recommend_relations, user_id, recommendation_type=recommendation_type)
        

    @staticmethod
    def _get_match_recommend_relations(tx, user_id, recommendation_type='player'):
        query = """ MATCH (u:User {user_id: $user_id})-[r:RECOMMEND {recommendation_type: $recommendation_type}]->(m:Match)
                    RETURN r.priority AS priority, r.recommendation_type AS recommendation_type, m.match_name AS match_name
                """
        
        result = tx.run(query, user_id=user_id, recommendation_type=recommendation_type)
        # Return a list of dictionaries
        return [record.data() for record in result]