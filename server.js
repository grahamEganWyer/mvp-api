const express = require('express');
const axios = require('axios');

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
    .then((response) => {
      console.log('first promisde');
      console.log(req);
      return axios.post('https://classic.warcraftlogs.com/api/v2/client', {
        query: `query { characterData { character( name: "${req.query.name}", serverSlug: "${req.query.serverSlug}", serverRegion: "${req.query.serverRegion}") {zoneRankings(byBracket: true)}} }`,
      }, {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      });
    })
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
