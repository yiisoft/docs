.DEFAULT_GOAL := help

help: ## Show available commands
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	| awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

init: ## Install dependencies
	npm install

build: ## Build the documentation
	npm run build

preview: ## Preview the build
	npm run preview

dev: ## Run development server
	npm run dev

po4a: ## Run translation tools
	./_translations/prepare-config.sh && \
	docker run --rm \
		--user $(shell id -u):$(shell id -g) \
		-v $(PWD):/src \
		-w /src/_translations \
		--init \
		ghcr.io/yiisoft-contrib/po4a:0.74 \
		po4a.conf
