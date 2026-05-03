import "dotenv/config";

async function test() {
  const apiKey = process.env.DRAFTER_API_KEY?.trim();
  if (!apiKey) {
    console.error("Missing DRAFTER_API_KEY (root .env)");
    process.exit(1);
  }
  const id = 'Me54ZxhS'; // from previous run
  try {
    const drafterResponse = await fetch(`https://api.drafter.lol/api/drafts/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log("Status:", drafterResponse.status);
    const data = await drafterResponse.json();
    console.log("Response:", data);
  } catch(e) {
    console.error(e);
  }
}

test();