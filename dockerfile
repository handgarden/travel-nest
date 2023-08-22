FROM node:16

LABEL MAINTAINER=sjungwon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY dist ./

ENV NODE_ENV production

COPY .env.production ./

EXPOSE 8080

CMD ["node", "main.js"]