FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/frontend/package*.json ./packages/frontend/

RUN npm ci

COPY packages/shared/ ./packages/shared/
COPY packages/frontend/ ./packages/frontend/

RUN npm run build --workspace=@bunker/shared

ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build --workspace=@bunker/frontend

FROM nginx:1.25-alpine

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
