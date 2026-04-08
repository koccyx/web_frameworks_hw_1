FROM node:22-alpine AS build

WORKDIR /app
ARG VITE_STATE_MANAGER=mobx
ENV VITE_STATE_MANAGER=$VITE_STATE_MANAGER
ARG VITE_USERS_API_URL=http://localhost:3001
ENV VITE_USERS_API_URL=$VITE_USERS_API_URL
ARG VITE_CORE_API_URL=http://localhost:3002
ENV VITE_CORE_API_URL=$VITE_CORE_API_URL

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

