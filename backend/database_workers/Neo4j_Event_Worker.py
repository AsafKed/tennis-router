from neo4j import GraphDatabase

# Import error raises
from .Neo4j_Errors import Uniqueness_Check

# This enables os.getenv() to read the .env file
import os
from dotenv import load_dotenv
load_dotenv()

class Event_Worker:
    def __init__(self):
        uri = os.getenv("NEO4J_URI")
        user = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")

        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        # Don't forget to close the driver connection when you are finished with it
        self.driver.close()


    #############################
    # Create Event
    #############################
    def create_event(self, event):
        # Separate event into node properties and relationship properties
        node_props = {k: event[k] for k in ['page', 'action']}
        rel_props = {k: event[k] for k in event if k not in ['page', 'action', 'user_id', 'guest_id']}

        # In case of a guest
        if 'user_id' in event.keys():
            with self.driver.session(database="neo4j") as session:
                result = session.execute_write(
                    self._create_event, node_props=node_props, rel_props=rel_props, user_id=event['user_id']
                )

                return result
            
        elif 'guest_id' in event.keys():
            with self.driver.session(database="neo4j") as session:
                result = session.execute_write(
                    self._create_event, node_props=node_props, rel_props=rel_props, guest_id=event['guest_id']
                )

                return result


    @staticmethod
    def _create_event(tx, node_props, rel_props, user_id=None, guest_id=None):
        query = """
            MERGE (e:Event {page: $node_props.page, action: $node_props.action})
            """ + ("MERGE (u:User {user_id: $user_id})" if user_id is not None else "MERGE (u:Guest {guest_id: $guest_id})") + """
            CREATE (u)-[:PERFORMED $rel_props]->(e)
            RETURN e
        """
        result = tx.run(query, node_props=node_props, rel_props=rel_props, user_id=user_id, guest_id=guest_id)

        return result.single()

    #############################
    # Find all events for a user_id, sorted on PERFORMED.timestamp
    #############################
    def get_user_events(self, user_id):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_read(
                self._get_user_events, user_id=user_id
            )

            return result
        
    @staticmethod
    def _get_user_events(tx, user_id):
        query = """
            MATCH (u:User {user_id: $user_id})-[r:PERFORMED]->(e:Event)
            RETURN r.timestamp AS timestamp, e {.*}, u.user_id as user
            ORDER BY r.timestamp
        """
        result = tx.run(query, user_id=user_id)

        events = [dict(record)['e'] | {'timestamp': dict(record)['timestamp'], 'user': dict(record)['user']} for record in result]
        return events