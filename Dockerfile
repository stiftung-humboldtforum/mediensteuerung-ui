FROM node:24-alpine
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build
# COPY dist .
