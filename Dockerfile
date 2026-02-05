FROM node:20-bookworm

RUN apt-get update && apt-get install -y \
    yt-dlp \
    ffmpeg \
    curl \
    build-essential \
    python3 \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
