REV := $(shell git rev-parse --short HEAD)
SRC := $(filter-out $(wildcard *_test.go), $(wildcard *.go))
IMG := paintface.jpg

.PHONY: test
test: $(SRC)
	go run $^ -o $@-$(REV).png $(IMG) && open $@-$(REV).png
	png2prg -v -d $@-$(REV).png
	open $@-$(REV).prg

.PHONY: all
all: $(SRC)
	go build -v -trimpath -ldflags "-w -s"

.PHONY: clean
clean:
	rm *.png

