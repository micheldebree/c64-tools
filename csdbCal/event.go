package main

import (
	"strings"
	"time"
)

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

func (event EventElement) location() string {
	return strings.Join([]string{event.Address, event.City, event.Country}, ",")
}

func (event EventElement) startDate() time.Time {
	return time.Date(event.StartYear, time.Month(event.StartMonth), event.StartDay, 0, 0, 0, 0, time.UTC)
}

func (event EventElement) endDate() time.Time {
	return time.Date(event.EndYear, time.Month(event.EndMonth), event.EndDay, 0, 0, 0, 0, time.UTC)
}

// Get events for a list of ids
func getEvents(ids []string) []EventElement {
	result := make([]EventElement, len(ids))
	for i, id := range ids {
		result[i] = getEvent(id)
	}
	return result
}
