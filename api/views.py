import re
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from googleapiclient.discovery import build


def parse_duration(duration):
    """Convert ISO8601 duration (PT1H2M3S) → hh:mm:ss string"""
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    if not match:
        return "0s"
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)

    result = ""
    if hours:
        result += f"{hours}h "
    if minutes:
        result += f"{minutes}m "
    if seconds:
        result += f"{seconds}s"
    return result.strip()


def duration_to_seconds(duration):
    """Convert ISO8601 duration → seconds"""
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


@api_view(['POST'])
def fetch_playlist(request):
    url = request.data.get("url")
    if not url:
        return Response({"error": "No playlist URL provided"}, status=400)

    # Extract playlist ID from URL
    import urllib.parse as urlparse
    query = urlparse.urlparse(url)
    playlist_id = urlparse.parse_qs(query.query).get("list")
    if not playlist_id:
        return Response({"error": "Invalid playlist URL"}, status=400)
    playlist_id = playlist_id[0]

    youtube = build("youtube", "v3", developerKey=settings.YOUTUBE_API_KEY)

    videos = []
    total_seconds = 0
    next_page_token = None

    while True:
        pl_request = youtube.playlistItems().list(
            part="contentDetails,snippet",
            playlistId=playlist_id,
            maxResults=50,
            pageToken=next_page_token
        )
        pl_response = pl_request.execute()

        video_ids = [item["contentDetails"]["videoId"]
                     for item in pl_response["items"]]
        vid_request = youtube.videos().list(
            part="contentDetails,snippet",
            id=",".join(video_ids)
        )
        vid_response = vid_request.execute()

        for item in vid_response["items"]:
            title = item["snippet"]["title"]
            thumbnail = item["snippet"]["thumbnails"]["medium"]["url"]
            url = f"https://www.youtube.com/watch?v={item['id']}"
            duration_iso = item["contentDetails"]["duration"]

            duration = parse_duration(duration_iso)
            seconds = duration_to_seconds(duration_iso)
            total_seconds += seconds

            videos.append({
                "title": title,
                "thumbnail": thumbnail,
                "url": url,
                "duration": duration
            })

        next_page_token = pl_response.get("nextPageToken")
        if not next_page_token:
            break

    # Format total duration
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    total_duration = f"{hours}h {minutes}m {seconds}s"

    return Response({
        "playlist_title": "YouTube Playlist",
        "total_duration": total_duration,
        "videos": videos
    })
