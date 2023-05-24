from neo4j import GraphDatabase

# Import helpers
from .Neo4j_Helpers import normalize_players

# This enables os.getenv() to read the .env file
import os
from dotenv import load_dotenv

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
            result = normalize_players(result)
            print(result)
            return result

    @staticmethod
    def _get_liked_players(tx, user_id):
        query = """ MATCH (u:User {user_id: $user_id})-[:LIKES]->(p:Player)
                    RETURN p.name AS name, p.player_id AS player_id, p.rank as rank, p.image as image,
                    p.rank_points as rank_points, p.win_count as win_count, p.loss_count as loss_count,
                    p.tournaments_played as tournaments_played, p.win_percent as win_percent,
                    p.aces_avg as aces_avg, p.double_faults_avg as double_faults_avg,
                    p.service_points_avg as service_points_avg, p.first_serve_points_won_avg as first_serve_points_won_avg,
                    p.second_serve_points_won_avg as second_serve_points_won_avg, p.serve_games_avg as serve_games_avg,
                    p.break_points_saved_avg as break_points_saved_avg, p.break_points_faced_avg as break_points_faced_avg
                    ORDER BY p.name
                """
        result = tx.run(query, user_id=user_id).data()
        return result


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
                RETURN p.player_id AS player_id, similarity
                ORDER BY similarity DESC
                LIMIT 10
                """
        result = tx.run(query, user_id=user_id, liked_players_attributes=liked_players_attributes, attribute_weights_keys=attribute_weights_keys, attribute_weights_values=attribute_weights_values)
        return [record["player_id"] for record in result]



    ##############################
    # Create player recommendations
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