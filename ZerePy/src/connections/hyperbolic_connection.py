import logging
import os
from typing import Dict, Any
from dotenv import load_dotenv, set_key
from openai import OpenAI
from src.connections.base_connection import BaseConnection, Action, ActionParameter

logger = logging.getLogger("connections.hyperbolic_connection")


class HyperbolicConnectionError(Exception):
    """Base exception for Hyperbolic connection errors"""

    pass


class HyperbolicConfigurationError(HyperbolicConnectionError):
    """Raised when there are configuration/credential issues"""

    pass


class HyperbolicAPIError(HyperbolicConnectionError):
    """Raised when Hyperbolic API requests fail"""

    pass


class HyperbolicConnection(BaseConnection):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self._client = None
        self.api_key = config["api_key"]

    @property
    def is_llm_provider(self) -> bool:
        return True

    def validate_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Hyperbolic configuration from JSON"""
        required_fields = ["model"]
        missing_fields = [field for field in required_fields if field not in config]

        if missing_fields:
            raise ValueError(
                f"Missing required configuration fields: {', '.join(missing_fields)}"
            )

        # Validate model exists (will be checked in detail during configure)
        if not isinstance(config["model"], str):
            raise ValueError("model must be a string")

        return config

    def register_actions(self) -> None:
        """Register available Hyperbolic actions"""
        self.actions = {
            "generate-text": Action(
                name="generate-text",
                parameters=[
                    ActionParameter(
                        "prompt", True, str, "The input prompt for text generation"
                    ),
                    ActionParameter(
                        "system_prompt", True, str, "System prompt to guide the model"
                    ),
                    ActionParameter("model", False, str, "Model to use for generation"),
                    ActionParameter(
                        "temperature",
                        False,
                        float,
                        "A decimal number that determines the degree of randomness in the response.",
                    ),
                ],
                description="Generate text using Hyperbolic models",
            ),
            "generate-strategy-action": Action(
                name="generate-strategy-action",
                parameters=[
                    ActionParameter(
                        "prompt", True, str, "The input prompt for text generation"
                    ),
                    ActionParameter(
                        "strategies",
                        True,
                        dict,
                        "A dictionary of strategy action description",
                    ),
                    ActionParameter(
                        "system_prompt", True, str, "System prompt to guide the model"
                    ),
                    ActionParameter("model", False, str, "Model to use for generation"),
                ],
                description="Generate text using OpenAI models",
            ),
            "check-model": Action(
                name="check-model",
                parameters=[
                    ActionParameter(
                        "model", True, str, "Model name to check availability"
                    )
                ],
                description="Check if a specific model is available",
            ),
            "list-models": Action(
                name="list-models",
                parameters=[],
                description="List all available Hyperbolic models",
            ),
        }

    def _get_client(self) -> OpenAI:
        """Get or create Hyperbolic client"""
        if not self._client:
            api_key = self.api_key or os.getenv("HYPERBOLIC_API_KEY")
            if not api_key:
                raise HyperbolicConfigurationError(
                    "Hyperbolic API key not found in environment"
                )
            self._client = OpenAI(
                api_key=api_key, base_url="https://api.hyperbolic.xyz/v1"
            )
        return self._client

    def configure(self) -> bool:
        """Sets up Hyperbolic API authentication"""
        logger.info("\n🤖 HYPERBOLIC API SETUP")

        if self.is_configured():
            logger.info("\nHyperbolic API is already configured.")
            response = input("Do you want to reconfigure? (y/n): ")
            if response.lower() != "y":
                return True

        logger.info("\n📝 To get your Hyperbolic API credentials:")
        logger.info("1. Go to https://app.hyperbolic.xyz")
        logger.info("2. Log in with your method of choice")
        logger.info("3. Verify your email address")
        logger.info("4. Generate an API key")

        api_key = input("\nEnter your Hyperbolic API key: ")

        try:
            if not os.path.exists(".env"):
                with open(".env", "w") as f:
                    f.write("")

            set_key(".env", "HYPERBOLIC_API_KEY", api_key)

            # Validate the API key by trying to list models
            client = OpenAI(api_key=api_key, base_url="https://api.hyperbolic.xyz/v1")
            client.models.list()

            logger.info("\n✅ Hyperbolic API configuration successfully saved!")
            logger.info("Your API key has been stored in the .env file.")
            return True

        except Exception as e:
            logger.error(f"Configuration failed: {e}")
            return False

    def is_configured(self, verbose=False) -> bool:
        """Check if Hyperbolic API key is configured and valid"""
        try:
            load_dotenv()
            api_key = self.api_key or os.getenv("HYPERBOLIC_API_KEY")
            if not api_key:
                return False

            client = OpenAI(api_key=api_key, base_url="https://api.hyperbolic.xyz/v1")
            client.models.list()
            return True

        except Exception as e:
            if verbose:
                logger.debug(f"Configuration check failed: {e}")
            return False

    def generate_text(
        self, prompt: str, system_prompt: str, model: str = None, **kwargs
    ) -> str:
        """Generate text using Hyperbolic models"""
        try:
            client = self._get_client()

            # Use configured model if none provided
            if not model:
                model = self.config["model"]

            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
            )

            return completion.choices[0].message.content

        except Exception as e:
            raise HyperbolicAPIError(f"Text generation failed: {e}")

    def generate_strategy_action(
        self,
        prompt: str,
        strategies: dict,
        system_prompt: str,
        model: str = None,
        **kwargs,
    ) -> str:
        """Generate strategy action using Hyperbolic models"""
        try:
            client = self._get_client()

            # Use configured model if none provided
            if not model:
                model = self.config["model"]

            tools = [
                {
                    "type": "function",
                    "function": {
                        "name": "swap-to-single",
                        "description": " ".join(strategies["swap_to_single"]),
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "tokens_in": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "The token addresses to sell. Item must be a supported token.",
                                },
                                "token_out": {
                                    "type": "string",
                                    "description": "The token address to buy. Must be a supported token.",
                                },
                            },
                            "required": ["tokens_in", "token_out"],
                            "additionalProperties": False,
                        },
                        "strict": True,
                    },
                },
                {
                    "type": "function",
                    "function": {
                        "name": "swap-to-many",
                        "description": " ".join(strategies["swap_to_many"]),
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "token_in": {
                                    "type": "string",
                                    "description": "The token address to sell. Must be a supported token.",
                                },
                                "tokens_out": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "The token addresses to buy. Item must be a supported token.",
                                },
                            },
                            "required": ["token_in", "tokens_out"],
                            "additionalProperties": False,
                        },
                        "strict": True,
                    },
                },
                {
                    "type": "function",
                    "function": {
                        "name": "adjust-split-ratio",
                        "description": " ".join(strategies["adjust_split_ratio"]),
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "ratio": {
                                    "type": "array",
                                    "items": {"type": "number"},
                                    "description": "Sum must always be 10000.",
                                }
                            },
                            "required": ["ratio"],
                            "additionalProperties": False,
                        },
                        "strict": True,
                    },
                },
                {
                    "type": "function",
                    "function": {
                        "name": "none",
                        "description": " ".join(strategies["none"]),
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "message": {
                                    "type": "string",
                                    "description": "The reason why you used this function",
                                }
                            },
                            "required": ["message"],
                            "additionalProperties": False,
                        },
                        "strict": True,
                    },
                },
            ]

            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                tools=tools,
            )

            return completion.choices[0].message.tool_calls

        except Exception as e:
            raise HyperbolicAPIError(f"Text generation failed: {e}")

    def check_model(self, model: str, **kwargs) -> bool:
        """Check if a specific model is available"""
        try:
            client = self._get_client()
            try:
                models = client.models.list()
                for hyperbolic_model in models.data:
                    if hyperbolic_model.id == model:
                        return True
                return False
            except Exception as e:
                raise HyperbolicAPIError(f"Model check failed: {e}")

        except Exception as e:
            raise HyperbolicAPIError(f"Model check failed: {e}")

    def list_models(self, **kwargs) -> None:
        """List all available Hyperbolic models"""
        try:
            client = self._get_client()
            response = client.models.list().data

            model_ids = [model.id for model in response]

            logger.info("\nAVAILABLE MODELS:")
            for i, model_id in enumerate(model_ids, start=1):
                logger.info(f"{i}. {model_id}")

        except Exception as e:
            raise HyperbolicAPIError(f"Listing models failed: {e}")

    def perform_action(self, action_name: str, kwargs) -> Any:
        """Execute a Hyperbolic action with validation"""
        if action_name not in self.actions:
            raise KeyError(f"Unknown action: {action_name}")

        # Explicitly reload environment variables
        load_dotenv()

        if not self.is_configured(verbose=True):
            raise HyperbolicConfigurationError("Hyperbolic is not properly configured")

        action = self.actions[action_name]
        errors = action.validate_params(kwargs)
        if errors:
            raise ValueError(f"Invalid parameters: {', '.join(errors)}")

        # Call the appropriate method based on action name
        method_name = action_name.replace("-", "_")
        method = getattr(self, method_name)
        return method(**kwargs)
