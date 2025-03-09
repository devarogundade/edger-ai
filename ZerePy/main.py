import argparse
from src.cli import ZerePyCLI

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ZerePy - AI Agent Framework")
    parser.add_argument("--server", action="store_true", help="Run in server mode")
    parser.add_argument(
        "--host", default="0.0.0.0", help="Server host (default: 0.0.0.0)"
    )
    parser.add_argument(
        "--port", type=int, default=8000, help="Server port (default: 8000)"
    )
    args = parser.parse_args()

    if args.server:
        try:
            from src.server2 import start_server2

            start_server2(host=args.host, port=args.port)
        except ImportError as e:
            print(
                f"Server dependencies not installed. Run: poetry install --extras server {e}"
            )
            exit(1)
    else:
        cli = ZerePyCLI()
        cli.main_loop()
