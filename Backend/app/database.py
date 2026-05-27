from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
uri = "REDACTED_MONGODB_URI"
# def get_db():
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
database = client['numberplates_db']
    # try:
    #     yield database
    # finally:
    #     client.close()
    # return database