FROM node:20-alpine

RUN mkdir /var/www && mkdir /var/www/fanatique-frontend
WORKDIR /var/www/fanatique-frontend/

ENV NODE_ENV production

COPY package.json yarn.lock ./

RUN yarn install
COPY . .

RUN yarn build 
CMD ["yarn", "preview"]