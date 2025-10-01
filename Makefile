.PHONY: install test all clean help

.DEFAULT_GOAL := help

HBS_TEMPLATES = $(sort $(wildcard partials/** views/** resume.hbs ))

all: resume.png ## Generate all output files

install: ## Install dependencies
	npm install

test: ## Run tests
	npm run test

resume.json: sample-resume.json
	cp sample-resume.json resume.json

resume.pdf: resume.json index.js  $(HBS_TEMPLATES)
	npm run pdf

resume.png: resume.pdf
	pdftoppm -png resume.pdf > resume.png

clean: ## Clean generated files
	rm -f resume.json resume.pdf resume.png

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
