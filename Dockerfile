FROM node:12.10.0-alpine

RUN npm i -g yarn
COPY . /service
WORKDIR /service
RUN mkdir log
RUN yarn
RUN yarn tsc
CMD [ "node", "dist/app.js" ]