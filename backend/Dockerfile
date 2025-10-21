FROM node:20

# Setting up the work directory
WORKDIR /app

# COPY package.json
COPY package.json  /app

# Installing dependencies
RUN yarn install

# Copying all the files in our project
COPY . .

# Exposing server port
EXPOSE 3030

# Starting our application
CMD [ "node", "index.js" ]