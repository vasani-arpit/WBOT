FROM node:16.20-alpine

RUN apk add bash zip

COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/*.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
