FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install         # Install all dependencies for building

COPY . .

RUN npm run build       # Now the nest cli is available

RUN npm prune --production    # Remove dev dependencies

EXPOSE 3000
CMD ["node", "dist/main.js"]
