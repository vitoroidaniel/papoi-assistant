FROM node:20-alpine

# Install build deps for sharp
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create data dirs
RUN mkdir -p data/uploads data/notes data/pdfs data/clips

EXPOSE 3000

CMD ["node", "src/server.js"]
