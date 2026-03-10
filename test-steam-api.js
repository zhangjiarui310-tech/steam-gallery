const https = require('https');

const options = {
  hostname: 'api.steampowered.com',
  path: '/ISteamUserStats/GetPlayerAchievements/v0001/?key=735ABF13A32A440C1270C87702D065AB&steamid=76561199870614636&appid=440&l=en',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Achievements response:', JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error);
});

req.end();