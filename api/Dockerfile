FROM node:12
ENV DOCKER=true
WORKDIR /usr/src/api
COPY wait-for-it.sh ./
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
EXPOSE 6001
