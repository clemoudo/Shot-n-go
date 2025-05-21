FROM mariadb:11.1

COPY init.sql /docker-entrypoint-initdb.d/

COPY entrypoint-secrets.sh /entrypoint-secrets.sh
RUN chmod +x /entrypoint-secrets.sh
ENTRYPOINT [ "entrypoint-secrets.sh" ]
