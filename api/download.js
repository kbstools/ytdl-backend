const youtubedl = require('youtube-dl-exec');

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
        // Extract video information using youtube-dl-exec
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificates: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true
        });

        // Find a format with both audio and video streams
        const format = output.formats.find(f => f.vcodec !== 'none' && f.acodec !== 'none') || output.formats[0];

        return res.status(200).json({
            title: output.title,
            downloadUrl: format.url
        });
    } catch (error) {
        console.error('Extraction error:', error);
        return res.status(500).json({ error: 'Failed to process video link' });
    }
};
