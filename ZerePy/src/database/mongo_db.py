import os
import logging
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mongo_db")


class MongoDB:
    def __init__(self):
        load_dotenv()
        client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
        sync_client = MongoClient(os.getenv("MONGO_URL"))

        self.db = client.get_database("test")
        self.sync_db = sync_client.get_database("test")

    async def insert_one(self, collection_name: str, data: dict):
        collection = self.db[collection_name]
        await collection.insert_one(data)

    def insert_one_sync(self, collection_name: str, data: dict):
        collection = self.sync_db[collection_name]
        collection.insert_one(data)

    async def update_one(self, collection_name: str, query: dict, data: dict):
        collection = self.db[collection_name]
        result = await collection.update_one(query, {"$set": data})
        return result.modified_count

    async def find_one(self, collection_name, query: dict):
        collection = self.db[collection_name]
        result = await collection.find_one(query)
        return result

    async def find(
        self,
        collection_name,
        page: int,
        limit: int,
        query: dict = None,
        sort_field: str = None,
        sort_order: int = 1,
    ):
        collection = self.db[collection_name]
        skip = (page - 1) * limit
        cursor = collection.find(query).skip(skip).limit(limit)

        if sort_field:
            cursor = cursor.sort(sort_field, sort_order)

        items = await cursor.to_list(length=limit)
        total = await collection.count_documents({})
        return items, total
