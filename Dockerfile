FROM node:alpine

RUN apk add python build-base linux-headers && npm install -g lerna@^3.22.1

WORKDIR /usr/src/app

COPY package.json package-lock.json lerna.json ./
COPY common/package.json common/package-lock.json common/
COPY frontend/package.json frontend/package-lock.json frontend/
COPY server/package.json server/package-lock.json server/

RUN lerna bootstrap --ci && lerna link

COPY . .

RUN lerna run build

WORKDIR server
CMD ["npm", "run", "run"]
