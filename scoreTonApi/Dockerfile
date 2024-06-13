FROM node
WORKDIR /usr/src/app
COPY scoreTONBlockchainPart.js .
COPY apiScore.js .
COPY package.json .
COPY package-lock.json .
RUN npm install
EXPOSE 3000
CMD [ "node", "apiScore.js" ]