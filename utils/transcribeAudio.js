const fs = require('fs');
const openai = require('./openaiClient');

const transcribeAudio = async (filePath) => {
  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1'
    });

    return response.text;
  } catch (err) {
    console.error("Transcription error:", err.message);
    throw err;
  }
};

module.exports = transcribeAudio;
