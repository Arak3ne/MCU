async function test() {
  const apiKey = "DRAFTER-59605981-E026-439E-BAFC-3C532CF18FB1";
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