SRC := $(filter-out $(wildcard *_test.go), $(wildcard *.go))
IMG := paintface.jpg

.PHONY: test
test: $(SRC)
	go run $^ -o $@.png $(IMG) && open $@.png
	png2prg -v -d $@.png
	open $@.prg

.PHONY: all
all: $(SRC)
	go build -v -trimpath -ldflags "-w -s"

.PHONY: clean
clean:
	rm *.png

