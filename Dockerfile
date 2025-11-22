FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY ./backend/ .
RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 8000

CMD ["python", "main.py"]
