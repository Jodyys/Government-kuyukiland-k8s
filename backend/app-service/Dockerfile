FROM node:18

WORKDIR /app

# copy dependency dulu
COPY package*.json ./

# install dependency
RUN npm install

# baru copy source code
COPY . .

CMD ["node", "index.js"]