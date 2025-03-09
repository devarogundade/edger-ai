import json
import logging
from web3 import Web3
from src.action_handler import register_action

logger = logging.getLogger("actions.strategy_actions")

adjust_split_ratio_enum = 0
swap_to_single_enum = 1
swap_to_many_enum = 2

w3 = Web3()


@register_action("adjust-split-ratio")
def adjust_split_ratio(agent, **kwargs):
    arguments = json.loads(kwargs.get("arguments"))

    ratio = arguments.get("ratio")

    types = ["uint256[]"]

    encoded_data = w3.codec.encode(types, [ratio])
    data = Web3.to_hex(encoded_data)

    tx_hash = agent.connection_manager.perform_action(
        connection_name="sonic",
        action_name="strategy",
        params=[agent.strategy_address, adjust_split_ratio_enum, data],
    )

    logger.info(f"Execute adjust split ratio: {tx_hash}")

    return tx_hash


@register_action("swap-to-single")
def swap_to_single(agent, **kwargs):
    arguments = json.loads(kwargs.get("arguments"))

    tokens_in = arguments.get("tokens_in")
    token_out = arguments.get("token_out")

    types = ["address[]", "address"]

    encoded_data = w3.codec.encode(types, [tokens_in, token_out])
    data = Web3.to_hex(encoded_data)

    logger.info(f"strategy_address {agent.strategy_address}")
    logger.info(f"data {data}")

    tx_hash = agent.connection_manager.perform_action(
        connection_name="sonic",
        action_name="strategy",
        params=[agent.strategy_address, swap_to_single_enum, data],
    )

    logger.info(f"Execute swap to single: {tx_hash}")

    return tx_hash


@register_action("swap-to-many")
def swap_to_many(agent, **kwargs):
    arguments = json.loads(kwargs.get("arguments"))

    token_in = arguments.get("token_in")
    tokens_out = arguments.get("tokens_out")

    types = ["address", "address[]"]

    encoded_data = w3.codec.encode(types, [token_in, tokens_out])
    data = Web3.to_hex(encoded_data)

    tx_hash = agent.connection_manager.perform_action(
        connection_name="sonic",
        action_name="strategy",
        params=[agent.strategy_address, swap_to_many_enum, data],
    )

    logger.info(f"Execute swap to many: {tx_hash}")

    return tx_hash


@register_action("none")
def none(agent, **kwargs):
    arguments = json.loads(kwargs.get("arguments"))

    logger.info(f"At the none function {arguments}")

    return None
