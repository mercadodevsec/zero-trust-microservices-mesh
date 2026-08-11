// Test-only environment defaults so auth code (which requires JWT_SECRET)
// can sign/verify tokens without a real .env file present in CI/sandboxes.
// This is NOT used in dev or production — see .env.example for those.
process.env.JWT_SECRET ||= 'test-only-jwt-secret-do-not-use-in-prod';
process.env.JWT_EXPIRES_IN ||= '1h';
process.env.NODE_ENV ||= 'test';
