# Use an official Python image as base
FROM python:3.11

# Set environment variables to avoid creating __pycache__ folders
ENV PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Set the working directory
WORKDIR /app

# Add Poetry to PATH
ENV PATH="/root/.local/bin:$PATH"

# Copy the project files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry install --no-root --extras server

# Copy the rest of the app
COPY . .

# Expose the application port
EXPOSE 80

CMD ["poetry", "run", "python", "main.py", "--server"]
