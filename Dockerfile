FROM node:22-alpine
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build
# COPY dist .
