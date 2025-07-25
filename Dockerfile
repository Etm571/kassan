FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install
RUN npm ci

ARG NEXT_PUBLIC_WEBSOCKET_SECRET
ENV NEXT_PUBLIC_WEBSOCKET_SECRET=${NEXT_PUBLIC_WEBSOCKET_SECRET}

ARG NEXT_PUBLIC_WEBSOCKET_URL
ENV NEXT_PUBLIC_WEBSOCKET_URL=${NEXT_PUBLIC_WEBSOCKET_URL}

FROM base AS builder
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]


FROM base AS dev
WORKDIR /app
COPY . .

ARG NEXT_PUBLIC_WEBSOCKET_SECRET
ENV NEXT_PUBLIC_WEBSOCKET_SECRET=${NEXT_PUBLIC_WEBSOCKET_SECRET}

ARG NEXT_PUBLIC_WEBSOCKET_URL
ENV NEXT_PUBLIC_WEBSOCKET_URL=${NEXT_PUBLIC_WEBSOCKET_URL}


ENV NODE_ENV=development

RUN npm install
