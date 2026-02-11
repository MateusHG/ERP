ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]