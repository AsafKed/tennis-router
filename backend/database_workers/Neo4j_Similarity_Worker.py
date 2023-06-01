from neo4j import GraphDatabase

# To use the .env file
import os
from dotenv import load_dotenv
load_dotenv()

from .Neo4j_Player_Worker import Player_Worker

# Other imports
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer

class Similarity_Worker:
    def __init__(self):
        uri = os.getenv('NEO4J_URI')
        user = os.getenv('NEO4J_USERNAME')
        password = os.getenv('NEO4J_PASSWORD')

        self.driver = GraphDatabase.driver(uri, auth=(user, password))

        self.get_players()

    def close(self):
        self.driver.close()

    def get_players(self):
        player_worker = Player_Worker()
        self.players = player_worker.get_all_players_with_personal_data()
        player_worker.close()

    #############################
    # Create euclidean similarity relations with scores (0–1) based on numeric features
    #############################
    def create_numeric_similarities(self):
        with self.driver.session() as session:
            session.execute_write(self._create_log_values)
            session.execute_write(self._scale_properties)
            session.execute_write(self._write_scaled_properties)
            session.execute_write(self._create_euclidean_similarities)

    @staticmethod
    def _create_log_values(tx):
        query = """ MATCH (p:Player)
                    SET p.log_rank = log(p.rank)
                    SET p.log_career_high_rank = log(p.career_high_rank)
                    RETURN p
                """
        
        result = tx.run(query)
        return result
    
    @staticmethod
    def _scale_properties(tx):
        # Check if the in-memory graph exists
        check_query = """ CALL gds.graph.exists('euclidean_similarity_graph') YIELD exists """
        result = tx.run(check_query)
        graph_exists = result.single()[0]

        # If the in-memory graph exists, drop it
        if graph_exists:
            drop_query = """ CALL gds.graph.drop('euclidean_similarity_graph') """
            tx.run(drop_query)
        else:
            print("No graph to drop")

        # Create a new in-memory graph
        create_query = """ CALL gds.graph.project(
                            'euclidean_similarity_graph',
                            'Player',
                            '*',
                            {nodeProperties: ['log_rank', 'age', 'height', 'log_career_high_rank', 'years_on_tour', 'career_high_year']
                            }
                        )
                    """
        tx.run(create_query)

        # Scale the properties
        query = """ CALL gds.alpha.scaleProperties.mutate(
                        'euclidean_similarity_graph',
                        {nodeProperties: ['log_rank', 'age', 'height', 'log_career_high_rank', 'years_on_tour', 'career_high_year'],
                        scaler: 'minMax',
                        mutateProperty: 'scaled_properties'})
                        YIELD nodePropertiesWritten
                """
        
        tx.run(query)


    @staticmethod
    def _write_scaled_properties(tx):
        # Check if the scaled_properties already exist
        check_query = """ MATCH (p:Player)
                        WHERE p.scaled_properties IS NOT NULL
                        RETURN count(p) > 0 as exists 
                    """
        result = tx.run(check_query)
        exists = result.single()[0]

        # Take the in_memory graph and write the scaled properties to the database
        if not exists:
            query = """ CALL gds.graph.nodeProperties.write(
                            'euclidean_similarity_graph',
                            ['scaled_properties']
                        )
                        YIELD propertiesWritten
                    """
            
            tx.run(query)

    @staticmethod
    def _create_euclidean_similarities(tx):
        query = """ MATCH (p1:Player), (p2:Player)
                    WHERE id(p1) <> id(p2)
                    WITH p1, p2, gds.similarity.euclidean(p1.scaled_properties, p2.scaled_properties) AS similarity
                    MERGE (p1)-[r:SIMILARITY]->(p2)
                    SET r.numeric = similarity
                """
        
        tx.run(query)

    # This had a ranking, but I'm leaving it out because ranking is a directed property, but the relations are undirected    
    
    #############################
    # Create personality tag similarity with scores (0–1) based on personality tags
    #############################
    # Create BOW vectors for the personality_tags of each player
    def create_bow_vectors(self):
        all_tags = set()
        for player in self.players:
            tags = set(player['personality_tags'])
            all_tags.update(tags)

        all_tags = sorted(all_tags)

        # Create a CountVectorizer with the unique tags as the vocabulary
        vectorizer = CountVectorizer(vocabulary=list(all_tags))

        # Create a BOW representation for each player
        for player in self.players:
            bow = vectorizer.transform([' '.join(player['personality_tags'])]).toarray()[0]
            player['personality_tags_bow'] = bow.tolist()

        # Upload the BOW representations to Neo4j
        with self.driver.session() as session:
            for player in self.players:
                session.execute_write(self._upload_bow, player)

    @staticmethod
    def _upload_bow(tx, player):
        query = """ MATCH (p:Player {name: $name})
                    SET p.personality_tags_bow = $bow
                """
        tx.run(query, name=player['name'], bow=player['personality_tags_bow'])


    # Create tag similarity relations between all players based on the BOW representations
    def create_tag_similarities(self):
        with self.driver.session() as session:
            result = session.execute_write(self._create_tag_similarities)
            return result
        
    @staticmethod
    def _create_tag_similarities(tx):
        query = """ MATCH (p1:Player)-[s:SIMILARITY]-(p2:Player)
                    WHERE p1 <> p2
                    WITH p1, p2, s, p1.personality_tags_bow AS p1_tags, p2.personality_tags_bow AS p2_tags
                    SET s.tag_similarity = gds.similarity.cosine(p1_tags, p2_tags)
                    RETURN p1.name, p2.name, s.tag_similarity AS cosineSimilarity
                """
        
        result = tx.run(query)
        return result


    #############################
    # Create similarity rating for categorical properties
    #############################
    def create_categorical_vectors(self):
        # Create a string for each player that concatenates all the categorical properties
        for player in self.players:
            categorical_string = ' '.join([str(player[prop]) for prop in ['play_style', 'status', 'grass_advantage', 'hand', 'previous_libema_winner', 'country_zone', 'favorite_shot']])
            player['categorical_string'] = categorical_string

        # Create a CountVectorizer with the unique tags as the vocabulary
        vectorizer = CountVectorizer()

        # Fit the CountVectorizer to all the categorical_string of all players
        all_categorical_strings = [player['categorical_string'] for player in self.players]
        vectorizer.fit(all_categorical_strings)
        
        # Create a BOW representation for each player
        for player in self.players:
            bow = vectorizer.transform([player['categorical_string']]).toarray()[0]
            player['categorical_bow'] = bow.tolist()

        # Upload the BOW representations to Neo4j
        with self.driver.session() as session:
            for player in self.players:
                session.execute_write(self._upload_categorical_bow, player)

    @staticmethod
    def _upload_categorical_bow(tx, player):
        query = """ MATCH (p:Player {name: $name})
                    SET p.categorical_bow = $bow
                """
        tx.run(query, name=player['name'], bow=player['categorical_bow'])

    # Create cosine similarity relations between all players based on the BOW representations
    def create_categorical_similarities(self):
        with self.driver.session() as session:
            result = session.execute_write(self._create_cosine_similarities)
            return result

    @staticmethod
    def _create_cosine_similarities(tx):
        query = """ MATCH (p1:Player)-[s:SIMILARITY]-(p2:Player)
                    WHERE p1 <> p2
                    WITH p1, p2, s, p1.categorical_bow AS p1_bow, p2.categorical_bow AS p2_bow
                    SET s.categorical = gds.similarity.cosine(p1_bow, p2_bow)
                    RETURN p1.name, p2.name, s.categorical AS cosineSimilarity
                """
        result = tx.run(query)
        return result


    #############################
    # Create weighted similarity types, to avoid overloading the memory of the server by computing this anew every time
    #############################
    def create_weighted_similarities(self):
        with self.driver.session() as session:
            result = session.execute_write(self._create_weighted_similarities)
            return result
        
    @staticmethod
    def _create_weighted_similarities(tx):
        # This should take all combinations of weights of the three similarity types.
        # That means that for a relationship, similarity_100=1*tag_similarity + 0*numeric + 0*categorical, similarity_010=0*tag_similarity + 1*numeric + 0*categorical, etc.
        # This is a bit of a hack, but it works
        query = """ MATCH (p1:Player)-[s:SIMILARITY]-(p2:Player)
                    WHERE p1 <> p2
                    WITH p1, p2, s, s.tag_similarity AS tag_similarity, s.numeric AS numeric, s.categorical AS categorical
                    SET s.tag_numeric = 0.5*tag_similarity + 0.5*numeric, 
                    s.tag_categorical = 0.5*tag_similarity + 0.5*categorical, 
                    s.numeric_categorical = 0.5*numeric + 0.5*categorical, 
                    s.all = 0.3333*tag_similarity + 0.3333*numeric + 0.3333*categorical
                """
        
        result = tx.run(query)
        return result

    #############################
    # Get similarities between all players
    #############################
    def get_all_similarities(self):
        with self.driver.session() as session:
            result = session.execute_read(self._get_all_similarities)
            return pd.DataFrame(result)

    @staticmethod
    def _get_all_similarities(tx):
        query = """ MATCH (p1:Player)-[s:SIMILARITY]->(p2:Player)
                    RETURN p1.name AS player1, s.numeric AS numeric, s.tag_similarity as tag_similarity, s.categorical AS categorical, s.tag_numeric AS tag_numeric, s.tag_categorical AS tag_categorical, s.numeric_categorical AS numeric_categorical, s.all AS all, p2.name AS player2
                """
        
        result = tx.run(query)
        return result.data()
