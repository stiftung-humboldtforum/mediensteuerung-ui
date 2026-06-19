#!/bin/sh
docker run -v .:/app --rm -it \
	node:22-bookworm-slim \
	sh -c 'cd /app && yarn && yarn build'
