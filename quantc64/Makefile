VERSION := 0.0
REV := $(shell git rev-parse --short HEAD)
SRC := $(filter-out $(wildcard *_test.go), $(wildcard *.go))
IMG := colors2.jpg
# IMG := whitney-norm.png

.PHONY: test
test: $(SRC)
	go run $^ -o $@-$(REV).png -m koala $(IMG) && open $@-$(REV).png
	png2prg -v -d $@-$(REV).png
	open $@-$(REV).prg

.PHONY: all
all: $(SRC)
	go build -v -trimpath -ldflags="-w -s -X main.Version=$(VERSION).$(REV)"

.PHONY: clean
clean:
	rm *.png
