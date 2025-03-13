.PHONY: tests
all: help
SHELL=bash

# Absolutely awesome: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-24s\033[0m %s\n", $$1, $$2}'

# Release commands
release-start: ## Run the release script (default: patch)
	@./cli/release patch

release-patch: ## Create a patch release (X.Y.Z -> X.Y.Z+1)
	@./cli/release patch

release-minor: ## Create a minor release (X.Y.Z -> X.Y+1.0)
	@./cli/release minor

release-major: ## Create a major release (X.Y.Z -> X+1.0.0)
	@./cli/release major
