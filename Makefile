serve:
	docker run --rm -it \
		-p 4000:4000 \
		-v $(PWD):/srv/jekyll \
		--name yiisoft-docs-dev \
		jekyll/jekyll:4.2.2 \
		jekyll serve --host 0.0.0.0 --livereload
