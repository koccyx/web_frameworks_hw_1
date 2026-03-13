FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm run build
RUN npx prisma generate

EXPOSE 3002

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

