FROM node:24

# Setting up the work directory
WORKDIR /app

# COPY package.json
COPY package.json package-lock.json /app/

# Installing dependencies
RUN npm ci

# Copying all the files in our project
COPY . .

# Exposing server port
EXPOSE 3030

# Starting our application
CMD [ "node", "index.js" ]