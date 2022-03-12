FROM node:16.14.0

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY package.json package-lock.json* ./

RUN npm ci && npm cache clean --force

COPY . .

CMD [ "node", "src/index.js" ]