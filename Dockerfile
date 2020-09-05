FROM node:12

WORKDIR /server

COPY ./package*.json ./

RUN  apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y build-essential python \ 
  && npm install

COPY . .

EXPOSE 3001

ENV mode=production

CMD [ "npm", "run", "start" ]