import time
import json
import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from src.server2.agent_instance import AgentInstance
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
import asyncio
from pathlib import Path
from src.database.mongo_db import MongoDB
from src.database.models import AgentJson, Chat, Post, Activity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server2/app")

mongo_db = MongoDB()


class CreateRequest(BaseModel):
    """Request model for create agent"""

    agent_json: AgentJson


class ChatRequest(BaseModel):
    """Request model for create agent"""

    prompt: str


class ActionRequest(BaseModel):
    """Request model for agent actions"""

    connection: str
    action: str
    params: Optional[List[str]] = []


class ConfigureRequest(BaseModel):
    """Request model for configuring connections"""

    connection: str
    params: Optional[Dict[str, Any]] = {}


class CreatePostRequest(BaseModel):
    """Request model for create post"""

    post: Post


class ServerState:
    """Manages multiple agent instances"""

    def __init__(self):
        # strategy_address -> AgentInstance
        self.agents: Dict[str, AgentInstance] = {}

    async def create_agent(self, agent_json: AgentJson, database: bool = False) -> str:
        """Create a new agent instance and return its ID"""
        try:
            if database:
                await mongo_db.insert_one("agents", agent_json.dict())
            else:
                # Ensure the folder exists
                os.makedirs(Path("agents"), exist_ok=True)

                # File path
                file_path = os.path.join(
                    Path("agents"), f"{agent_json.strategy_address}.json"
                )

                # Write JSON to the file
                with open(file_path, "w") as json_file:
                    json.dump(agent_json, json_file, indent=4)

            return agent_json.strategy_address
        except Exception as e:
            logger.error(f"Agent creation failed: {e}")
            raise ValueError(
                f"Could not load agent: {agent_json.strategy_address}"
            ) from e

    async def load_agent(self, strategy_address, database: bool = False):
        """Load an agent instance and return its ID"""
        try:
            self.agents[strategy_address] = AgentInstance()

            await self.agents[strategy_address].init(
                strategy_address=strategy_address, database=database
            )
            return strategy_address
        except Exception as e:
            logger.error(f"Agent load failed: {e}")
            raise ValueError(f"Could not load agent: {strategy_address}") from e

    def get_agent(self, strategy_address: str) -> Optional[AgentInstance]:
        """Retrieve an agent instance by ID"""
        return self.agents.get(strategy_address)

    async def remove_agent(self, strategy_address: str):
        """Cleanup and remove an agent instance"""
        if agent := self.agents.get(strategy_address=strategy_address):
            await self.stop_agent_loop(strategy_address=strategy_address)
            del self.agents[strategy_address]

    async def start_agent_loop(self, strategy_address: str):
        """Start a specific agent's loop"""
        if agent := self.get_agent(strategy_address=strategy_address):
            agent.start()
        else:
            raise ValueError("Agent not found")

    async def stop_agent_loop(self, strategy_address: str):
        """Stop a specific agent's loop"""
        if agent := self.get_agent(strategy_address=strategy_address):
            agent.stop()


class ZerePyServer:
    def __init__(self):
        self.app = FastAPI(title="ZerePy Server 2")
        origins = [
            "https://edger-ai.netlify.app",
            "http://localhost:5173",
            "http://localhost:5174",
        ]
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        self.state = ServerState()

        # Create agent and return instance ID
        @self.app.post("/agents/create")
        async def create_agent(create_request: CreateRequest, database: bool = False):
            try:
                await self.state.create_agent(
                    agent_json=create_request.agent_json,
                    database=database,
                )
                return create_request.agent_json.strategy_address
            except Exception as e:
                logger.info(f"Agent creation failed: {e}")
                raise HTTPException(400, detail=str(e))

        @self.app.get("/agents", response_model=List[AgentJson])
        async def agents(
            visibility: str,
            database: bool = False,
            creator: str = None,
            page: int = Query(1, alias="page", ge=1),
            limit: int = Query(10, alias="limit", le=100),
        ):
            try:
                if creator and visibility:
                    query = {"creator": creator, "visibility": visibility}
                elif creator:
                    query = {"creator": creator}
                elif visibility:
                    query = {"visibility": visibility}
                else:
                    query = None

                if database:
                    items, total = await mongo_db.find(
                        collection_name="agents", page=page, limit=limit, query=query
                    )
                    return items
                else:
                    return {"message": "Not supported"}
            except Exception as e:
                raise HTTPException(400, detail=str(e))

        @self.app.get("/agents/{strategy_address}", response_model=AgentJson)
        async def agent(strategy_address: str, database: bool = False):
            try:
                if database:
                    item = await mongo_db.find_one(
                        collection_name="agents",
                        query={"strategy_address": strategy_address},
                    )
                    return item
                else:
                    return {"message": "Not supported"}
            except Exception as e:
                raise HTTPException(400, detail=str(e))

        # Load agent and return instance ID
        @self.app.post("/agents/{strategy_address}/load")
        async def load_agent(
            strategy_address: str,
            database: bool = False,
        ):
            try:
                await self.state.load_agent(
                    strategy_address=strategy_address, database=database
                )

                await mongo_db.update_one(
                    collection_name="agents",
                    query={"strategy_address": strategy_address},
                    data={"state": "deployed"},
                )

                return strategy_address
            except Exception as e:
                raise HTTPException(400, detail=str(e))

        # Agent control endpoints
        @self.app.post("/agents/{strategy_address}/start")
        async def start_agent(strategy_address: str):
            try:
                await self.state.start_agent_loop(strategy_address=strategy_address)

                await mongo_db.update_one(
                    collection_name="agents",
                    query={"strategy_address": strategy_address},
                    data={"state": "running"},
                )

                return strategy_address
            except ValueError as e:
                raise HTTPException(404, detail=str(e))

        @self.app.post("/agents/{strategy_address}/stop")
        async def stop_agent(strategy_address: str):
            try:
                await self.state.stop_agent_loop(strategy_address=strategy_address)

                await mongo_db.update_one(
                    collection_name="agents",
                    query={"strategy_address": strategy_address},
                    data={"state": "stopped"},
                )

                return strategy_address
            except ValueError as e:
                raise HTTPException(404, detail=str(e))

        # Agent-specific action execution
        @self.app.post("/agents/{strategy_address}/action")
        async def agent_action(strategy_address: str, action_request: ActionRequest):
            if agent := self.state.get_agent(strategy_address=strategy_address):
                try:
                    await asyncio.to_thread(
                        agent.cli.agent.perform_action,
                        connection=action_request.connection,
                        action=action_request.action,
                        params=action_request.params,
                    )
                    return strategy_address
                except Exception as e:
                    raise HTTPException(400, detail=str(e))
            raise HTTPException(404, detail="Agent not found")

        # Chat execution
        @self.app.post("/agents/{strategy_address}/chat")
        async def chat(strategy_address: str, chat_request: ChatRequest, user: str):
            if agent := self.state.get_agent(strategy_address):
                try:
                    message = {
                        "sender": user,
                        "text": chat_request.prompt,
                        "timestamp": int(time.time() * 1000),
                        "receiver": strategy_address,
                    }

                    await mongo_db.insert_one("chats", message)

                    result = await asyncio.to_thread(
                        agent.cli.agent.prompt_llm, chat_request.prompt
                    )

                    reply = {
                        "sender": strategy_address,
                        "text": result,
                        "timestamp": int(time.time() * 1000),
                        "receiver": user,
                    }

                    await mongo_db.insert_one("chats", reply)

                    return strategy_address
                except Exception as e:
                    raise HTTPException(400, detail=str(e))
            raise HTTPException(404, detail="Agent not found")

        # Get chats
        @self.app.get("/agents/{strategy_address}/chats", response_model=List[Chat])
        async def chats(
            strategy_address: str,
            user: str,
            page: int = Query(1, alias="page", ge=1),
            limit: int = Query(10, alias="limit", le=100),
            database: bool = False,
        ):
            try:
                query = {
                    "$or": [
                        {"sender": user, "receiver": strategy_address},
                        {"sender": strategy_address, "receiver": user},
                    ]
                }
                if database:
                    items, total = await mongo_db.find(
                        collection_name="chats", page=page, limit=limit, query=query
                    )
                    return items
                else:
                    return {"message": "Not supported"}
            except Exception as e:
                raise HTTPException(400, detail=str(e))

        # Agent connection management
        @self.app.post("/agents/{strategy_address}/connections/{conn_name}/configure")
        async def configure_connection(
            strategy_address: str, conn_name: str, config: ConfigureRequest
        ):
            if agent := self.state.get_agent(strategy_address=strategy_address):
                conn = agent.cli.agent.connection_manager.connections.get(conn_name)
                if not conn:
                    raise HTTPException(404, detail="Connection not found")
                if conn.configure(**config.params):
                    return {"status": "Connection configured"}
                raise HTTPException(400, detail="Configuration failed")
            raise HTTPException(404, detail="Agent not found")

        # Create a post
        @self.app.post("/posts/create")
        async def create_post(create_request: CreatePostRequest):
            try:
                await mongo_db.insert_one(
                    collection_name="posts",
                    data=create_request.post.dict(),
                )

                return "ok"
            except Exception as e:
                raise HTTPException(400, detail=str(e))

        # Get post
        @self.app.get("/posts", response_model=List[Post])
        async def posts(
            page: int = Query(1, alias="page", ge=1),
            limit: int = Query(10, alias="limit", le=100),
        ):
            try:
                items, total = await mongo_db.find(
                    collection_name="posts", page=page, limit=limit
                )
                return items
            except Exception as e:
                raise HTTPException(400, detail=str(e))

        # Get activities
        @self.app.get("/activities", response_model=List[Activity])
        async def posts(
            initiator: str,
            page: int = Query(1, alias="page", ge=1),
            limit: int = Query(10, alias="limit", le=100),
        ):
            try:
                items, total = await mongo_db.find(
                    collection_name="activities",
                    page=page,
                    limit=limit,
                    query={"initiator": initiator, "tx_hash": {"$not": {"$eq": None}}},
                    sort_field="timestamp",
                    sort_order=-1,
                )
                return items
            except Exception as e:
                raise HTTPException(400, detail=str(e))


def create_app():
    server = ZerePyServer()
    return server.app
