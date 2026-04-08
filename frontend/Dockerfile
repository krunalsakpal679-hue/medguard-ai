FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 5173

# Default command (override in docker-compose for dev)
CMD ["npm", "run", "dev", "--", "--host"]
