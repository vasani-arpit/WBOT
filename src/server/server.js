const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path')
const multer = require('multer');
const moment = require('moment')

const graphicalInterface = (USERNAME, PASSWORD, PORT) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("Storing file")
      cb(null, './mediaToBeSent/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage: storage });
  app.set('view engine', 'ejs');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use((req, res, next) => {

    // -----------------------------------------------------------------------
    // authentication middleware
    // console.log("passing through middleware")
    const auth = { login: USERNAME, password: PASSWORD } // change this

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    // Verify login and password are set and correct
    if (login && password && login === auth.login && password === auth.password) {
      // Access granted...
      return next()
    }

    // Access denied...
    res.set('WWW-Authenticate', 'Basic realm="401"') // change this
    res.status(401).send('Authentication required.') // custom message

    // -----------------------------------------------------------------------

  })

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
  })
  app.get('/bot.json', (req, res) => {
    const botData = require(path.resolve('.','bot.json'))
    res.send(botData)
  })
  app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'))
  })
  app.get('/messages.json', (req, res) => {
    const messages = require(path.resolve('.','messages.json'))
    let todayMessages = []
    let today = moment()
    messages.map(msg => {
      let inputDate = moment(msg.timestamp, 'DD/MM/YYYY HH:mm')
      if (today.isSame(inputDate, 'day') && !(msg.hasMedia))
        todayMessages.push(msg)
    })
    res.send(todayMessages)
  })
  app.get('/messages', (req, res) => {
    res.sendFile(path.join(__dirname, '/messages.html'))
  })
  app.get('/deleteNode/:id', (req, res) => {
    const data = require(path.resolve('.','bot.json'))
    const id = req.params.id;
    data.bot.splice(id, 1)
    fs.writeFileSync(path.resolve('.','bot.json'), JSON.stringify(data, null, 2))
    res.redirect('/');
  })


  app.post('/newNode', upload.array('file'), (req, res) => {
    const data = require(path.resolve('.','bot.json'));
    const response = req.body;
    const files = req.files;

    if (files && files.length > 0) {
      const fileNames = files.map(file => "./mediaToBeSent/" + file.filename);
      response.file = fileNames;
    }

    if (response.exact.includes(',')) {
      response.exact = response.exact.split(',');
    }
    else {
      response.exact = [response.exact]
    }
    if (response.contains.includes(',')) {
      response.contains = response.contains.split(',');
    }
    else {
      response.contains = [response.contains]
    }
    if (response.responseAsCaption) {
      let responseAsCaption = response.responseAsCaption === "true" ? true : false;
      response.responseAsCaption = responseAsCaption
    }
    response.exact = response.exact.filter(res => res !== "")
    response.contains = response.contains.filter(res => res !== "")
    data.bot.push(response);
    fs.writeFileSync(path.resolve('.','bot.json'), JSON.stringify(data, null, 2))
    res.redirect('/');
  });

  app.listen(PORT, () => {
    console.log(`You can use the graphical interface at http://localhost:${PORT}`)
  });
}
module.exports = graphicalInterface
