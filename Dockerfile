FROM node:20-slim

WORKDIR /app

RUN npm install -g expo-cli@latest eas-cli@latest

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--tunnel"]
