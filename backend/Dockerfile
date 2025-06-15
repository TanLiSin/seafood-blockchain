FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Run FastAPI
CMD ["uvicorn", "transaction_api:app", "--host", "0.0.0.0", "--port", "10000"]
