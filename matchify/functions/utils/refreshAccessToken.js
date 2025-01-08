/**
 * Refreshes the user access token.
 * @param {*} userId - ID of the user
 * @param {*} spotifyApi - The SpotifyWebApi instance
 * @param {*} db - Firestore instance
 * @returns {string} - The new access token
 */
async function refreshAccessToken(userId, spotifyApi, db) {
    try {
      // Retrieve refresh token from Firestore
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new Error("User not found");
      }
  
      const { spotifyRefreshToken } = userDoc.data();
  
      // Set the refresh token on the instance
      spotifyApi.setRefreshToken(spotifyRefreshToken);
  
      // Refresh the access token
      const data = await spotifyApi.refreshAccessToken();
      const newAccessToken = data.body.access_token;
  
      // Update Firestore with the new access token
      await db.collection("users").doc(userId).update({
        spotifyAccessToken: newAccessToken,
      });
  
      // Update SpotifyWebApi instance
      spotifyApi.setAccessToken(newAccessToken);
  
      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error.message);
      throw error;
    }
  }
  
  module.exports = refreshAccessToken;
  