FROM node:18-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./

FROM base AS dev

RUN npm install

COPY . .

ENV NODE_ENV=development

RUN npm install --global nodemon

EXPOSE 8080

CMD ["npm", "run", "dev"]


FROM base AS prod

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server.js"]
