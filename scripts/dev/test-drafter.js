import "dotenv/config";

async function test() {
  const apiKey = process.env.DRAFTER_API_KEY?.trim();
  if (!apiKey) {
    console.error("Missing DRAFTER_API_KEY (root .env)");
    process.exit(1);
  }
  try {
    const drafterResponse = await fetch('https://api.drafter.lol/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        blueName: "Team 1",
        redName: "Team 2",
        disabledChampions: []
      })
    })
    
    console.log("Status:", drafterResponse.status);
    const text = await drafterResponse.text();
    console.log("Response:", text);
  } catch(e) {
    console.error(e);
  }
}

test();
