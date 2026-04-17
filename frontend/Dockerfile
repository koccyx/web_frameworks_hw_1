FROM node:22-alpine AS build

WORKDIR /app
ARG VITE_STATE_MANAGER=mobx
ENV VITE_STATE_MANAGER=$VITE_STATE_MANAGER
ARG VITE_USERS_API_URL=http://localhost:3001
ENV VITE_USERS_API_URL=$VITE_USERS_API_URL
ARG VITE_CORE_API_URL=http://localhost:3002
ENV VITE_CORE_API_URL=$VITE_CORE_API_URL

COPY package*.json ./
# npm workspaces require workspace package.json files to be present at install time
COPY host/package.json ./host/package.json
COPY mf-catalog/package.json ./mf-catalog/package.json
COPY mf-matching/package.json ./mf-matching/package.json
COPY shared/package.json ./shared/package.json
RUN npm install

COPY tsconfig.base.json ./
COPY webpack.shared.js ./
COPY host ./host
COPY mf-catalog ./mf-catalog
COPY mf-matching ./mf-matching
COPY shared ./shared
COPY src ./src

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/host/dist /usr/share/nginx/html
COPY --from=build /app/mf-catalog/dist /usr/share/nginx/html/mf-catalog
COPY --from=build /app/mf-matching/dist /usr/share/nginx/html/mf-matching
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

