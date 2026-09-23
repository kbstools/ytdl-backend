const ytdl = require('@distube/ytdl-core');

module.exports = async (req, res) => {
    // Enable CORS for your GitHub Pages site
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL provided.' });
        }

        // Custom request headers to bypass YouTube data center bot blocks
        const agentOptions = {
            piped: true,
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            }
        };

        const info = await ytdl.getInfo(url, agentOptions);
        
        // Find formats with both video and audio
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' }) 
                    || info.formats.find(f => f.hasVideo && f.hasAudio)
                    || info.formats[0];

        if (!format || !format.url) {
            return res.status(500).json({ error: 'No downloadable format found.' });
        }

        return res.status(200).json({
            title: info.videoDetails.title,
            downloadUrl: format.url
        });
    } catch (error) {
        console.error('Extraction error:', error);
        return res.status(500).json({ error: 'Failed to process video link: ' + error.message });
    }
};
