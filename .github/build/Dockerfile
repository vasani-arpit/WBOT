FROM node:10.19.0-alpine3.10

RUN apk add bash zip

COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/*.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
