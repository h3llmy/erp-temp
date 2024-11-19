FROM node:20.13.1-alpine AS builder
WORKDIR /usr/api

COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:20.13.1-alpine
WORKDIR /usr/api

RUN apk add --no-cache curl

COPY --from=builder /usr/api/package*.json ./
RUN npm install --omit=dev --ignore-scripts
COPY --from=builder /usr/api/dist ./dist
COPY --from=builder /usr/api/views ./views

EXPOSE ${PORT}

CMD [ "npm", "run", "start:prod" ]