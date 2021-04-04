FROM node:12.17.0-alpine
WORKDIR /usr

COPY /build .
COPY .env .
COPY ormconfig.json .

EXPOSE 5000

CMD ["node", "server"]


