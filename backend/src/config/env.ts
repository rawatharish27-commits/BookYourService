import { z } from 'zod';
import logger from './logger.js';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.string().default('info'),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().optional(),
});

try {
  // Validate process.env
  const parsedEnv = envSchema.parse(process.env);
  
  // This is a bit of a hack to make the validated & typed env available globally
  // A better approach in a larger app might be a dependency injection container
  // or passing a config object around.
  for (const key in parsedEnv) {
    if (Object.prototype.hasOwnProperty.call(parsedEnv, key)) {
        process.env[key] = (parsedEnv as any)[key];
    }
  }

  logger.info('✅ Environment variables validated successfully.');

} catch (error) {
  if (error instanceof z.ZodError) {
    logger.fatal({
        message: '🚨 Invalid or missing environment variables',
        errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    }, 'Server startup failed due to invalid environment configuration.');
  } else {
    logger.fatal(error, '🚨 An unexpected error occurred during environment validation.');
  }
  process.exit(1);
}

// We can export the parsed schema if we want to use it elsewhere, but for now
// we've mutated process.env which is simpler for this project's structure.
export const env = envSchema.parse(process.env);
