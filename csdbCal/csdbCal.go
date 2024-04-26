package main

import (
	"os"
)

func saveFile(filename string, content []byte) {
	err := os.WriteFile(filename, content, 0644)
	abortOnError(err)
}

func main() {
	eventIds := getItemIds(UpcomingEventsRSS)
	eventElements := getEvents(eventIds)
	eventCalendar := createEventsCalender(eventElements)
	saveFile("./events.ics", []byte(eventCalendar))

	releaseIds := getItemIds(LatestReleasesRSS)
	
	releases := getReleases(releaseIds)
	releaseCalendar := createReleasesCalendar(releases)
	saveFile("./releases.ics", []byte(releaseCalendar))
}
