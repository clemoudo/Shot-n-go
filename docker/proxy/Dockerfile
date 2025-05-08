FROM nginx:stable-alpine-slim

RUN apk update && apk add curl

COPY ./nginx.conf /etc/nginx/nginx.conf
