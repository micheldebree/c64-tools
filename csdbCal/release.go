package main

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
	DownloadLinks []DownloadLink  `xml:"DownloadLinks>DownloadLink"`
}

type ReleaseCredit struct {
	ID         string `xml:"Handle>ID"`
	Handle     string `xml:"Handle>Handle"`
	CreditType string
}

type DownloadLink struct {
	Link      string
	Downloads int
}

// Could be released by a group or by a handle
func (release ReleaseElement) releasedBy() string {
	if len(release.ReleaseGroup) > 0 {
		return release.ReleaseGroup
	}
	return release.ReleaseHandle
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
					handle = getScener(credit.ID).Handle
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
