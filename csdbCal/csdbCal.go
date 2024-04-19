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
	
	// firstRelease := []string{releaseIds[0]}

	releases := getReleases(releaseIds)
	// releases := getReleases([]string{"241268"})
	releaseCalendar := createReleasesCalendar(releases)
	saveFile("./releases.ics", []byte(releaseCalendar))
}
