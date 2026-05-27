FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

# npm install se ejecuta como root (necesario para modulos nativos como bcrypt)
RUN npm install
RUN npm install -g sequelize-cli

COPY . .

# V-14: Crear directorios con permisos del usuario node y cambiar propietario
RUN mkdir -p uploads log && chown -R node:node /app

# V-14: Ejecutar la aplicacion como usuario no-root
USER node

EXPOSE 3000

CMD ["sh", "-c", "npx sequelize db:migrate && npx sequelize db:seed:all && node index.js"]
