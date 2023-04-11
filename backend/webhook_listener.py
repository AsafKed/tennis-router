# This file is part of the deployment strategy for, using Github Actions.
# It is a simple Flask app that listens for Github webhook events and
# triggers a deployment (updates the code in the server) when a push to the main branch is detected.

from flask import Flask, request
import subprocess
import os

app = Flask(__name__)

@app.route('/deploy', methods=['POST'])
def deploy():
    # You can add authentication or validation here if needed
    subprocess.Popen(['/opt/deploy-tennis.sh'])
    return 'OK', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
