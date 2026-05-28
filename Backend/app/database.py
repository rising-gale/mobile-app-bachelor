from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

# Read MongoDB URI from environment for security and flexibility
# Example: mongodb+srv://user:password@cluster0.../dbname?retryWrites=true&w=majority
MONGO_URI = os.environ.get('MONGO_URI')

if not MONGO_URI:
    raise RuntimeError('MONGO_URI environment variable is not set. Set it to your MongoDB connection string.')

# Create a new client and connect to the server
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection (will raise on failure)
try:
    client.admin.command('ping')
    print('Pinged MongoDB deployment successfully.')
except Exception as e:
    # Fail fast so the container/instance can restart or report the error
    print('Failed to connect to MongoDB:', e)
    raise

database = client.get_database('numberplates_db')
