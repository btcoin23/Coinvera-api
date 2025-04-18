import { CLEAR_CACHE_INTERVAL, RateLimit } from '../config';
import User from '../models/User';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

const userCache = new Map<string, User>();
const rateLimiterCache = new Map<string, RateLimitRequestHandler>();
setInterval(async () => {
    for (const [apiKey, user] of userCache.entries()) {
        try {
            await User.findOneAndUpdate(
                { 'plan.apiKey': apiKey },
                { 
                    $set: {
                        'plan.credits': user.plan.credits,
                    }
                },
                { new: true }
            );
        } catch (error) {
            console.error(`Error updating user with API key ${apiKey}:`, error);
        }
    }
    
    userCache.clear();
    rateLimiterCache.clear();
    console.log(`User cache cleared at ${new Date().toISOString()}`);
}, CLEAR_CACHE_INTERVAL);

export async function authenticateKey (req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ message: 'API key is required' });
  }

  try {
    let user = userCache.get(apiKey);
    if(!user){
        const _user = await User.findOne({ 'plan.apiKey': apiKey });
        user = _user;
        if (!user) {
            return res.status(401).json({ message: 'Invalid API key' });
        }
        userCache.set(apiKey, _user);
    } 
    
    if (user?.plan.credits <= 0) {
        return res.status(402).json({ message: 'Insufficient credits' });
    }
    user.plan.credits -= 1;
    userCache.set(apiKey, user);
    let baseRateLimiter = rateLimiterCache.get(apiKey);
    if (!baseRateLimiter) {
        const windowMs = RateLimit[user.plan.level].windowMs;
        const max = RateLimit[user.plan.level].max;
        baseRateLimiter = rateLimit({
        windowMs,
        max,
        // max: 1, // Default max requests
        // @ts-ignore
        keyGenerator: () => apiKey, // Use the API key we'll attach
        // handler: (req, res) => {
        //   res.status(429).json({
        //     error: 'Too many requests',
            
        //   });
        // },
        // MemoryStore is used by default
      });
      rateLimiterCache.set(apiKey, baseRateLimiter);
    }
    
    // Apply the base rate limiter
    baseRateLimiter(req, res, next);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};