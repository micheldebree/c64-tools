NAME=img2petscii
VERSION=$(shell cat package.json | jq -r .version)
BUILT=./built

.PHONY: all
all: node_modules
	echo Building $(NAME)-$(VERSION)
	./node_modules/.bin/tsc
	cp ./res/characters.901225-01.bin $(BUILT)

publish: all
	git tag $(NAME)-$(VERSION)
	git push --tags
	npm publish

node_modules: package.json yarn.lock
	yarn install

.PHONY: clean
clean:
	rm -rf $(BUILT)

fix:
	./node_modules/.bin/eslint --fix ./src/*.ts

