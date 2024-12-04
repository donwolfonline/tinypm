// scripts/verify-domain-setup.ts
import dns from 'dns/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySetup() {
  console.log('🔍 Verifying domain setup...');

  // 1. Check database schema
  try {
    const domains = await prisma.customDomain.findMany({ take: 1 });
    console.log('✅ Database schema verified');
    console.log(domains.length ? '🔗 Custom domain found' : '🚫 No custom domains found');
  } catch (e) {
    console.error('❌ Database schema issue:', e);
  }

  // 2. Verify DNS resolution
  try {
    const records = await dns.resolve('tiny.pm');
    console.log('✅ DNS resolution working');
    console.log(records.length ? '🔗 DNS records found' : '🚫 No DNS records found');
  } catch (e) {
    console.error('❌ DNS resolution issue:', e);
  }

  // 3. Check Caddy config (if accessible)
  try {
    const response = await fetch('http://192.99.245.232:3131/api/domains/verify');
    console.log('✅ Domain verification endpoint responding');
    console.log(response.status === 200 ? '🔗 Domain verification successful' : '🚫 Domain verification failed');
  } catch (e) {
    console.error('❌ Domain verification endpoint issue:', e);
  }

  await prisma.$disconnect();
}

verifySetup().catch(console.error);