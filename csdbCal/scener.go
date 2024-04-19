package main

// CSDbDataSceners XML structure for Scener
type CSDbDataSceners struct {
	Handle HandleElement
}

type HandleElement struct {
	Handle string
}

func getScener(id string) HandleElement {
	decoder := getItemXMLDecoder(ScenerType, id, 1)

	var csdbData CSDbDataSceners
	err := decoder.Decode(&csdbData)
	abortOnError(err)

	return csdbData.Handle
}
