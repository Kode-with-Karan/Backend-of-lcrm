// ...existing code...
// const tmp = require('tmp-promise');
// const fs = require('fs');
// const path = require('path');
// // const ytdlp = require('yt-dlp-exec');
// const ytdlp = require('yt-dlp-exec').create('/usr/bin/yt-dlp');
// const ffmpegPath = require('ffmpeg-static');
// const { getYoutubeTranscript } = require('./transcriptService');

// // Dynamic provider: prefer OpenAI if OPENAI_API_KEY is present, otherwise use AssemblyAI if ASSEMBLYAI_API_KEY is set.

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

//     // Transcription provider selection
//     let text = '';

//     if (process.env.OPENAI_API_KEY) {
//       // lazy-require OpenAI SDK only when needed
//       const OpenAI = require('openai');
//       const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//       const transcript = await openai.audio.transcriptions.create({
//         model: 'whisper-1',
//         file: audioStream,
//       });

//       if (typeof transcript === 'string') {
//         text = transcript;
//       } else if (transcript && typeof transcript === 'object') {
//         if (typeof transcript.text === 'string') text = transcript.text;
//         else if (transcript.data && typeof transcript.data.text === 'string') text = transcript.data.text;
//         else if (transcript.choices && transcript.choices[0] && typeof transcript.choices[0].text === 'string')
//           text = transcript.choices[0].text;
//       }
//     } else if (process.env.ASSEMBLYAI_API_KEY) {
//       // Use AssemblyAI as alternative provider
//       async function transcribeWithAssembly(filePath) {
//         const key = process.env.ASSEMBLYAI_API_KEY;
//         if (!key) throw new Error('ASSEMBLYAI_API_KEY is not set');

//         // Upload file
//         const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
//           method: 'POST',
//           headers: { authorization: key },
//           body: fs.createReadStream(filePath),
//         });
//         const uploadJson = await uploadRes.json();
//         if (!uploadJson || !uploadJson.upload_url) throw new Error('AssemblyAI upload failed');

//         // Create transcription
//         const createRes = await fetch('https://api.assemblyai.com/v2/transcript', {
//           method: 'POST',
//           headers: { authorization: key, 'Content-Type': 'application/json' },
//           body: JSON.stringify({ audio_url: uploadJson.upload_url }),
//         });
//         const createJson = await createRes.json();
//         if (!createJson || !createJson.id) throw new Error('AssemblyAI create failed');

//         const id = createJson.id;
//         const pollUrl = `https://api.assemblyai.com/v2/transcript/${id}`;

//         const start = Date.now();
//         const timeoutMs = Number(process.env.ASSEMBLYAI_TIMEOUT_MS || 3 * 60 * 1000);
//         while (Date.now() - start < timeoutMs) {
//           await new Promise((r) => setTimeout(r, 3000));
//           const pollRes = await fetch(pollUrl, { headers: { authorization: key } });
//           const pollJson = await pollRes.json();
//           if (pollJson.status === 'completed') return pollJson.text || '';
//           if (pollJson.status === 'error') throw new Error(`AssemblyAI error: ${pollJson.error}`);
//         }
//         throw new Error('AssemblyAI transcription timed out');
//       }

//       // ensure stream is closed before calling AssemblyAI (we use file path)
//       audioStream.close && audioStream.close();
//       text = await transcribeWithAssembly(mp3Path);
//     } else {
//       throw new Error('No transcription provider configured. Set OPENAI_API_KEY or ASSEMBLYAI_API_KEY');
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


const tmp = require('tmp-promise');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { getYoutubeTranscript } = require('./transcriptService');

if (typeof globalThis.File === 'undefined') {
  const { File } = require('node:buffer');
  globalThis.File = File;
}

/* -----------------------------
   Utility Functions
------------------------------*/

function validateYoutubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return (
      u.hostname.includes('youtube.com') ||
      u.hostname === 'youtu.be'
    );
  } catch {
    return false;
  }
}

function extractYoutubeVideoId(url) {
  try {
    const u = new URL(url);

    if (u.searchParams.get('v')) return u.searchParams.get('v');

    if (u.hostname === 'youtu.be')
      return u.pathname.split('/').filter(Boolean)[0];

    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex(
      p => p === 'shorts' || p === 'embed'
    );
    if (idx !== -1 && parts[idx + 1])
      return parts[idx + 1];
  } catch {}

  return null;
}

/* -----------------------------
   Main Function
------------------------------*/

async function downloadAndTranscribe(url) {
  if (!validateYoutubeUrl(url)) {
    throw new Error('Invalid YouTube URL');
  }

  if (!process.env.OPENAI_API_KEY && !process.env.ASSEMBLYAI_API_KEY) {
    throw new Error(
      'No transcription provider configured. Set OPENAI_API_KEY or ASSEMBLYAI_API_KEY'
    );
  }

  const tmpDir = await tmp.dir();
  const mp3Path = path.join(tmpDir.path, 'audio.mp3');

  try {
    console.log('🎬 Downloading audio...');

    // Run yt-dlp using system binary
    await new Promise((resolve, reject) => {
      execFile(
        'yt-dlp',
        [
          url,
          '--extract-audio',
          '--audio-format', 'mp3',
          '--audio-quality', '0',
          '--ffmpeg-location', ffmpegPath,
          '--output', mp3Path,
          '--no-check-certificates',
          '--user-agent',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          '--referer', 'https://www.youtube.com',
          '--retries', '5',
          '--format', 'bestaudio/best'
        ],
        (error, stdout, stderr) => {
          if (error) {
            console.error(stderr);
            reject(error);
          } else {
            resolve(stdout);
          }
        }
      );
    });

    if (!fs.existsSync(mp3Path)) {
      throw new Error('yt-dlp did not produce audio file');
    }

    console.log('✅ Audio downloaded, starting transcription...');

    let text = '';

    /* -----------------------------
       OpenAI Whisper
    ------------------------------*/
    if (process.env.OPENAI_API_KEY) {
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const transcript =
        await openai.audio.transcriptions.create({
          model: 'whisper-1',
          file: fs.createReadStream(mp3Path)
        });

      text = transcript?.text || '';
    }

    /* -----------------------------
       AssemblyAI Fallback
    ------------------------------*/
    else if (process.env.ASSEMBLYAI_API_KEY) {
      const key = process.env.ASSEMBLYAI_API_KEY;

      const uploadRes = await fetch(
        'https://api.assemblyai.com/v2/upload',
        {
          method: 'POST',
          headers: { authorization: key },
          body: fs.createReadStream(mp3Path)
        }
      );

      const uploadJson = await uploadRes.json();
      if (!uploadJson.upload_url)
        throw new Error('AssemblyAI upload failed');

      const createRes = await fetch(
        'https://api.assemblyai.com/v2/transcript',
        {
          method: 'POST',
          headers: {
            authorization: key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            audio_url: uploadJson.upload_url
          })
        }
      );

      const createJson = await createRes.json();
      const id = createJson.id;

      const pollUrl =
        `https://api.assemblyai.com/v2/transcript/${id}`;

      while (true) {
        await new Promise(r => setTimeout(r, 3000));
        const pollRes = await fetch(pollUrl, {
          headers: { authorization: key }
        });
        const pollJson = await pollRes.json();

        if (pollJson.status === 'completed') {
          text = pollJson.text;
          break;
        }

        if (pollJson.status === 'error') {
          throw new Error(pollJson.error);
        }
      }
    }

    if (text && text.trim()) {
      return text.trim();
    }

    /* -----------------------------
       YouTube Caption Fallback
    ------------------------------*/
    console.warn('⚠ Empty transcript, trying captions...');

    const videoId = extractYoutubeVideoId(url);
    if (videoId) {
      const captions = await getYoutubeTranscript(videoId);
      if (captions?.trim()) {
        return captions.trim();
      }
    }

    throw new Error('Transcript not found');
  } catch (err) {
    console.error('❌ Transcription failed:', err.message);

    // Final fallback attempt
    try {
      const videoId = extractYoutubeVideoId(url);
      if (videoId) {
        const captions = await getYoutubeTranscript(videoId);
        if (captions?.trim()) {
          return captions.trim();
        }
      }
    } catch {}

    throw err;
  } finally {
    try {
      fs.rmSync(tmpDir.path, { recursive: true, force: true });
    } catch {}
  }
}

module.exports = { downloadAndTranscribe };
