// const LinkedInProfile = require('../models/LinkedInProfile');
// const { scrapePosts } = require('../services/ScraperService');
// const { generatePostForProfile } = require('../services/genPostService');

// // exports.clonePost = async (req, res) => {
// //   const { linkedinUrl, topic } = req.body;
// //   if (!linkedinUrl || !topic) {
// //     return res.status(400).json({ error: 'Missing input: linkedinUrl and topic are required' });
// //   }

// //   try {
// //     const username = linkedinUrl.split('/in/')[1]?.replace(/\/$/, '');
// //     if (!username) {
// //       return res.status(400).json({ error: 'Invalid LinkedIn URL' });
// //     }

// //     let profile = await LinkedInProfile.findOne({ username });
// //     if (!profile) {
// //       console.log(`Profile not found for ${username}. Scraping posts...`);
// //       const { posts, Error } = await scrapePosts(linkedinUrl);
// //       if (Error) {
// //         return res.status(500).json({ error: Error });
// //       }
// //       profile = await LinkedInProfile.create({ username, posts });
// //       console.log(`Profile created for ${username} with ${posts.length} posts`);
// //     } else {
// //       console.log(`Using existing profile for ${username} with ${profile.posts.length} posts`);
// //     }

// //     const result = await generatePostForProfile(username, topic);
// //     if (!result) {
// //       return res.status(500).json({ error: 'Post generation failed' });
// //     }

// //     res.status(200).json({
// //       username,
// //       scrapedAt: profile.scrapedAt,
// //       signature: result.signature,
// //       generatedPost: result.generatedPost
// //     });
// //   } catch (error) {
// //     console.error('Error in clonePost:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // };


// exports.clonePost = async (req, res) => {
//   const { linkedinUrl, topic } = req.body;
//   if (!linkedinUrl || !topic) {
//     return res.status(400).json({ error: 'Missing input: linkedinUrl and topic are required' });
//   }

//   try {
//     const username = linkedinUrl.split('/in/')[1]?.replace(/\/$/, '');
//     if (!username) {
//       return res.status(400).json({ error: 'Invalid LinkedIn URL' });
//     }

//     let profile = await LinkedInProfile.findOne({ username });

//     if (!profile || (profile.posts && profile.posts.length === 0)) {
//       console.log(`Profile not found or has no posts. Scraping posts for ${username}...`);
//       const { posts, Error } = await scrapePosts(linkedinUrl);
//       if (Error || posts.length === 0) {
//         return res.status(500).json({ error: Error || 'No valid posts found to clone.' });
//       }

//       profile = await LinkedInProfile.findOneAndUpdate(
//         { username },
//         { $set: { posts, scrapedAt: new Date() } },
//         { new: true, upsert: true }
//       );
//       console.log(`Profile updated with ${posts.length} posts`);
//     } else {
//       console.log(`Using existing profile for ${username} with ${profile.posts.length} posts`);
//     }

//     const result = await generatePostForProfile(username, topic);
//     if (!result || !result.generatedPost) {
//       return res.status(500).json({ error: 'Post generation failed. Profile may lack quality posts.' });
//     }

//     res.status(200).json({
//       username,
//       scrapedAt: profile.scrapedAt,
//       signature: result.signature,
//       generatedPost: result.generatedPost
//     });
//   } catch (error) {
//     console.error('Error in clonePost:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const { generateFromMultipleInputs } = require('../services/genPostService');
exports.clonePostFromManual = async (req, res) => {
  
  const { posts, topic, tone, copyPercent } = req.body;
  if (!Array.isArray(posts) || posts.length === 0 || !topic || !tone || typeof copyPercent !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid input: posts[], topic, tone, and copyPercent are required' });
  }

  try {
    const result = await generateFromMultipleInputs(posts, topic, tone, copyPercent);
    if (!result || !result.generatedPost) {
      return res.status(500).json({ error: 'Post generation failed.' });
    }

    return res.status(200).json({
      tone,
      copyPercent,
      generatedPost: result.generatedPost
    });
  } catch (err) {
    console.error('Error in clonePostFromManual:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


