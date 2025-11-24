// const tmp = require('tmp-promise');
// const fs = require('fs');
// const path = require('path');
// const ytdlp = require('yt-dlp-exec');
// const ffmpegPath = require('ffmpeg-static');
// const OpenAI = require('openai');

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// if (typeof globalThis.File === 'undefined') {
//   const { File } = require('node:buffer');
//   globalThis.File = File;
// }

// function validateYoutubeUrl(url) {
//   if (!url || typeof url !== 'string') return false;
//   try {
//     const u = new URL(url);
//     return u.hostname.includes('youtube.com') || u.hostname === 'youtu.be';
//   } catch (e) {
//     return false;
//   }
// }

// async function downloadAndTranscribe(url) {
//   if (!validateYoutubeUrl(url)) throw new Error('Invalid YouTube URL');

//   // Detect placeholder values often used in examples
//   if (url.includes('VIDEO_ID') || url.includes('{VIDEO_ID}')) {
//     throw new Error('You must provide a real YouTube URL (replace VIDEO_ID placeholder)');
//   }

//   const tmpDir = await tmp.dir();
//   const mp3Path = path.join(tmpDir.path, 'audio.mp3');

//   try {
//     // Run yt-dlp without relying on platform-specific cookie paths.
//     // Remove the hardcoded cookies option which caused FileNotFoundError on Windows.
//     const args = {
//       extractAudio: true,
//       audioFormat: 'mp3',
//       audioQuality: '0',
//       ffmpegLocation: ffmpegPath,
//       output: mp3Path,
//       quiet: true,
//     };

//     await ytdlp(url, args);

//     // verify file exists
//     if (!fs.existsSync(mp3Path)) {
//       throw new Error('yt-dlp did not produce an audio file');
//     }

//     const audioStream = fs.createReadStream(mp3Path);
//     const transcript = await openai.audio.transcriptions.create({
//       model: 'whisper-1',
//       file: audioStream,
//     });

//     return transcript.text;
//   } catch (err) {
//     // Enhance error message with stderr/stdout if available
//     const details = (err.stderr || err.stdout) ? `; yt-dlp output: ${err.stderr || err.stdout}` : '';
//     console.error('❌ Error in downloadAndTranscribe:', err.message || err, details);
//     // rethrow a clearer error for callers
//     throw new Error(`Whisper transcription failed: ${err.message || err}${details}`);
//   } finally {
//     // Cleanup temp dir
//     try {
//       fs.rmSync(tmpDir.path, { recursive: true, force: true });
//     } catch (_) {
//       // ignore cleanup errors
//     }
//   }
// }

// module.exports = { downloadAndTranscribe };


const tmp = require('tmp-promise');
const fs = require('fs');
const path = require('path');
const ytdlp = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (typeof globalThis.File === 'undefined') {
  const { File } = require('node:buffer');
  globalThis.File = File;
}

function validateYoutubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return u.hostname.includes('youtube.com') || u.hostname === 'youtu.be';
  } catch {
    return false;
  }
}

async function downloadAndTranscribe(url) {
  if (!validateYoutubeUrl(url)) throw new Error('Invalid YouTube URL');
  if (url.includes('VIDEO_ID') || url.includes('{VIDEO_ID}')) {
    throw new Error('You must provide a real YouTube URL');
  }

  const tmpDir = await tmp.dir();
  const mp3Path = path.join(tmpDir.path, 'audio.mp3');

  try {
    // If cookies.txt exists, include it
    const cookieFile = fs.existsSync(path.resolve('./cookies.txt'))
      ? path.resolve('./cookies.txt')
      : null;

    const args = {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: '0',
      ffmpegLocation: ffmpegPath,
      output: mp3Path,
      quiet: false,
      noCheckCertificates: true,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      referer: 'https://www.youtube.com',
      retries: 5,
      noWarnings: true,
      format: 'bestaudio/best',
      // Use YouTube extractor args to bypass 403 protections
      'extractor-args': 'youtube:player_skip=webpage,config,js;player_client=android',
    };

    if (cookieFile) args.cookies = cookieFile;

    console.log('🎬 Downloading audio from:', url);
    await ytdlp(url, args);

    if (!fs.existsSync(mp3Path)) {
      throw new Error('yt-dlp did not produce an audio file');
    }

    console.log('✅ Audio download complete, starting transcription...');
    const audioStream = fs.createReadStream(mp3Path);
    const transcript = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioStream,
    });

    return transcript.text;
  } catch (err) {
    const details =
      err.stderr || err.stdout
        ? `\n--- yt-dlp output ---\n${err.stderr || err.stdout}`
        : '';
    console.error('❌ Error in downloadAndTranscribe:', err.message || err, details);
    throw new Error(`Whisper transcription failed: ${err.message || err}${details}`);
  } finally {
    try {
      fs.rmSync(tmpDir.path, { recursive: true, force: true });
    } catch {}
  }
}

module.exports = { downloadAndTranscribe };

