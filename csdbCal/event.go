package main

// CSDbData XML structure for Event
type CSDbData struct {
	Event EventElement
}

type EventElement struct {
	ID         string
	Name       string
	EventType  string
	AKA        string
	StartDay   int
	StartMonth int
	StartYear  int
	EndDay     int
	EndMonth   int
	EndYear    int
	Address    string
	Zip        string
	City       string
	Country    string
	Website    string
}

// Get one event from the webservice
func getEvent(id string) EventElement {

	decoder := getItemXMLDecoder(EventType, id, 1)

	var csdbData CSDbData
	err := decoder.Decode(&csdbData)
	abortOnError(err)

	return csdbData.Event
}

// Get events for a list of ids
func getEvents(ids []string) []EventElement {
	result := make([]EventElement, len(ids))
	for i, id := range ids {
		result[i] = getEvent(id)
	}
	return result
}
