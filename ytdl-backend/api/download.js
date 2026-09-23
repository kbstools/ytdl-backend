const ytDlp = require('yt-dlp-exec');

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
        // Fetch raw direct streaming URLs from YouTube via yt-dlp
        const output = await ytDlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true
        });

        // Find a combined format (has both video and audio)
        const format = output.formats.find(f => f.vcodec !== 'none' && f.acodec !== 'none') || output.formats[0];

        return res.status(200).json({
            title: output.title,
            downloadUrl: format.url
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to process video link' });
    }
};