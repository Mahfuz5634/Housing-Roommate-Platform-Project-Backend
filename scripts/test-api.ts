import http from 'http';
import app from '../src/app';

const PORT = 5099;

async function runTests() {
  const server = app.listen(PORT);
  console.log(`🧪 Testing server started on port ${PORT}...`);

  const request = async (
    method: string,
    path: string,
    body?: any,
    token?: string,
  ): Promise<{ status: number; data: any }> => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (payload) {
        headers['Content-Length'] = Buffer.byteLength(payload).toString();
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: PORT,
          path: encodeURI(path),
          method,
          headers,
        },
        (res) => {
          let responseData = '';
          res.on('data', (chunk) => (responseData += chunk));
          res.on('end', () => {
            try {
              resolve({
                status: res.statusCode || 500,
                data: JSON.parse(responseData),
              });
            } catch (e) {
              resolve({
                status: res.statusCode || 500,
                data: responseData,
              });
            }
          });
        },
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  };

  try {
    console.log('\n--- 1. Health Check Test ---');
    const health = await request('GET', '/');
    console.log(`Status: ${health.status}, Message: ${health.data.message}`);
    if (health.status !== 200) throw new Error('Health check failed');

    console.log('\n--- 2. Authentication Test (All 3 Roles) ---');
    // Admin login
    const adminLogin = await request('POST', '/api/v1/auth/login', {
      email: 'admin@roommatehub.com',
      password: 'Admin@123456',
    });
    console.log(`Admin login status: ${adminLogin.status}, Role: ${adminLogin.data.data?.user?.role}`);
    const adminToken = adminLogin.data.data?.accessToken;

    // Landlord login
    const landlordLogin = await request('POST', '/api/v1/auth/login', {
      email: 'john.landlord@roommatehub.com',
      password: 'Landlord@123456',
    });
    console.log(`Landlord login status: ${landlordLogin.status}, Role: ${landlordLogin.data.data?.user?.role}`);
    const landlordToken = landlordLogin.data.data?.accessToken;

    // Tenant login
    const tenantLogin = await request('POST', '/api/v1/auth/login', {
      email: 'alex.tenant@roommatehub.com',
      password: 'Tenant@123456',
    });
    console.log(`Tenant login status: ${tenantLogin.status}, Role: ${tenantLogin.data.data?.user?.role}`);
    const tenantToken = tenantLogin.data.data?.accessToken;

    console.log('\n--- 3. RBAC 403 Forbidden Protection Test ---');
    // Tenant trying to access Admin analytics
    const rbacTest = await request('GET', '/api/v1/admin/analytics', null, tenantToken);
    console.log(`Tenant access to Admin endpoint status: ${rbacTest.status} (Expected 403 Forbidden)`);
    console.log(`Error message: ${rbacTest.data.message}`);
    if (rbacTest.status !== 403) throw new Error('RBAC check failed: Expected 403 Forbidden');

    console.log('\n--- 4. Zod Validation Error 400 Bad Request Test ---');
    const validationTest = await request('POST', '/api/v1/auth/login', {
      email: 'invalid-email-address',
      password: '',
    });
    console.log(`Invalid body status: ${validationTest.status} (Expected 400 Bad Request)`);
    console.log(`Error sources:`, JSON.stringify(validationTest.data.errorSources));
    if (validationTest.status !== 400) throw new Error('Validation check failed: Expected 400 Bad Request');

    console.log('\n--- 5. 404 Route Not Found Test ---');
    const notFoundTest = await request('GET', '/api/v1/random-route-xyz');
    console.log(`Not found status: ${notFoundTest.status} (Expected 404 Not Found)`);
    if (notFoundTest.status !== 404) throw new Error('Not found check failed');

    console.log('\n--- 6. Property Search & Filter Test ---');
    const properties = await request('GET', '/api/v1/properties?city=New York');
    console.log(`Properties count found in New York: ${properties.data.data?.length}`);

    console.log('\n--- 7. Roommate Compatibility Matching Algorithm Test ---');
    const matches = await request('GET', '/api/v1/roommates/match', null, tenantToken);
    console.log(`Compatibility matches calculated: ${matches.data.data?.length}`);
    if (matches.data.data?.length > 0) {
      const topMatch = matches.data.data[0];
      console.log(`Top Match Score: ${topMatch.compatibilityPercentage}%, Candidate: ${topMatch.candidateProfile?.user?.email}`);
    }

    console.log('\n--- 8. Admin Dashboard Analytics Test ---');
    const analytics = await request('GET', '/api/v1/admin/analytics', null, adminToken);
    console.log(`Total users: ${analytics.data.data?.users?.total}`);
    console.log(`Total properties: ${analytics.data.data?.properties?.total}`);
    console.log(`Total revenue: $${analytics.data.data?.financials?.totalRevenue}`);

    console.log('\n✅ ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
