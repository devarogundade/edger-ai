import time
from typing import Optional
from src.cli import ZerePyCLI
import logging
import threading

logger = logging.getLogger("agent_instance")


class AgentInstance:
    """Class representing an individual agent instance"""

    async def init(self, strategy_address: str, database: bool = False):
        self.cli = ZerePyCLI()

        # Load agent during creation
        if database:
            await self.cli._load_agent_from_database(strategy_address=strategy_address)
        else:
            self.cli._load_agent_from_file(agent_name=strategy_address)

        self.running = False
        self._stop_event = threading.Event()
        self.task: Optional[threading.Thread] = None

    def _run_agent_loop(self):
        """Agent loop execution logic"""
        try:
            log_once = False
            while not self._stop_event.is_set():
                if self.cli.agent:
                    try:
                        if not log_once:
                            logger.info(f"Agent loop running for {self.cli.agent.name}")
                            log_once = True

                        self.cli.agent.loop()

                        time.sleep(1)  # Prevent tight loop
                    except Exception as e:
                        logger.error(f"Agent error: {e}")
                        if self._stop_event.wait(timeout=30):
                            break
        except Exception as e:
            logger.error(f"Agent loop crashed: {e}")
        finally:
            self.running = False
            logger.info(f"Agent {self.cli.agent.name} stopped")

    def start(self):
        """Start the agent's loop thread"""
        if not self.running:
            self.running = True
            self._stop_event.clear()
            self.task = threading.Thread(target=self._run_agent_loop)
            self.task.start()

    def stop(self):
        """Stop the agent's loop thread"""
        if self.running:
            self._stop_event.set()
            if self.task:
                self.task.join(timeout=5)
            self.running = False
