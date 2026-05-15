FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install
RUN npm install -g sequelize-cli

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx sequelize db:migrate && npx sequelize db:seed:all && node index.js"]
