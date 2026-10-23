FROM node:24.22.1-alpine3.24
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build
# COPY dist .
