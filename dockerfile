FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY dist ./dist

COPY .env.development  .

EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "dist/main"]
