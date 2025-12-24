init:
	npm install

up:
	npm run dev

po4a:
	./_translations/prepare-config.sh && \
	docker run --rm \
		--user $(shell id -u):$(shell id -g) \
		-v $(PWD):/src \
		-w /src/_translations \
		arduanovdanil/po4a-fork:v0.73 \
		po4a.conf
