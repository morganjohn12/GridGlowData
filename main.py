from flask import Flask, render_template, send_from_directory, make_response
import os

app = Flask(__name__)

@app.route('/')
def index():
    response = make_response(render_template('index.html'))
    # Update CSP headers to only allow necessary scripts and frames
    response.headers['Content-Security-Policy'] = "default-src 'self'; frame-src 'self' https://*.domo.com; frame-ancestors 'self' https://*.domo.com; script-src 'self' https://cdnjs.cloudflare.com https://unpkg.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    return response

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)