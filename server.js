const express = require('express')
const axios = require('axios')

const port = 3001
const app = express()

app.listen(port, () => console.log(`listening on port ${port}`))

app.get('/api/warcraftlogs-client', (req, res) => {
  

    axios
        .post('https://www.warcraftlogs.com/oauth/token', {
          grant_type: 'client_credentials'
        }, {
          auth: {
            username: process.env.CLIENT_ID,
            password: process.env.CLIENT_SECRET
          }
        })
        .then(response => axios.post('https://classic.warcraftlogs.com/api/v2/client', {
          query: `query { characterData { character( name: "${req.query.name}", serverSlug: "${req.query.serverSlug}", serverRegion: "${req.query.serverRegion}") {zoneRankings(byBracket: true)}} }`
        }, {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`
          }
        }))
        .then(response => response.data.data.characterData.character.zoneRankings)
        .then(data => res.json(data))
       
    })

  



  // `query { characterData { character( name: "beastheart", serverSlug: "yojamba", serverRegion: "us") } }`

  // query: `query { gameData { ability(id:200202) { name, icon }} }`