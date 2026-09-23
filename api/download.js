const ytdl = require('@distube/ytdl-core');

module.exports = async (req, res) => {
    // Enable CORS for your GitHub Pages frontend
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
        // Validate YouTube URL format
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL provided.' });
        }

        // Fetch video metadata directly via JS
        const info = await ytdl.getInfo(url);
        
        // Find highest quality format that includes both video and audio
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' }) 
                    || info.formats.find(f => f.hasVideo && f.hasAudio)
                    || info.formats[0];

        if (!format || !format.url) {
            return res.status(500).json({ error: 'No downloadable format found for this video.' });
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
