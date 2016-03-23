FROM node:4.4

WORKDIR /src
ADD . .

# If you need npm, don't use a base tag
RUN npm install

EXPOSE 3000
CMD ["node", "--harmony", "index.js"]
