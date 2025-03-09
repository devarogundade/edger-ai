import json
import random
import time
import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from src.connection_manager import ConnectionManager
from src.helpers import print_h_bar
from src.action_handler import execute_action
import src.actions.twitter_actions
import src.actions.sonic_actions
import src.actions.strategy_actions
from datetime import datetime
from src.database.mongo_db import MongoDB
from src.constants.strategy import BASE_STRATEGY_BIO, BASE_STRATEGY_PROMPT

REQUIRED_FIELDS = [
    "name",
    "bio",
    "traits",
    "examples",
    "loop_delay",
    "config",
    "tasks",
    "tokens",
    "minimum_deposit",
    "visibility",
    "strategy_address",
    "strategies",
]

logger = logging.getLogger("agent")
mongo_db = MongoDB()


class ZerePyAgent:
    def initFromFile(self, agent_name: str):
        agent_path = Path("agents") / f"{agent_name}.json"
        agent_dict = json.load(open(agent_path, "r"))

        self.init(agent_dict=agent_dict)

    async def initFromDatabase(self, strategy_address: str):
        agent_dict = await mongo_db.find_one(
            collection_name="agents",
            query={"strategy_address": strategy_address},
        )

        self.init(agent_dict=agent_dict)

    def init(self, agent_dict: dict):
        try:
            missing_fields = [
                field for field in REQUIRED_FIELDS if field not in agent_dict
            ]

            if missing_fields:
                raise KeyError(f"Missing required fields: {', '.join(missing_fields)}")

            self.name = agent_dict["name"]
            self.bio = agent_dict["bio"]
            self.traits = agent_dict["traits"]
            self.examples = agent_dict["examples"]
            self.example_accounts = agent_dict["example_accounts"]
            self.example_channels = agent_dict["example_channels"]
            self.minimum_deposit = agent_dict["minimum_deposit"]
            self.fork_cost = agent_dict.get("fork_cost", 0)
            self.visibility = agent_dict["visibility"]
            self.loop_delay = agent_dict["loop_delay"]
            self.connection_manager = ConnectionManager(agent_dict["config"])
            self.use_time_based_weights = agent_dict["use_time_based_weights"]
            self.time_based_multipliers = agent_dict["time_based_multipliers"]

            has_twitter_tasks = any(
                "tweet" in task["name"] for task in agent_dict.get("tasks", [])
            )

            twitter_config = next(
                (
                    config
                    for config in agent_dict["config"]
                    if config["name"] == "twitter"
                ),
                None,
            )

            if has_twitter_tasks and twitter_config:
                self.tweet_interval = twitter_config.get("tweet_interval", 900)
                self.own_tweet_replies_count = twitter_config.get(
                    "own_tweet_replies_count", 2
                )

            # Extract Echochambers config
            echochambers_config = next(
                (
                    config
                    for config in agent_dict["config"]
                    if config["name"] == "echochambers"
                ),
                None,
            )
            if echochambers_config:
                self.echochambers_message_interval = echochambers_config.get(
                    "message_interval", 60
                )
                self.echochambers_history_count = echochambers_config.get(
                    "history_read_count", 50
                )

            self.is_llm_set = False

            # Cache for system prompt
            self._system_prompt = None

            # Extract loop tasks
            self.tasks = agent_dict.get("tasks", [])
            self.task_weights = [task.get("weight", 0) for task in self.tasks]
            self.logger = logging.getLogger("agent")

            # Extract agent tokens info
            self.tokens = agent_dict.get("tokens", [])

            # Extract agent strategy actions info
            self.strategy_address = agent_dict["strategy_address"]
            self.strategies = agent_dict.get("strategies", {})

            # Set up empty agent state
            self.state = {}

        except Exception as e:
            logger.error("Could not load ZerePy agent")
            raise e

    def _setup_llm_provider(self):
        # Get first available LLM provider and its model
        llm_providers = self.connection_manager.get_model_providers()
        if not llm_providers:
            raise ValueError("No configured LLM provider found")
        self.model_provider = llm_providers[0]

    def _construct_system_prompt(self) -> str:
        """Construct the system prompt from agent configuration"""
        if self._system_prompt is None:
            prompt_parts = []
            prompt_parts.extend(self.bio)

            if self.traits:
                prompt_parts.append("\nYour key traits are:")
                prompt_parts.extend(f"- {trait}" for trait in self.traits)

            prompt_parts.append(f"Your visibility status is {self.visibility}")
            prompt_parts.append(f"Your fork cost is {self.fork_cost} SONIC")
            prompt_parts.append(f"Your minimum deposit is {self.minimum_deposit} USD")
            prompt_parts.append(
                f"Your strategy contract address is {self.strategy_address} on sonic"
            )

            if self.tokens:
                prompt_parts.append("\nYour supported tokens are strictly:")
                prompt_parts.extend(f"- {token}" for token in self.tokens)

            if self.strategies:
                prompt_parts.append(f"\nYour strategies are: {self.strategies}")

            prompt_parts.append(" ".join(BASE_STRATEGY_BIO))
            self._system_prompt = "\n".join(prompt_parts)

        return self._system_prompt

    def _adjust_weights_for_time(self, current_hour: int, task_weights: list) -> list:
        weights = task_weights.copy()

        # Reduce tweet frequency during night hours (1 AM - 5 AM)
        if 1 <= current_hour <= 5:
            weights = [
                (
                    weight
                    * self.time_based_multipliers.get("tweet_night_multiplier", 0.4)
                    if task["name"] == "post-tweet"
                    else weight
                )
                for weight, task in zip(weights, self.tasks)
            ]

        # Increase engagement frequency during day hours (8 AM - 8 PM) (peak hours?🤔)
        if 8 <= current_hour <= 20:
            weights = [
                (
                    weight
                    * self.time_based_multipliers.get("engagement_day_multiplier", 1.5)
                    if task["name"] in ("reply-to-tweet", "like-tweet")
                    else weight
                )
                for weight, task in zip(weights, self.tasks)
            ]

        return weights

    def prompt_llm(self, prompt: str, system_prompt: str = None) -> str:
        """Generate text using the configured LLM provider"""
        system_prompt = system_prompt or self._construct_system_prompt()
        system_prompt = f"{system_prompt} {' '.join(BASE_STRATEGY_PROMPT)}"

        return self.connection_manager.perform_action(
            connection_name=self.model_provider,
            action_name="generate-text",
            params=[prompt, system_prompt],
        )

    def prompt_llm_strategy(self, prompt: str, system_prompt: str = None) -> str:
        """Generate text using the configured LLM provider"""
        system_prompt = system_prompt or self._construct_system_prompt()
        strategies = self.strategies

        return self.connection_manager.perform_action(
            connection_name=self.model_provider,
            action_name="generate-strategy-action",
            params=[
                prompt,
                strategies,
                system_prompt,
            ],
        )

    def perform_strategy(self, prompt: str, system_prompt: str = None):
        tool_calls = self.prompt_llm_strategy(prompt, system_prompt)
        tool_call = tool_calls[0]

        function = tool_call.function

        function_name = function.name
        function_args = function.arguments

        return function_name, function_args

    def perform_action(self, connection: str, action: str, **kwargs) -> None:
        return self.connection_manager.perform_action(connection, action, **kwargs)

    def select_action(self, use_time_based_weights: bool = False) -> dict:
        task_weights = [weight for weight in self.task_weights.copy()]

        if use_time_based_weights:
            current_hour = datetime.now().hour
            task_weights = self._adjust_weights_for_time(current_hour, task_weights)

        return random.choices(self.tasks, weights=task_weights, k=1)[0]

    def loop(self):
        """Main agent loop for autonomous behavior"""
        if not self.is_llm_set:
            self._setup_llm_provider()

        logger.info("\n🚀 Starting agent loop...")
        logger.info("Press Ctrl+C at any time to stop the loop.")
        print_h_bar()

        time.sleep(2)
        logger.info("Starting loop in 5 seconds...")

        for i in range(5, 0, -1):
            logger.info(f"{i}...")
            time.sleep(1)

        try:
            while True:
                try:
                    # TWITTER INPUTS
                    if (
                        "timeline_tweets" not in self.state
                        or self.state["timeline_tweets"] is None
                        or len(self.state["timeline_tweets"]) == 0
                    ):
                        if any("timeline" in task["name"] for task in self.tasks):
                            logger.info("\n👀 READING TIMELINE")
                            self.state["timeline_tweets"] = (
                                self.connection_manager.perform_action(
                                    connection_name="twitter",
                                    action_name="read-timeline",
                                    params=[],
                                )
                            )

                    # DISCORD INPUTS
                    if (
                        "discord_messages" not in self.state
                        or self.state["discord_messages"] is None
                        or len(self.state["discord_messages"]) == 0
                    ):
                        if any("messages" in task["name"] for task in self.tasks):
                            logger.info("\n👀 READING DISCORD MESSAGES")
                            for example_channel in self.example_channels:
                                self.state["discord_messages"] = (
                                    self.connection_manager.perform_action(
                                        connection_name="discord",
                                        action_name="read-messages",
                                        params=[example_channel],
                                    )
                                )

                    # CHOOSE A STRATEGY

                    action, arguments = self.perform_strategy(
                        prompt=f"Events: {json.dumps(self.state)}"
                    )

                    logger.info(f"Chosen action: {action}")

                    # EXECUTE THE STRATEGY

                    tx_hash = execute_action(
                        agent=self, action_name=action, arguments=arguments
                    )

                    # SAVE ACTION ACTIVITY

                    mongo_db.insert_one_sync(
                        collection_name="activities",
                        data={
                            "initiator": self.strategy_address,
                            "action": action,
                            "timestamp": int(time.time() * 1000),
                            "tx_hash": tx_hash,
                        },
                    )

                    logger.info(
                        f"\n⏳ Waiting {self.loop_delay} seconds before next loop..."
                    )

                    self.state = {}

                    print_h_bar()
                    time.sleep(self.loop_delay)
                except Exception as e:
                    logger.error(f"\n❌ Error in agent loop iteration: {e}")
                    logger.info(
                        f"⏳ Waiting {self.loop_delay} seconds before retrying..."
                    )
                    time.sleep(self.loop_delay)

        except KeyboardInterrupt:
            logger.info("\n🛑 Agent loop stopped by user.")
            return
