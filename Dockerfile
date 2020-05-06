FROM sylvainleroux/rpi-node-puppeteer:latest

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./index.js ./index.js
