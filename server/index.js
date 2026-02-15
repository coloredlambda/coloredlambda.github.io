const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Last.fm Configuration
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_API_SECRET = process.env.LASTFM_API_SECRET; // Optional for read-only calls
const LASTFM_USER = 'raajay';
const LASTFM_ENDPOINT = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&limit=1&format=json`;

app.use(cors());

app.get('/api/now-playing', async (req, res) => {
    if (!LASTFM_API_KEY) {
        return res.status(500).json({ error: 'LASTFM_API_KEY is not configured' });
    }

    try {
        const response = await fetch(LASTFM_ENDPOINT);
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.message });
        }

        const tracks = data.recenttracks && data.recenttracks.track;

        if (!tracks || tracks.length === 0) {
            return res.json({
                name: 'STATION_SILENT',
                artist: 'NO_RECENT_TRACKS',
                album: '',
                image: '',
                url: '',
                nowPlaying: false
            });
        }

        const track = tracks[0];
        const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';

        res.json({
            name: track.name,
            artist: track.artist['#text'],
            album: track.album['#text'] || '',
            image: (track.image && track.image.length > 0) ? track.image[track.image.length - 1]['#text'] : '',
            url: track.url,
            nowPlaying: isNowPlaying
        });
    } catch (error) {
        console.error('Error fetching Last.fm data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
