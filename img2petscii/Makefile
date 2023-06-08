BUILT=./built

.PHONY: all
all: node_modules
	./node_modules/.bin/tsc
	cp ./res/characters.901225-01.bin $(BUILT)

node_modules: package.json yarn.lock
	yarn install

.PHONY: clean
clean:
	rm -rf $(BUILT)

fix:
	./node_modules/.bin/eslint --fix ./src/*.ts

