/**
 * Runs before every test file.
 *
 * The repo's local .env points at the PRODUCTION database. Vitest does not
 * load .env into process.env, but a shell could still have these exported, so
 * point them at an unroutable address: every test mocks "@/lib/prisma", and if
 * one ever forgets, PrismaClient must fail to connect rather than reach prod.
 */
process.env.DATABASE_URL = "postgresql://velvea:test@127.0.0.1:1/velvea_test";
process.env.DIRECT_URL = process.env.DATABASE_URL;

// Never let a test accidentally talk to live Stripe or Upstash either.
delete process.env.STRIPE_SECRET_KEY;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
