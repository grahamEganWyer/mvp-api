const express = require('express');
const axios = require('axios');
const Constants = require('./items');

const port = process.env.PORT || 3001;
const app = express();

app.listen(port, () => console.log(`listening on port ${port}`));

app.get('/api/warcraftlogs-client', (req, res) => {
  axios
    .post('https://www.warcraftlogs.com/oauth/token', {
      grant_type: 'client_credentials',
    }, {
      auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET,
      },
    })
    .then((response) => axios.post('https://classic.warcraftlogs.com/api/v2/client', {
      query: `query { characterData { character( name: "${req.query.name}", serverSlug: "${req.query.serverSlug}", serverRegion: "${req.query.serverRegion}") {zoneRankings(byBracket: true)}} }`,
    }, {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    }))
    // eslint-disable-next-line consistent-return
    .then((response) => {
      if (response.data.data.characterData.character) {
        return response.data.data.characterData.character.zoneRankings;
      }
      res.status(400).send('no character data');
    })
    .then((data) => {
      res.json(data);
    });
});

app.get('/api/nexus-hub', async (req, res) => {
  console.log(req.body);
  console.log('helo itmes');
  // const response = await axios
  //   .get('https://api.nexushub.co/wow-classic/v1/items/yojamba-horde', {
  //     headers: {
  //       Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY3AiOiIiLCJ1aWQiOiJiZWFzdGhlYXJ0IiwiaWF0IjoxNjI2OTYwMDk0LCJleHAiOjE2MjY5NjM2OTR9.q6oJQLIjpaDCwE7dej_XUnLeaQZSKSsCQv5JBJ-1VMIdeivwcqOLXd2bK9b1Bm_K6e5_Q9Iw45bUw9a5cxE22SniIKE4M5rlL03rB4oOC_HheFV2zeQYqxHgy6DQaJ27aHoQQa1DFxIdMvixIlzH9xnzsVYeRDPmG4O6o0OFmGYltmyjsYNP5J-D_rqU8SsHn1uCCaKvaeC3-OY7lNKtPot2CZl4x9P7zLPuDiff0rxaqoWXqk-_k2nZt3yQzZEv2rvQDWR3Gf0OB9XhYBRVpCPkmW1hMmm7n_OJhfdUiKNPmR2raZg20otC4U6dwfv3WN5U82oNjfGLSNbczOUmdA',
  //     },
  //   });
  // console.log(JSON.stringify(response.data.data.map((item) => item.itemId)));
  const allItemIds = Constants.ITEMS;
  const lowerBound = Math.floor((Math.random() * (allItemIds.length - 10)));
  const itemIds = allItemIds.slice(lowerBound, lowerBound + 10);
  const requests = itemIds.map((id) => axios.get(`https://api.nexushub.co/wow-classic/v1/items/yojamba-horde/${id}`));
  console.log(requests);

  const items = await Promise.all(requests)
    .then((itemArray) => itemArray.map((i) => ({
      name: i.data.name,
      icon: i.data.icon,
      sellPrice: i.data.sellPrice,
      vendorPrice: i.data.vendorPrice,
      tooltip: i.data.tooltip[0].label,
      itemLevel: i.data.itemLevel,
      tags: i.data.tags[0],
      stats: i.data.stats,
    })));

  console.log(items);
  res.json(items);
});

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// `query { characterData { character( name: "beastheart",
// serverSlug: "yojamba", serverRegion: "us") } }`

// query: `query { gameData { ability(id:200202) { name, icon }} }`
