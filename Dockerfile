FROM node:12.10.0-alpine

RUN npm i -g yarn
COPY yarn.lock package.json /service/
WORKDIR /service
RUN yarn
COPY . /service
RUN mkdir log
RUN yarn tsc
CMD [ "node", "dist/app.js" ]