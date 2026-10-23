#!/bin/sh
docker run -v .:/app --rm -it \
	node:24-bookworm-slim \
	sh -c 'cd /app && yarn && yarn build'
