
## What is webhook?

Webhook is a URL which wbot will hit on each incoming messages it receives. It can be any server just it should be able to interpret and provide proper json response in return.

Based on that response wbot will reply to that message.

## How to implement webhook with ExpressJS Server?

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
        [{
          "text": "Look, Reply from Webhook!",
          "type": "message"
        }]
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
## How to implement webhook with a PHP Server?
1. Create a server Apache or Nginx. You can use WampServer, Xampp etc for windows <br />
        * Get Apache Servers from here: [Xampp](https://www.apachefriends.org/download.html) or [WampServer](https://sourceforge.net/projects/wampserver/)<br />
        * Get Nginx and php from here: [Nginx](http://nginx.org/en/download.html) and [PHP](https://windows.php.net/download/)<br />
2. Use the following php code snippet on your server

```php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type,Accept");

$x = file_get_contents("php://input");
$x = json_decode($x);
$message = $x->text;
$msg_typ = $x->type;

$response = array(array('text' => '', 'type' => 'message'));

if($message == 'hi')
{
	$response = array(array('text' => 'hello my dear friend', 'type' => 'message'));
    $response = json_encode($response);
    echo($response);
}
?>
```

3. Save the file as filename.php
4. Edit the bot.json file
    
```json
{
    "appconfig":
    {
        "headless": false,
        "isGroupReply":false,
        "webhook":"http://url-where-php-server-is-on/filename.php"
    }
}
```
##### You can add a local server with localhost too.
  If you have any issues you can raise one [here](https://github.com/vasani-arpit/wbot/issues/new/choose)
