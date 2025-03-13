from flask import Flask, jsonify
import os

app = Flask(__name__)
PORT = int(os.environ.get("PYTHON_SERVICE_PORT", 6000))

@app.route('/api')
def hello():
    return jsonify(message="Hello from python-service")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT) 