from typing import List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

class AtlasSearchService:
    @staticmethod
    async def search_drugs_atlas(db: AsyncIOMotorDatabase, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Enhanced drug search using MongoDB Atlas Search (Lucene-backed)
        """
        pipeline = [
            {
                "$search": {
                    "index": "drugs_search",
                    "compound": {
                        "should": [
                            { 
                                "text": { 
                                    "query": query, 
                                    "path": "name", 
                                    "score": {"boost": {"value": 3}} 
                                }
                            },
                            { 
                                "text": { 
                                    "query": query, 
                                    "path": "generic_name", 
                                    "score": {"boost": {"value": 2}} 
                                }
                            },
                            { 
                                "text": { 
                                    "query": query, 
                                    "path": "brand_names" 
                                }
                            },
                            { 
                                "autocomplete": { 
                                    "query": query, 
                                    "path": "name" 
                                }
                            }
                        ]
                    }
                }
            },
            { "$limit": limit },
            { 
                "$project": { 
                    "score": { "$meta": "searchScore" },
                    "_id": 1,
                    "name": 1,
                    "generic_name": 1,
                    "brand_names": 1,
                    "drug_class": 1,
                    "is_active": 1,
                    "mechanism_of_action": 1
                } 
            }
        ]

        cursor = db.drugs.aggregate(pipeline)
        
        results = []
        async for doc in cursor:
            # Map _id to id for client
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            results.append(doc)
            
        return results
