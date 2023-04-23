from . Neo4j_Worker import App

def user_in_group(user_id, group_name):
    neo4j_worker = App()
    groups = neo4j_worker.get_groups_by_user(user_id=user_id)
    neo4j_worker.close()
    for group in groups:
        if group["group_name"] == group_name:
            return True
    return False

def get_group_id(group_name, user_id):
    neo4j_worker = App()
    groups = neo4j_worker.get_groups_by_user(user_id=user_id)
    neo4j_worker.close()
    for group in groups:
        if group["group_name"] == group_name:
            return group["group_id"]
    return None