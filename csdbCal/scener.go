package main

// CSDbDataSceners XML structure for Scener
type CSDbDataSceners struct {
	Handle string `xml:"Handle>Handle"`
}

func getScener(id string) string {
	decoder := getItemXMLDecoder(ScenerType, id, 1)

	var csdbData CSDbDataSceners
	err := decoder.Decode(&csdbData)
	abortOnError(err)

	return csdbData.Handle
}
