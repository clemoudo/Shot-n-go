FROM nginx:stable-alpine-slim

RUN apk update && apk add curl

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY entrypoint-depends.sh /entrypoint-depends.sh
RUN chmod +x /entrypoint-depends.sh
ENTRYPOINT ["/entrypoint-depends.sh"]
