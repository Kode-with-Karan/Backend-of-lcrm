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
//   } catch {
//     return false;
//   }
// }

// async function downloadAndTranscribe(url) {
//   if (!validateYoutubeUrl(url)) throw new Error('Invalid YouTube URL');
//   if (url.includes('VIDEO_ID') || url.includes('{VIDEO_ID}')) {
//     throw new Error('You must provide a real YouTube URL');
//   }

//   const tmpDir = await tmp.dir();
//   const mp3Path = path.join(tmpDir.path, 'audio.mp3');

//   try {
//     // If cookies.txt exists, include it
//     const cookieFile = fs.existsSync(path.resolve('./cookies.txt'))
//       ? path.resolve('./cookies.txt')
//       : null;

//     const args = {
//       extractAudio: true,
//       audioFormat: 'mp3',
//       audioQuality: '0',
//       ffmpegLocation: ffmpegPath,
//       output: mp3Path,
//       quiet: false,
//       noCheckCertificates: true,
//       userAgent:
//         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
//       referer: 'https://www.youtube.com',
//       retries: 5,
//       noWarnings: true,
//       format: 'bestaudio/best',
//       // Use YouTube extractor args to bypass 403 protections
//       'extractor-args': 'youtube:player_skip=webpage,config,js;player_client=android',
//     };

//     if (cookieFile) args.cookies = cookieFile;

//     console.log('🎬 Downloading audio from:', url);
//     await ytdlp(url, args);

//     if (!fs.existsSync(mp3Path)) {
//       throw new Error('yt-dlp did not produce an audio file');
//     }

//     console.log('✅ Audio download complete, starting transcription...');
//     const audioStream = fs.createReadStream(mp3Path);
//     const transcript = await openai.audio.transcriptions.create({
//       model: 'whisper-1',
//       file: audioStream,
//     });

//     return transcript.text;
//   } catch (err) {
//     const details =
//       err.stderr || err.stdout
//         ? `\n--- yt-dlp output ---\n${err.stderr || err.stdout}`
//         : '';
//     console.error('❌ Error in downloadAndTranscribe:', err.message || err, details);
//     throw new Error(`Whisper transcription failed: ${err.message || err}${details}`);
//   } finally {
//     try {
//       fs.rmSync(tmpDir.path, { recursive: true, force: true });
//     } catch {}
//   }
// }

// module.exports = { downloadAndTranscribe };

// // ...existing code...
// const tmp = require('tmp-promise');
// const fs = require('fs');
// const path = require('path');
// const ytdlp = require('yt-dlp-exec');
// const ffmpegPath = require('ffmpeg-static');
// const OpenAI = require('openai');
// const { getYoutubeTranscript } = require('./transcriptService');

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// console.log("Start")


// if (typeof globalThis.File === 'undefined') {
//   const { File } = require('node:buffer');
//   globalThis.File = File;
// }
// console.log("validateYoutubeUrl befor start")
// function validateYoutubeUrl(url) {
//   console.log("validateYoutubeUrl starts")
//   if (!url || typeof url !== 'string') return false;
//   try {
//     const u = new URL(url);
//     return u.hostname.includes('youtube.com') || u.hostname === 'youtu.be';
//   } catch {
//     return false;
//   }
// }

// function extractYoutubeVideoId(url) {
//   try {
//     const u = new URL(url);
//     // standard watch?v=VIDEO_ID
//     if (u.searchParams && u.searchParams.get('v')) return u.searchParams.get('v');
//     // youtu.be/VIDEO_ID
//     if (u.hostname === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0];
//     // /shorts/VIDEO_ID or /embed/VIDEO_ID
//     const parts = u.pathname.split('/').filter(Boolean);
//     const idx = parts.findIndex(p => p === 'shorts' || p === 'embed');
//     if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
//   } catch {}
//   return null;
// }

// async function downloadAndTranscribe(url) {
//   console.log("is this runs2")
//   if (!validateYoutubeUrl(url)) throw new Error('Invalid YouTube URL');
//   if (url.includes('VIDEO_ID') || url.includes('{VIDEO_ID}')) {
//     throw new Error('You must provide a real YouTube URL');
//   }

//   if (!process.env.OPENAI_API_KEY) {
//     throw new Error('OPENAI_API_KEY is not set');
//   }

//   const tmpDir = await tmp.dir();
//   const mp3Path = path.join(tmpDir.path, 'audio.mp3');

//   try {
//     const cookieFile = fs.existsSync(path.resolve('./cookies.txt'))
//       ? path.resolve('./cookies.txt')
//       : null;

//     const args = {
//       extractAudio: true,
//       audioFormat: 'mp3',
//       audioQuality: '0',
//       ffmpegLocation: ffmpegPath,
//       output: mp3Path,
//       quiet: false,
//       noCheckCertificates: true,
//       userAgent:
//         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
//       referer: 'https://www.youtube.com',
//       retries: 5,
//       noWarnings: true,
//       format: 'bestaudio/best',
//       'extractor-args': 'youtube:player_skip=webpage,config,js;player_client=android',
//     };

//     if (cookieFile) args.cookies = cookieFile;

//     console.log('🎬 Downloading audio from:', url);
//     const ytdlpResult = await ytdlp(url, args);
//     console.log('🧾 yt-dlp result (truncated):', typeof ytdlpResult === 'string' ? ytdlpResult.slice(0, 1000) : ytdlpResult);

//     if (!fs.existsSync(mp3Path)) {
//       throw new Error('yt-dlp did not produce an audio file');
//     }

//     console.log('✅ Audio download complete, starting transcription...');
//     const audioStream = fs.createReadStream(mp3Path);

//     const transcript = await openai.audio.transcriptions.create({
//       model: 'whisper-1',
//       file: audioStream,
//     });

//     // Normalize transcript
//     let text = '';
//     if (typeof transcript === 'string') {
//       text = transcript;
//     } else if (transcript && typeof transcript === 'object') {
//       if (typeof transcript.text === 'string') text = transcript.text;
//       else if (transcript.data && typeof transcript.data.text === 'string') text = transcript.data.text;
//       else if (transcript.choices && transcript.choices[0] && typeof transcript.choices[0].text === 'string')
//         text = transcript.choices[0].text;
//     }

//     if (text && text.toString().trim()) {
//       return text.toString().trim();
//     }

//     // If Whisper returned empty, attempt fallback to YouTube captions
//     console.warn('⚠ Whisper returned empty transcript; attempting captions fallback');
//     const videoId = extractYoutubeVideoId(url);
//     if (videoId) {
//       const captions = await getYoutubeTranscript(videoId);
//       if (captions && captions.trim()) {
//         console.log('✅ Fallback captions fetched from YouTube transcript API');
//         return captions.trim();
//       }
//     }



//     // Nothing found
//     console.log("mere pass hai 1")
//     throw new Error('Transcript not found');
//   } catch (err) {
//     // If OpenAI failed or yt-dlp failed, attempt fallback before final failure
//     // but only attempt captions fallback if not already tried
//     console.log("mere pass hai 2")
//     if (err.message && err.message.includes('Transcript not found')) {
//       throw err;
//     }

//     console.error('❌ Error in downloadAndTranscribe primary flow:', err.message || err);
//     // try captions fallback as a last resort
//     try {
//       const videoId = extractYoutubeVideoId(url);
//       if (videoId) {
//         const captions = await getYoutubeTranscript(videoId);
//         if (captions && captions.trim()) {
//           console.log('✅ Fallback captions fetched after error');
//           return captions.trim();
//         }
//       }
//     } catch (fallbackErr) {
//       console.error('❌ Fallback captions also failed:', fallbackErr.message || fallbackErr);
//     }

//     const details =
//       err.stderr || err.stdout
//         ? `\n--- yt-dlp output ---\n${err.stderr || err.stdout}`
//         : '';
//     throw new Error(`Whisper transcription failed: ${err.message || err}${details}`);
//   } finally {
//     try {
//       fs.rmSync(tmpDir.path, { recursive: true, force: true });
//     } catch {}
//   }
// }

// module.exports = { downloadAndTranscribe };
// // ...existing code...




// ...existing code...
const tmp = require('tmp-promise');
const fs = require('fs');
const path = require('path');
const ytdlp = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');
const OpenAI = require('openai');
const { getYoutubeTranscript } = require('./transcriptService');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ...existing helper functions (validateYoutubeUrl, extractYoutubeVideoId) ...
function validateYoutubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return u.hostname.includes('youtube.com') || u.hostname === 'youtu.be';
  } catch {
    return false;
  }
}

// Helper: extract video id from watch/shorts/embed/youtu.be URLs
function extractYoutubeVideoId(url) {
  try {
    const u = new URL(url);
    if (u.searchParams && u.searchParams.get('v')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0];
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex(p => p === 'shorts' || p === 'embed');
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  } catch {}
  return null;
}

async function downloadAndTranscribe(url) {
  if (!validateYoutubeUrl(url)) throw new Error('Invalid YouTube URL');
  if (url.includes('VIDEO_ID') || url.includes('{VIDEO_ID}')) {
    throw new Error('You must provide a real YouTube URL');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const tmpDir = await tmp.dir();
  const mp3Path = path.join(tmpDir.path, 'audio.mp3');

  try {
    const cookieFile = fs.existsSync(path.resolve('./cookies.txt'))
      ? path.resolve('./cookies.txt')
      : null;

    // define yt-dlp args (was missing)
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
      'extractor-args': 'youtube:player_skip=webpage,config,js;player_client=android',
    };

    if (cookieFile) args.cookies = cookieFile;

    console.log('🎬 Downloading audio from:', url);
    const ytdlpResult = await ytdlp(url, args);
    console.log('🧾 yt-dlp result (truncated):', typeof ytdlpResult === 'string' ? ytdlpResult.slice(0, 1000) : ytdlpResult);

    if (!fs.existsSync(mp3Path)) {
      throw new Error('yt-dlp did not produce an audio file');
    }

    console.log('✅ Audio download complete, starting transcription...');
    const audioStream = fs.createReadStream(mp3Path);

    const transcriptResp = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioStream,
    });

    // normalize transcript text from multiple possible shapes
    let text = '';
    if (typeof transcriptResp === 'string') {
      text = transcriptResp;
    } else if (transcriptResp && typeof transcriptResp === 'object') {
      if (typeof transcriptResp.text === 'string') text = transcriptResp.text;
      else if (transcriptResp.data && typeof transcriptResp.data.text === 'string') text = transcriptResp.data.text;
      else if (transcriptResp.choices && transcriptResp.choices[0] && typeof transcriptResp.choices[0].text === 'string')
        text = transcriptResp.choices[0].text;
    }

    if (text && text.toString().trim()) {
      return text.toString().trim();
    }

    // Whisper empty -> try captions fallback
    console.warn('⚠ Whisper returned empty transcript; attempting captions fallback');
    const videoId = extractYoutubeVideoId(url);
    if (videoId) {
      const captions = await getYoutubeTranscript(videoId);
      if (captions && captions.trim()) {
        console.log('✅ Fallback captions fetched from YouTube transcript API');
        return captions.trim();
      }
    }

    throw new Error('Transcript not found');
  } catch (err) {
    console.error('❌ Error in downloadAndTranscribe:', err.message || err);

    const isYtDlpMissing =
      err.code === 'ENOENT' ||
      (err.message && err.message.toLowerCase().includes('spawn') && err.message.toLowerCase().includes('enoent')) ||
      (err.message && err.message.toLowerCase().includes('yt-dlp'));

    if (isYtDlpMissing) {
      console.warn('⚠ yt-dlp missing on this environment — attempting captions fallback (no audio).');
      try {
        const videoId = extractYoutubeVideoId(url);
        if (videoId) {
          const captions = await getYoutubeTranscript(videoId);
          if (captions && captions.trim()) {
            console.log('✅ Captions fallback succeeded');
            return captions.trim();
          }
        }
      } catch (fbErr) {
        console.error('❌ Captions fallback failed:', fbErr.message || fbErr);
      }

      throw new Error('yt-dlp not available in runtime and no captions found; cannot transcribe audio on this host');
    }

    // last-resort captions fallback
    try {
      const videoId = extractYoutubeVideoId(url);
      if (videoId) {
        const captions = await getYoutubeTranscript(videoId);
        if (captions && captions.trim()) return captions.trim();
      }
    } catch (fbErr) {
      console.error('❌ Captions fallback also failed:', fbErr.message || fbErr);
    }

    const details =
      err.stderr || err.stdout
        ? `\n--- yt-dlp output ---\n${err.stderr || err.stdout}`
        : '';
    throw new Error(`Whisper transcription failed: ${err.message || err}${details}`);
  } finally {
    try { fs.rmSync(tmpDir.path, { recursive: true, force: true }); } catch {}
  }
}

module.exports = { downloadAndTranscribe };
// ...existing code...