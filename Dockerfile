FROM node:21-alpine3.18

COPY package.json /app/

WORKDIR /app

RUN npm install

COPY . .

CMD ["node", "index.js"]
