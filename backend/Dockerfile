FROM node:20-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S vimbiso -u 1001
RUN chown -R vimbiso:nodejs /app
USER vimbiso

EXPOSE 5000

CMD ["node", "server.js"]
