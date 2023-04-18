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
                self._create_and_return_user, name, user_id, email
            )

            return result

    @staticmethod
    def _create_and_return_user(tx, name, user_id, email):
        # MERGE will try to match the entire pattern and if it does not exist, it creates it.
        query = """ MERGE (u:User { name: $name, user_id: $user_id })
                SET u.email = $email
                RETURN u.name AS name, u.user_id AS user_id, u.email AS email
            """
        result = tx.run(query, name=name, user_id=user_id, email=email)

        # Turn the result into a list of dictionaries
        result = result.data()

        # Check that only one person with this name and id exists
        Uniqueness_Check(result)

        person = result[0]
        return person

    ############################
    # Create group
    ############################
    def create_group(self, group_name, group_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(self._create_and_return_group, group_name, group_id)

            print("Result in main method:", result)

        # If creation date is null, add it
        if result["created"] is None:
            result = self.add_creation_date(group_id)
            print("Result after adding creation date:", result)
        return result

    @staticmethod
    def _create_and_return_group(tx, group_name, group_id):
        query = """ MERGE (g:Group { group_name: $group_name, group_id: $group_id }) 
                RETURN g.group_name AS group_name, g.group_id AS group_id, g.created AS created
            """
        result = tx.run(query, group_name=group_name, group_id=group_id).data()
        Uniqueness_Check(result)
        return result[0]

    ############################
    # Add creation date
    ############################
    def add_creation_date(self, group_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(self._add_creation_date, group_id)

            return result

    @staticmethod
    def _add_creation_date(tx, group_id):
        # Get today's date in the format YYYY-MM-DD
        today = datetime.today().strftime("%Y-%m-%d")

        query_date = """ MATCH (g:Group { group_id: $group_id })
                WHERE g.created IS NULL
                SET g.created = $today
                RETURN g.group_name AS group_name, g.group_id AS group_id, g.created AS created
            """
        result = tx.run(query_date, group_id=group_id, today=today).data()
        Uniqueness_Check(result)
        return result[0]

    ############################
    # Get user info
    ############################
    def get_user(self, user_id):
        with self.driver.session(database="neo4j") as user:
            result = user.execute_read(self._get_user, user_id)

            return result

    @staticmethod
    def _get_user(tx, user_id):
        query = """ MATCH (u:User { user_id: $user_id })
                RETURN u.user_id AS user_id, u.name AS name, u.email AS email
            """
        result = tx.run(query, user_id=user_id).data()
        Uniqueness_Check(result)
        return result[0]

    ############################
    # Add user to session
    ############################
    def add_user_to_group(self, user_id, group_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._add_user_to_session, user_id, group_id
            )

            return result

    @staticmethod
    def _add_user_to_session(tx, user_id, group_id):
        # Get today's date in the format YYYY-MM-DD
        today = datetime.today().strftime("%Y-%m-%d")

        query = """ MATCH (u:User { user_id: $user_id })
                MATCH (g:Group { group_id: $group_id })
                MERGE (u)-[r:WITH { date: $today }]->(g)
                RETURN u.name AS name, u.user_id AS user_id, g.group_id AS group_id, r.date AS date
            """
        result = tx.run(
            query, user_id=user_id, group_id=group_id, today=today
        ).data()
        Uniqueness_Check(result)
        person = result[0]
        return person

    def find_person(self, person_name):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._find_and_return_person, person_name)
            for row in result:
                print("Found person: {row}".format(row=row))

    @staticmethod
    def _find_and_return_person(tx, person_name):
        query = (
            "MATCH (p:Person) " "WHERE p.name = $person_name " "RETURN p.name AS name"
        )
        result = tx.run(query, person_name=person_name)
        return [row["name"] for row in result]

    def find_person_by_id(self, user_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._find_and_return_person_by_id, user_id)
            print(result)

            Uniqueness_Check(result)

            return result[0]

    @staticmethod
    def _find_and_return_person_by_id(tx, user_id):
        query = (
            "MATCH (p:Person) " "WHERE p.user_id = $user_id " "RETURN p.name AS name"
        )
        result = tx.run(query, user_id=user_id)
        return [row["name"] for row in result]

    def get_users_by_session(self, session_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_users_by_session, session_id)
            for row in result:
                print("Found person: {row}".format(row=row))

            return result

    @staticmethod
    def _get_users_by_session(tx, session_id):
        query = """
            MATCH (p:Person)-[:ATTENDED]->(s:Session)
            WHERE s.session_id = $session_id
            RETURN p.name AS name, p.email AS email
            """
        result = tx.run(query, session_id=session_id).data()
        return result


# if __name__ == "__main__":
# Aura queries use an encrypted connection using the "neo4j+s" URI scheme
# app = App()
# app.create_user("Asaf Kedem", "123", "https://www.google.com", 0, "18:07")
# app.close()
