from . Neo4j_User_Worker import User_Worker
import math

def user_in_group(user_id, group_name):
    neo4j_worker = User_Worker()
    groups = neo4j_worker.get_groups_by_user(user_id=user_id)
    neo4j_worker.close()
    for group in groups:
        if group["group_name"] == group_name:
            return True
    return False

def get_group_id(group_name, user_id):
    neo4j_worker = User_Worker()
    groups = neo4j_worker.get_groups_by_user(user_id=user_id)
    neo4j_worker.close()
    for group in groups:
        if group["group_name"] == group_name:
            return group["group_id"]
    return None

def normalize_players(result):
    for player in result:
                if math.isnan(player["rank"]):
                    player["rank"] = 10000 # Set to 10000 so that unranked players are at the end of the list
                # If the rank is a float, convert it to an int
                elif isinstance(player["rank"], float):
                    player["rank"] = int(player["rank"])
    return result