// const { scrapeProfileData } = require('../services/profileScraper');
// const { generateRewrittenProfile } = require('../services/profileRewriter');

// exports.analyzeProfile = async (req, res) => {
//   const { linkedinUrl, goal } = req.body;

//   if (!linkedinUrl) return res.status(400).json({ error: 'LinkedIn URL is required.' });

//   try {
//     const scraped = await scrapeProfileData(linkedinUrl);
//     if (scraped?.Error) return res.status(400).json({ error: scraped.Error });

//     const rewritten = await generateRewrittenProfile(scraped, goal || 'Attract SaaS investors');
//     if (!rewritten) return res.status(500).json({ error: 'Failed to rewrite profile.' });

//     res.status(200).json({ original: scraped, rewritten });
//   } catch (error) {
//     console.error('Profile Analysis Error:', error);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// };

const { generateRewrittenProfile } = require('../services/profileRewriter');
const Profile = require('../models/Profile');

// exports.analyzeProfile = async (req, res) => {
//   const { name, headline, about, experience, goal } = req.body;

//   if (!headline || !about || !experience) {
//     return res.status(400).json({ error: 'Headline, About, and Experience are required.' });
//   }

//   try {
//     const profileData = {
//       Name: name || 'Information not available',
//       Headline: headline,
//       About: about,
//       Experience: experience
//     };

//     const rewritten = await generateRewrittenProfile(profileData, goal || 'Attract SaaS investors');
//     if (!rewritten || rewritten.error) {
//       return res.status(500).json({ error: 'Failed to rewrite profile.', details: rewritten?.error });
//     }

//     // Save to DB
//     const saved = await Profile.create({
//       original: profileData,
//       goal: goal || 'Attract SaaS investors',
//       rewritten
//     });

//     res.status(200).json({ original: profileData, rewritten, savedId: saved._id });
//   } catch (error) {
//     console.error('Profile Analysis Error:', error);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// };


exports.analyzeProfile = async (req, res) => {
  const { name, headline, about, experience, goal } = req.body;

  if (!headline || !about || !experience) {
    return res.status(400).json({ error: 'Headline, About, and Experience are required.' });
  }

  try {
    const profileData = {
      Name: name || 'Information not available',
      Headline: headline,
      About: about,
      Experience: experience
    };

    const rewritten = await generateRewrittenProfile(profileData, goal || 'Attract SaaS investors');
    if (!rewritten || rewritten.error) {
      return res.status(500).json({ error: 'Failed to rewrite profile.', details: rewritten?.error, raw: rewritten?.raw });
    }

    res.status(200).json({ original: profileData, rewritten });
  } catch (error) {
    console.error('Profile Analysis Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};