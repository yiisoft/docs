help:
	@echo ""
	@echo "Available commands:"
	@echo "  make init     Install dependencies"
	@echo "  make build    Build the documentation"
	@echo "  make preview  Preview the build"
	@echo "  make dev      Run development server"
	@echo "  make po4a     Run translation tools"
	@echo ""

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
