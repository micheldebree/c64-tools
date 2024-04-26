package main

import (
	"fmt"
	"strings"
	"time"

	ics "github.com/arran4/golang-ical"
)

func commaSeparate(textParts ...string) string {
	result := ""

	for _, textPart := range textParts {
		trimmedText := strings.TrimSpace(textPart)
		if len(trimmedText) > 0 {
			if len(result) > 0 {
				result += ", " + trimmedText
			} else {
				result += trimmedText
			}
		}
	}
	return result
}

func createEventsCalender(events []EventElement) string {
	cal := ics.NewCalendar()

	for _, event := range events {
		calEvent := cal.AddEvent(fmt.Sprint(EventType, event.ID))
		calEvent.SetSummary(event.Name)
		calEvent.SetDescription(event.EventType)
		calEvent.SetURL(event.Website)
		calEvent.SetLocation(commaSeparate(event.Address, event.City, event.Country))

		startDate := time.Date(event.StartYear, time.Month(event.StartMonth), event.StartDay, 0, 0, 0, 0, time.UTC)
		endDate := time.Date(event.EndYear, time.Month(event.EndMonth), event.EndDay, 0, 0, 0, 0, time.UTC)

		calEvent.SetAllDayStartAt(startDate)
		calEvent.SetAllDayEndAt(endDate)
	}

	return cal.Serialize()
}

func createReleasesCalendar(releases []ReleaseElement) string {

	cal := ics.NewCalendar()

	for _, release := range releases {

		calEvent := cal.AddEvent(fmt.Sprint(ReleaseType, release.ID))
		calEvent.SetSummary(fmt.Sprintf("%s (%s)", release.Name, release.Type))

		releaseDate := time.Date(release.ReleaseYear, time.Month(release.ReleaseMonth), release.ReleaseDay, 0, 0, 0, 0, time.UTC)

		calEvent.SetAllDayStartAt(releaseDate)
		calEvent.SetAllDayEndAt(releaseDate)

		calEvent.SetURL(getReleaseUrl(release.ID))

		releasedBy := release.releasedBy()

		descriptionText := fmt.Sprintf("Released by %s", releasedBy)
		if len(release.ReleasedAt) > 0 {
			descriptionText += fmt.Sprintf(" at %s", release.ReleasedAt)
		}
		descriptionText += "\n"

		for _, credit := range release.Credits {
			descriptionText += fmt.Sprintf("%s by %s\n", credit.CreditType, credit.Handle)
		}

		calEvent.SetDescription(descriptionText)

		calEvent.AddAttachmentURL(release.ScreenShot, "image/png")

		for _, downloadLink := range release.DownloadLinks {
			calEvent.AddAttachmentURL(downloadLink.Link, "application/octet-stream")
		}

	}
	return cal.Serialize()
}
