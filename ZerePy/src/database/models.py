from pydantic import BaseModel
from typing import Optional, List, Dict


class ConfigItem(BaseModel):
    name: str
    message_read_count: Optional[int] = None
    message_emoji_name: Optional[str] = None
    server_id: Optional[str] = None
    model: Optional[str] = None
    network: Optional[str] = None
    api_key: Optional[str] = None
    is_llm: Optional[bool] = None


class TaskItem(BaseModel):
    name: str
    weight: int


class Strategy(BaseModel):
    swap_to_single: List[str]
    swap_to_many: List[str]
    adjust_split_ratio: List[str]
    none: List[str]


class AgentJson(BaseModel):
    name: str
    state: str
    bio: List[str]
    traits: List[str]
    examples: List[str]
    example_accounts: List[str]
    example_channels: List[int]
    loop_delay: int
    config: List[ConfigItem]
    tasks: List[TaskItem]
    use_time_based_weights: bool
    time_based_multipliers: Dict[str, float]
    tokens: List[str]
    minimum_deposit: int
    visibility: str
    fork_cost: int
    strategy_address: str
    creator: str
    base_strategy_address: Optional[str] = None
    strategies: Strategy


class Post(BaseModel):
    text: str
    timestamp: int
    image: Optional[str]
    creator: str


class Activity(BaseModel):
    initiator: str
    action: str
    timestamp: int
    tx_hash: Optional[str] = None


class Chat(BaseModel):
    sender: str
    text: Optional[str]
    timestamp: int
    receiver: Optional[str]
