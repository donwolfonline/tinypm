// test.mjs - Save this and run with Node
const testVerification = async () => {
    const domainId = 'cm4bjc35l0001jqgsp3oickqb'; // Your domain ID from logs
    
    try {
      const response = await fetch(
        `http://localhost:3131/api/domains/${domainId}/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Status:', response.status);
      console.log('Response:', await response.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  testVerification();