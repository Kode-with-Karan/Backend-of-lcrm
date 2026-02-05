FROM node:22

# Install yt-dlp and ffmpeg
RUN apt-get update && \
    apt-get install -y yt-dlp ffmpeg && \
    apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 10000

CMD ["node", "index.js"]
