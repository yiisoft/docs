init:
	npm install

build:
	npm run build

preview:
	npm run preview

dev:
	npm run dev

po4a:
	./_translations/prepare-config.sh && \
	docker run --rm \
		--user $(shell id -u):$(shell id -g) \
		-v $(PWD):/src \
		-w /src/_translations \
		--init \
		ghcr.io/yiisoft-contrib/po4a:0.74 \
		po4a.conf
