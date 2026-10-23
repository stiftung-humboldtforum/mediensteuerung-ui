#!/bin/sh
# -it only with a terminal; without one (scripts, ssh without -t) docker run refuses it.
tty=""; [ -t 0 ] && tty="-it"
docker run -v .:/app --rm $tty \
	node:24.22.1-bookworm-slim \
	sh -c 'cd /app && yarn --frozen-lockfile && yarn build'
