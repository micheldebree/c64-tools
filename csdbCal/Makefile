SRC := $(filter-out $(wildcard *_test.go), $(wildcard *.go))

.PHONY: run
run:
	go run $(SRC)

.PHONY: all
all: csdbCal

.PHONY: install
install: ~/bin/csdbCal

csdbCal: $(SRC)
	go build -v -trimpath -ldflags "-w -s"

~/bin/csdbCal: csdbCal
	cp $< $@

.PHONY: clean
clean:
	rm -f *.ics

