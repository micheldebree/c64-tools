package main

import (
	"fmt"

	ics "github.com/arran4/golang-ical"
)

func createEventsCalender(events []EventElement) string {
	cal := ics.NewCalendar()

	for _, event := range events {
		calEvent := cal.AddEvent(calEventId(EventType, event.ID))
		calEvent.SetSummary(event.Name)
		calEvent.SetDescription(event.EventType)
		calEvent.SetURL(event.Website)
		calEvent.SetLocation(event.location())
		calEvent.SetAllDayStartAt(event.startDate())
		calEvent.SetAllDayEndAt(event.endDate())
	}

	return cal.Serialize()
}

func createReleasesCalendar(releases []ReleaseElement) string {
	cal := ics.NewCalendar()

	for _, release := range releases {
		calEvent := cal.AddEvent(calEventId(ReleaseType, release.ID))

		calEvent.SetSummary(release.summary())
		calEvent.SetDescription(release.description())
		calEvent.SetURL(release.url())

		releaseDate := release.releaseDate()
		calEvent.SetAllDayStartAt(releaseDate)
		calEvent.SetAllDayEndAt(releaseDate)

		// TODO: more accurate mimetype based on extension (png, jpg, gif etc.)
		calEvent.AddAttachmentURL(release.ScreenShot, "image/png")

		for _, downloadLink := range release.DownloadLinks {
			calEvent.AddAttachmentURL(downloadLink, "application/octet-stream")
		}
	}
	return cal.Serialize()
}

// unique calendar event id
func calEventId(entryType EntryType, id string) string {
	return fmt.Sprint("csdb_", entryType, id)
}
