FROM node:lts

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && \
    npm install -g pm2

# Copy the rest of the application
COPY . .

# Expose nodejs port if needed for debugging/logging
#EXPOSE 9229

# Start the app with PM2
CMD ["pm2-runtime", "index.js", "--name", "sui-gas-updater"]
