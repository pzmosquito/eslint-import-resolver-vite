container := eslint-import-resolver-vite

.PHONY: dev
dev:
	docker run -t -i -v `pwd`:/usr/app -w /usr/app --rm --name $(container) node:12-alpine

.PHONY: shell
shell:
	docker exec -it $(container) sh
