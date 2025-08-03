# API Setup Guide for Buzzwin

This guide will help you set up the TMDB and Gemini APIs for the Buzzwin application.

## 🔑 Required API Keys

### 1. TMDB API Key

The TMDB (The Movie Database) API provides movie and TV show data.

**Steps to get TMDB API key:**

1. Go to [TMDB website](https://www.themoviedb.org/)
2. Create an account or sign in
3. Go to your [Account Settings](https://www.themoviedb.org/settings/api)
4. Click on "API" in the left sidebar
5. Request an API key for "Developer" use
6. Fill out the required information
7. Copy your API key (v3 auth)

### 2. Gemini API Key

The Gemini API provides AI-powered recommendations and content analysis.

**Steps to get Gemini API key:**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## ⚙️ Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```env
# TMDB API Configuration
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here

# Gemini API Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🚀 Features Enabled

Once you've set up both APIs, the following features will be available:

### TMDB Integration

- **Real movie/TV show data** in onboarding and swipe interface
- **High-quality posters and backdrops**
- **Detailed show information** (ratings, release dates, genres)
- **Search functionality** for finding specific shows
- **Trending content** for new users

### Gemini AI Integration

- **Personalized recommendations** based on user preferences
- **Taste analysis** and insights about viewing patterns
- **Smart content suggestions** that improve over time
- **Personalized reviews** for shows based on user taste
- **Fun facts and conversation starters** about shows

## 🔧 API Usage Limits

### TMDB API

- **Rate Limit**: 40 requests per 10 seconds
- **Free Tier**: Unlimited requests
- **Data**: Movies, TV shows, images, ratings, cast info

### Gemini API

- **Rate Limit**: 15 requests per minute (free tier)
- **Token Limit**: 30,000 tokens per minute
- **Features**: Text generation, content analysis, recommendations

## 🛠️ Testing the APIs

You can test if your APIs are working by:

1. **Starting the development server**: `npm run dev`
2. **Going to the onboarding page**: `/onboarding`
3. **Checking the browser console** for any API errors
4. **Verifying that real movie/show data appears** instead of placeholder content

## 🐛 Troubleshooting

### Common Issues

**TMDB API not working:**

- Check that your API key is correct
- Verify the key is in the `.env.local` file
- Ensure the environment variable name is `NEXT_PUBLIC_TMDB_API_KEY`

**Gemini API not working:**

- Check that your API key is correct
- Verify the key is in the `.env.local` file
- Ensure the environment variable name is `NEXT_PUBLIC_GEMINI_API_KEY`
- Check if you've exceeded the rate limit

**No data showing:**

- Check browser console for errors
- Verify both API keys are set correctly
- Restart the development server after adding environment variables

### Error Messages

- **"TMDB API key not found"**: Add your TMDB API key to `.env.local`
- **"Gemini API key not found"**: Add your Gemini API key to `.env.local`
- **"Rate limit exceeded"**: Wait a few minutes before trying again
- **"Failed to load content"**: Check your internet connection and API keys

## 📱 Production Deployment

For production deployment, make sure to:

1. **Set environment variables** in your hosting platform (Vercel, Netlify, etc.)
2. **Use the same variable names** as in `.env.local`
3. **Test the APIs** in production environment
4. **Monitor API usage** to stay within limits

## 🔒 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all API keys
- **Monitor API usage** to prevent abuse
- **Consider rate limiting** in production if needed

## 📊 API Analytics

You can monitor your API usage:

- **TMDB**: Check your [TMDB account dashboard](https://www.themoviedb.org/settings/api)
- **Gemini**: Check your [Google AI Studio dashboard](https://makersuite.google.com/app/apikey)

## 🆘 Support

If you're having issues:

1. **Check the troubleshooting section** above
2. **Verify your API keys** are correct
3. **Test with a simple API call** to confirm connectivity
4. **Check the browser console** for detailed error messages
5. **Restart your development server** after making changes

---

**Note**: Both APIs offer generous free tiers that should be sufficient for development and small to medium production applications.
