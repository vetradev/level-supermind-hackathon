from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import requests

# Proxy Server Handler
class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        # Read POST data
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        # Make API Request to Langflow
        response = requests.post(
            "https://api.langflow.astra.datastax.com/lf/b7acdf39-0fb3-4e71-852b-8088b917f998/api/v1/run/4fe89de7-a27f-41fd-83fd-ee3104a90c09?stream=false",
            headers={
                'Authorization': 'Bearer AstraCS:uzXqruZtMSLfCjlXPnDaGFqj:9f7623b13ea55edcbbfbfda9286733d83b3dfc7f717022a68f3c967fa95c5d28',
                'Content-Type': 'application/json'
            },
            data=post_data
        )

        # Send response back to the frontend
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(response.content)

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

# Start Proxy Server
server = HTTPServer(('localhost', 8000), ProxyHandler)
print("Server running on port 8000")
server.serve_forever()
