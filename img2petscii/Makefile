NAME=img2petscii
VERSION=$(shell cat package.json | jq -r .version)
BUILT=./built

.PHONY: all
all: node_modules
	echo Building $(NAME)-$(VERSION)
	yarn build
	cp ./res/characters.901225-01.bin $(BUILT)

.PHONY: publish
publish: all
	git tag $(NAME)-$(VERSION)
	git push --tags
	npm publish

node_modules: package.json yarn.lock
	yarn install

.PHONY: clean
clean:
	rm -rf $(BUILT)

.PHONY: fix
fix:
	./node_modules/.bin/eslint --fix ./src/*.ts

test: all
	node . --overwrite -m fast images.jpg

