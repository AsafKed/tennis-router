import pandas as pd
from ..Neo4j_Player_Worker import Player_Worker

class MatchEditor:
    def __init__(self, match_data):
        self.match_data = pd.read_excel(match_data, sheet_name='Matches', na_filter=False)

    def upload_matches_to_db(self):
        # Convert to list of dictionaries
        matches = self.match_data.to_dict('records')
        
        # Upload to Neo4j
        worker = Player_Worker()
        for match in matches:
            match_name = match['player1'] + ' vs ' + match['player2']
            # Format time to be HH:MM (24 hour)
            match['time'] = match['time'].strftime('%H:%M')
            worker.create_match_simple(match_date=match['date'], match_time=match['time'],  match_location=match['location'], match_name=match_name)
            worker.create_player_match_relationship_simple(player_name=match['player1'], match_name=match_name)
            worker.create_player_match_relationship_simple(player_name=match['player2'], match_name=match_name)

        worker.close()