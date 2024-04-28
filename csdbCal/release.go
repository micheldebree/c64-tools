package main

import (
	"fmt"
	"time"
)

// CSDbDataReleases XML structure for Release
type CSDbDataReleases struct {
	Release ReleaseElement
}

type ReleaseElement struct {
	ID            string
	Name          string
	Type          string
	ReleaseDay    int
	ReleaseMonth  int
	ReleaseYear   int
	ReleasedAt    string `xml:"ReleasedAt>Event>Name"`
	ScreenShot    string
	ReleaseGroup  string          `xml:"ReleasedBy>Group>Name"`
	ReleaseHandle string          `xml:"ReleasedBy>Handle>Handle"`
	Credits       []ReleaseCredit `xml:"Credits>Credit"`
	DownloadLinks []string        `xml:"DownloadLinks>DownloadLink>Link"`
}

type ReleaseCredit struct {
	ID         string `xml:"Handle>ID"`
	Handle     string `xml:"Handle>Handle"`
	CreditType string
}

// Could be released by a group or by a handle
func (release ReleaseElement) releasedBy() string {
	if len(release.ReleaseGroup) > 0 {
		return release.ReleaseGroup
	}
	return release.ReleaseHandle
}

func (release ReleaseElement) releaseDate() time.Time {
	return time.Date(release.ReleaseYear, time.Month(release.ReleaseMonth), release.ReleaseDay, 0, 0, 0, 0, time.UTC)
}

func (release ReleaseElement) summary() string {
	return fmt.Sprintf("%s (%s)", release.Name, release.Type)
}

func (release ReleaseElement) description() string {
	releasedBy := release.releasedBy()
	descriptionText := fmt.Sprintf("Released by %s", releasedBy)
	if len(release.ReleasedAt) > 0 {
		descriptionText += fmt.Sprintf(" at %s", release.ReleasedAt)
	}
	descriptionText += "\n"

	for _, credit := range release.Credits {
		descriptionText += fmt.Sprintf("%s by %s\n", credit.CreditType, credit.Handle)
	}
	return descriptionText
}

func (release ReleaseElement) url() string {
	return fmt.Sprintf(ReleaseUrl, release.ID)
}

func getRelease(id string) ReleaseElement {

	decoder := getItemXMLDecoder(ReleaseType, id, 2)

	var csdbData CSDbDataReleases
	err := decoder.Decode(&csdbData)
	abortOnError(err)

	return csdbData.Release
}

// If handle is missing from a credit, fetch it from the webservice
func enrichCredits(releases *[]ReleaseElement) {

	cachedHandles := make(map[string]string)

	for _, release := range *releases {
		credits := release.Credits
		for i := 0; i < len(credits); i++ {
			credit := &credits[i]
			if len(credit.Handle) == 0 {
				handle, isCached := cachedHandles[credit.ID]
				if !isCached {
					handle = getScener(credit.ID)
					cachedHandles[credit.ID] = handle
				}
				credit.Handle = handle
			}
		}
	}
}

// Get releases for a list of ids
func getReleases(ids []string) []ReleaseElement {
	result := make([]ReleaseElement, len(ids))
	for i, id := range ids {
		result[i] = getRelease(id)
	}

	enrichCredits(&result)
	return result
}
