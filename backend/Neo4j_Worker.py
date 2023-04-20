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

    ############################
    # Create user
    ############################
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
    # Add user to group
    ############################
    def add_user_to_group(self, user_id: str, group_name: str):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._add_user_to_group, user_id, group_name
            )

            return result

    @staticmethod
    def _add_user_to_group(tx, user_id: str, group_name: str):
        # Get today's date in the format YYYY-MM-DD
        today = datetime.today().strftime("%Y-%m-%d")

        query = """ MATCH (u:User { user_id: $user_id })
                MATCH (g:Group { group_name: $group_name })
                MERGE (u)-[r:WITH { date: $today }]->(g)
                RETURN u.name AS name, u.user_id AS user_id, g.group_name AS group_name, r.date AS date
            """
        result = tx.run(
            query, user_id=user_id, group_name=group_name, today=today
        ).data()
        Uniqueness_Check(result)
        person = result[0]
        return person
    
    ############################
    # Remove user from group
    ############################
    # Get join date
    def get_join_date(self, user_id: str, group_name: str):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._get_join_date, user_id, group_name
            )

            return result
        
    @staticmethod
    def _get_join_date(tx, user_id: str, group_name: str):
        query = """ MATCH (u:User { user_id: $user_id })-[r:WITH]->(g:Group { group_name: $group_name })
                RETURN r.date AS date
            """
        result = tx.run(query, user_id=user_id, group_name=group_name).data()
        if not result:
            raise ValueError(f"No join date found for user {user_id} and group {group_name}")

        date = result[0]['date']
        return date

    # Create left group relationship
    def remove_user_from_group(self, user_id: str, group_name: str):
        join_date = self.get_join_date(user_id, group_name)

        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._remove_user_from_group, user_id, group_name, join_date
            )

            return result
        
    @staticmethod
    def _remove_user_from_group(tx, user_id: str, group_name: str, join_date):
        # Get today's date in the format YYYY-MM-DD
        today = datetime.today().strftime("%Y-%m-%d")

        query = """ MATCH (u:User { user_id: $user_id })-[r:WITH]->(g:Group { group_name: $group_name })
                CREATE (u)-[l:LEFT { date: $today, join_date: $join_date }]->(g)
                DELETE r
                RETURN u.name AS name, u.user_id AS user_id, g.group_name AS group_name, l.date AS date, l.join_date AS join_date
            """
        result = tx.run(query, user_id=user_id, group_name=group_name, today=today, join_date=join_date).data()
        person = result[0]
        return person

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
    # Find person
    ############################
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

    ############################
    # Update user preferences
    ############################
    def update_user_preferences(self, user_id, preference1, preference2, preference3):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self._update_user_preferences,
                user_id,
                preference1,
                preference2,
                preference3,
            )

            return result
        
    @staticmethod
    def _update_user_preferences(tx, user_id, preference1, preference2, preference3):
        query = """ MATCH (u:User { user_id: $user_id })
                SET u.preference1 = $preference1, u.preference2 = $preference2, u.preference3 = $preference3
                RETURN u.name AS name, u.user_id AS user_id, u.preference1 AS preference1, u.preference2 AS preference2, u.preference3 AS preference3
            """
        result = tx.run(query, user_id=user_id, preference1=preference1, preference2=preference2, preference3=preference3).data()
        person = result[0]
        return person

    ############################
    # Get users by group_id
    ############################
    def get_users_by_group(self, group_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_users_by_group, group_id)
            for row in result:
                print("Found person: {row}".format(row=row))

            return result

    @staticmethod
    def _get_users_by_group(tx, group_id):
        query = """
            MATCH (u:User)-[:WITH]->(g:Group)
            WHERE g.group_id = $group_id
            RETURN u.name AS name, u.user_id AS user_id
            """
        result = tx.run(query, group_id=group_id).data()
        return result
    
    ############################
    # Get groups by user_id
    ############################
    def get_groups_by_user(self, user_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_groups_by_user, user_id)
            for row in result:
                print("Found person: {row}".format(row=row))

            return result
        
    @staticmethod
    def _get_groups_by_user(tx, user_id):
        query = """
            MATCH (u:User)-[:WITH]->(g:Group)
            WHERE u.user_id = $user_id
            RETURN g.group_name AS group_name, g.group_id AS group_id
            """
        result = tx.run(query, user_id=user_id).data()
        return result
    
    ############################
    # Check if group exists
    ############################
    def group_exists(self, group_name):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._group_exists, group_name)
            if len(result) == 0:
                return False
            return True
        
    @staticmethod
    def _group_exists(tx, group_name):
        query = """
            MATCH (g:Group)
            WHERE g.group_name = $group_name
            RETURN g.group_name AS group_name
            """
        result = tx.run(query, group_name=group_name).data()
        return result
    
    ############################
    # Get group id
    ############################
    def get_group_id(self, group_name):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(self._get_group_id, group_name)
            return result[0]["group_id"]
    
    @staticmethod
    def _get_group_id(tx, group_name):
        query = """
            MATCH (g:Group)
            WHERE g.group_name = $group_name
            RETURN g.group_id AS group_id
            """
        result = tx.run(query, group_name=group_name).data()
        return result


# if __name__ == "__main__":
# Aura queries use an encrypted connection using the "neo4j+s" URI scheme
# app = App()
# app.create_user("Asaf Kedem", "123", "https://www.google.com", 0, "18:07")
# app.close()
