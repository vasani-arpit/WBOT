## What is webhook?

Webhook is a URL which wbot will hit on each incoming messages it receives. It can be any server just it should be able to interpret and provide proper json response in return.

Based on that response wbot will reply to that message.

## How to implement webhook server?

here are the steps

1. Create a simple expressJS server using by following simple [Hello World](https://expressjs.com/en/starter/installing.html) tutorial
2. Add a new route. Final result should look like this.
    ```js
    const express = require('express')
    const app = express()
    const port = 3001
    //allowing requests from outside of the domain 
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept");
      next();
    });

    app.post('/api/incoming-webhook', (req, res) => res.send(
        {
          "text": "Look, Reply from Webhook!",
          "type": "message"
        }
    ))
    app.get('/', (req, res) => res.send('Hello World!'))

    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
    ```
  3. Restart the wbot process wait for incoming message and voilà !!

  It doesn't have to be node server. Any server would be fine as long as it returns valid JSON response.

  you can send multiple files in response as well. format for that will be same as following

  ```json
  {
    "text": "Look, quick replies!",
    "type": "message",
    "files":[{
        "name":"Name of the file",
        "file":"<Base64-string-of-the-file>"
    }]
  }
  ```


  If you have any issues you can raise one [here](https://github.com/vasani-arpit/wbot/issues/new/choose)