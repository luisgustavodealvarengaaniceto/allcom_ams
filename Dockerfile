FROM node:18

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 1212

CMD ["node", "proxy-server.js"]