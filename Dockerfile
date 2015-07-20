FROM node
MAINTAINER Pierre Chaussalet <pchaussalet@gmail.com>

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update
RUN apt-get install -y pkg-config curl libvips-dev && \
    apt-get clean
RUN apt-get install -y libgsf-1-dev && \
    apt-get clean
# RUN curl -s https://raw.githubusercontent.com/lovell/sharp/master/preinstall.sh | bash -

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

EXPOSE 9000

CMD ["npm", "start"]
