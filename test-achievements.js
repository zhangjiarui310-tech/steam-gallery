const https = require('https');

// 测试获取成就数据
const testAchievements = (appId) => {
  const options = {
    hostname: 'api.steampowered.com',
    path: `/ISteamUserStats/GetPlayerAchievements/v0001/?key=735ABF13A32A440C1270C87702D065AB&steamid=76561199870614636&appid=${appId}&l=en`,
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
        console.log(`\n=== App ID: ${appId} ===`);
        console.log('Status:', res.statusCode);
        if (jsonData.playerstats && jsonData.playerstats.achievements) {
          console.log('Achievements found:', jsonData.playerstats.achievements.length);
          if (jsonData.playerstats.achievements.length > 0) {
            const firstAchievement = jsonData.playerstats.achievements[0];
            console.log('First achievement:', JSON.stringify(firstAchievement, null, 2));
            console.log('Has icon:', 'icon' in firstAchievement);
            console.log('Has icon_gray:', 'icon_gray' in firstAchievement);
          }
        } else {
          console.log('No achievements data found');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`Error for app ${appId}:`, error);
  });

  req.end();
};

// 测试几个常见游戏
const appIds = [440, 730, 1245620]; // Team Fortress 2, Counter-Strike 2, Elden Ring
appIds.forEach(appId => testAchievements(appId));
