import os
import logging
from typing import Optional

from pymongo import MongoClient
from pymongo.server_api import ServerApi

_logger = logging.getLogger(__name__)

# Lazy-initialized Mongo client and database reference. This avoids making
# network calls (and raising) during module import which can be problematic
# for tests and tooling. Call `get_database()` when you need a DB reference.
_client: Optional[MongoClient] = None
_database = None


def _init_client():
    global _client, _database
    if _client is not None and _database is not None:
        return

    mongo_uri = os.environ.get("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError("MONGO_URI environment variable is not set. Set it to your MongoDB connection string.")

    server_api_version = os.environ.get("MONGO_SERVER_API", "1")
    try:
        _client = MongoClient(mongo_uri, server_api=ServerApi(server_api_version))
        # quick ping to validate connection
        _client.admin.command("ping")
        _logger.info("Connected to MongoDB")
        db_name = os.environ.get("MONGO_DB_NAME", "numberplates_db")
        _database = _client.get_database(db_name)
    except Exception:
        _logger.exception("Failed to initialize MongoDB client")
        raise


def get_database():
    """Return a connected database instance. Initializes the client lazily."""
    global _database
    if _database is None:
        _init_client()
    return _database


def get_client():
    """Return the underlying MongoClient instance."""
    global _client
    if _client is None:
        _init_client()
    return _client
