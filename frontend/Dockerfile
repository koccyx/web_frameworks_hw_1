FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
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

FROM deps AS build-mf-catalog

ARG MF_ASSET_BASE=http://localhost:5174/
ENV MF_ASSET_BASE=$MF_ASSET_BASE
RUN npm run build -w mf-catalog

FROM deps AS build-mf-matching

ARG MF_ASSET_BASE=http://localhost:5175/
ENV MF_ASSET_BASE=$MF_ASSET_BASE
RUN npm run build -w mf-matching

FROM deps AS build-host

ARG MF_CATALOG_REMOTE=http://localhost:5174/remoteEntry.js
ARG MF_MATCHING_REMOTE=http://localhost:5175/remoteEntry.js
ENV MF_CATALOG_REMOTE=$MF_CATALOG_REMOTE
ENV MF_MATCHING_REMOTE=$MF_MATCHING_REMOTE
RUN npm run build -w host

FROM nginx:1.27-alpine AS mf-catalog

COPY --from=build-mf-catalog /app/mf-catalog/dist /usr/share/nginx/html
COPY nginx.remote.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

FROM nginx:1.27-alpine AS mf-matching

COPY --from=build-mf-matching /app/mf-matching/dist /usr/share/nginx/html
COPY nginx.remote.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

FROM nginx:1.27-alpine AS mf-host

COPY --from=build-host /app/host/dist /usr/share/nginx/html
COPY nginx.host.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
