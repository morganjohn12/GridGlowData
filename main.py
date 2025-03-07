from flask import Flask, render_template, send_from_directory, make_response
import os

app = Flask(__name__)

@app.route('/')
def index():
    response = make_response(render_template('index.html'))
    # Add CSP headers to allow iframe content from domo.domo.com
    response.headers['Content-Security-Policy'] = "default-src 'self'; frame-src 'self' https://*.domo.com; frame-ancestors 'self' https://*.domo.com;"
    # Remove X-Frame-Options as it's superseded by CSP frame-ancestors
    return response

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)