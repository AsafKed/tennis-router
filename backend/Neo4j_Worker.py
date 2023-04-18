from neo4j import GraphDatabase
import logging
from neo4j.exceptions import ServiceUnavailable

import os
from datetime import datetime

# Import error raises
from Neo4j_Errors import Uniqueness_Check

# This enables os.getenv() to read the .env file
from dotenv import load_dotenv
load_dotenv()


class App:
    def __init__(self):
        uri = os.getenv("NEO4J_URI")
        user = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")

        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        # Don't forget to close the driver connection when you are finished with it
        self.driver.close()

    def create_user(self, name, user_id, email):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._create_and_return_user, name, user_id, email)

            return result

    @staticmethod
    def _create_and_return_user(tx, name, user_id, email):
        # MERGE will try to match the entire pattern and if it does not exist, it creates it.
        query = (
            """ MERGE (p:Person { name: $name, user_id: $user_id })
                SET p.email = $email
                RETURN p.name AS name, p.user_id AS user_id, p.email AS email
            """
        )
        result = tx.run(query, name=name, user_id=user_id, email=email)
                        # session_id=session_id, today=today,
                        # joined=joined)

        # Turn the result into a list of dictionaries
        result = result.data()
        
        # Check that only one person with this name and id exists
        Uniqueness_Check(result)        
        
        person = result[0]
        return person

    def create_session(self, session_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._create_and_return_session, session_id)

            print("Result in main method:", result)

        # If creation date is null, add it
        if result["created"] is None:
            self.add_creation_date(session_id)
            result = self.get_session(session_id)
            print("Result after adding creation date:", result)
        return result
        
    @staticmethod
    def _create_and_return_session(tx, session_id):
        query = (
            """ MERGE (s:Session { session_id: $session_id }) 
                RETURN s.session_id AS session_id, s.created AS created
            """
        )
        result = tx.run(query, session_id=session_id).data()
        Uniqueness_Check(result)
        return result[0]
    
    def get_session(self, session_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._get_session, session_id)

            return result
        
    @staticmethod
    def _get_session(tx, session_id):
        query = (
            """ MATCH (s:Session { session_id: $session_id })
                RETURN s.session_id AS session_id, s.created AS created
            """
        )
        result = tx.run(query, session_id=session_id).data()
        Uniqueness_Check(result)
        return result[0]
    
    def add_creation_date(self, session_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._add_creation_date, session_id)

            return result
        
    @staticmethod
    def _add_creation_date(tx, session_id):
        # Get today's date in the format YYYY-MM-DD
        today = datetime.today().strftime('%Y-%m-%d')

        query_date = (
            """ MATCH (s:Session { session_id: $session_id })
                WHERE s.created IS NULL
                SET s.created = $today
                RETURN s.session_id AS session_id, s.created AS created
            """
        )
        result = tx.run(query_date, session_id=session_id, today=today).data()
        Uniqueness_Check(result)
        return result[0]
    
    def add_user_to_session(self, user_id, session_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._add_user_to_session, user_id, session_id)

            return result
        
    @staticmethod
    def _add_user_to_session(tx, user_id, session_id):
        # Get today's date in the format YYYY-MM-DD
        today = datetime.today().strftime('%Y-%m-%d')

        query = (
            """ MATCH (p:Person { user_id: $user_id })
                MATCH (s:Session { session_id: $session_id })
                MERGE (p)-[r:ATTENDED { date: $today }]->(s)
                RETURN p.name AS name, p.user_id AS user_id, s.session_id AS session_id, r.date AS date
            """
        )
        result = tx.run(query, user_id=user_id, session_id=session_id, today=today).data()
        Uniqueness_Check(result)
        person = result[0]
        return person
        
    def find_person(self, person_name):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._find_and_return_person, person_name)
            for row in result:
                print("Found person: {row}".format(row=row))

    @staticmethod
    def _find_and_return_person(tx, person_name):
        query = (
            "MATCH (p:Person) "
            "WHERE p.name = $person_name "
            "RETURN p.name AS name"
        )
        result = tx.run(query, person_name=person_name)
        return [row["name"] for row in result]
    
    def find_person_by_id(self, user_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._find_and_return_person_by_id, user_id)
            print(result)
            
            Uniqueness_Check(result)
            
            return result[0]

    @staticmethod
    def _find_and_return_person_by_id(tx, user_id):
        query = (
            "MATCH (p:Person) "
            "WHERE p.user_id = $user_id "
            "RETURN p.name AS name"
        )
        result = tx.run(query, user_id=user_id)
        return [row["name"] for row in result]

    def get_users_by_session(self, session_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._get_users_by_session, session_id)
            for row in result:
                print("Found person: {row}".format(row=row))
            
            return result

    @staticmethod
    def _get_users_by_session(tx, session_id):
        query = (
            """
            MATCH (p:Person)-[:ATTENDED]->(s:Session)
            WHERE s.session_id = $session_id
            RETURN p.name AS name, p.email AS email
            """
        )
        result = tx.run(query, session_id=session_id).data()
        return result

# if __name__ == "__main__":
    # Aura queries use an encrypted connection using the "neo4j+s" URI scheme
    # app = App()
    # app.create_user("Asaf Kedem", "123", "https://www.google.com", 0, "18:07")
    # app.close()