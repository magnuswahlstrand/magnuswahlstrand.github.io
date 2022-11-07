---
title: "Websockets on Heroku"
slug: 2019-10-19-heroku-websockets
datetime: 2019-10-19
tags: ["websocket", "go", "heroku"]
---

Let's create a simple web server that runs on [Heroku](https://www.heroku.com) and accepts websockets connections.

<!--more-->

## Setup web server

Before we do anything else, let's set up a simple webserver using the http router [`go-chi`](https://github.com/go-chi/chi).

```go
package main

import (
   "fmt"
   "log"
   "net/http"

   "github.com/go-chi/chi"
)

func homeHandler(w http.ResponseWriter, r *http.Request) {
   fmt.Fprintf(w, "Welcome home!")
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
   fmt.Fprintf(w, "Welcome, sock!")
}

func main() {

   r := chi.NewRouter()
   r.Get("/", homeHandler)
   r.Get("/ws", wsHandler)

   if err := http.ListenAndServe(":8080", r); err != nil {
      log.Fatal(err)
   }
}
```

Start the server using `go run main.go` and go to http://localhost:8080 and you should see

> Welcome, home!

You can also go to http://localhost:8080/ws

> Welcome, sock!

### Code

_The code for the base serveris [here](https://github.com/magnuswahlstrand/websockets-server/tree/pt1-simple-webserver)._

## Upgrading to Websockets

Now we can turn one of the endpoints into a websocket endpoint. One of the most commonly used websocket implementations in Go is [gorilla/websocket](https://github.com/gorilla/websocket). Some examples
_[here](https://github.com/gorilla/websocket/tree/master/examples/echo)._

**Step 1**: Create a wrapper for the `websocket.Upgrader`

```go
type server struct {
   websocket.Upgrader
}
```

**Step 2:** Turn `wsHandler` into `func (s *server) wsHandler`

```go
func (s *server) wsHandler(w http.ResponseWriter, r *http.Request) {
   ws, err := s.Upgrader.Upgrade(w, r, nil)
   if err != nil {
      http.Error(w, err.Error(), http.StatusInternalServerError)
      return
   }
   defer ws.Close()
   ws.WriteMessage(websocket.TextMessage, []byte("Welcome, sock"))
}
```

The code above upgrades HTTP connection to use the websocket protocol, handles errors if any and sends a message to the client.

**Step 3:** Finally, instantiate a `server` object in the main and use its handlers in the router.

```go
func main() {
    var s server
    ...
    r.Get("/", s.homeHandler)
    r.Get("/ws", s.wsHandler)
    ...
}
```

### Testing the connection

To test the websockets, we cannot use the browser directly, or we get the error:

> Bad Request websocket: the client is not using the websocket protocol: 'upgrade' token not found in 'Connection' header

Instead, we can use a command line tool to connect to the server, for example [hashrocket/ws](https://github.com/hashrocket/ws).

Start the server again `go run main.go` and then make a request using `ws`:

```bash
> ws ws://localhost:8080/ws
Welcome, sock
websocket: close 1006 (abnormal closure): unexpected EOF
```

As you see we successfully received the response `"Welcome, sock"`, and then the server closes the connection. Success!

### Code

_The code for the websocket server is [here](https://github.com/magnuswahlstrand/websockets-server/tree/pt2-websocket-endpoint)._

## Deploy to Heroku

Next step is to deploy the server to Heroku, so that everyone can enjoy our websocket server.

**Note:** this assumes that you have a Heroku account and that you have the [`heroku-cli`](https://devcenter.heroku.com/articles/heroku-cli) installed.

### Set variable PORT

The Heroku dynos give can give you a new port every time it is deployed. This means that we cannot use the hardcoded `:8080` anymore. Use the environment variable `PORT` instead.

```go
func main() {
   port, exists := os.LookupEnv("PORT")
   if !exists {
      log.Fatal("PORT not set")
   }

   ...

   if err := http.ListenAndServe(":"+port, r); err != nil {
      log.Fatal(err)
   }
}
```

### Add app dependencies

Heroku supports multiple dependency managers, but I normally use [`dep`](https://github.com/golang/dep). Initialize it:

```bash
dep init
```

This creates the `Gopkg.toml` and `Gopkg.lock` and a `vendor`folder with our dependencies like so

```bash
Gopkg.toml
Gopkg.lock
vendor/
   github.com/
      go-chi/
      gorilla/
```

More details [here](https://devcenter.heroku.com/categories/managing-go-dependencies).

### Heroku configuration

In the `Gopkg.toml` we add some metadata that Heroku will read

```toml
[metadata.heroku]
  root-package = "github.com/magnuswahlstrand/websockets"
  go-version = "go1.12"
  install = [
      ".",
  ]
  ensure = "false"
```

**root-package**: the name here affects the binary time. In my case this will cause the installed binary to be called `websockets`.

**install:**
`.` is default installation path. If you have a `cmd` directory you can use something like `./cmd/...`.

More details [here](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-go).

We also need a `Procfile` in the base of the repo that tell Heroku that we want to run a web server, and where the binary is found

**Procfile**

```bash
web: bin/websockets
```

### Create Heroku App

Create the Heroku app from the command line.

```bash
heroku apps:create some-websockets-server --region eu --buildpack heroku/go
```

This configures it to run on the EU server (US default), and tells it to download the `go` buildpack.

Next we make sure we link our git repo to heroku, and then we can push the current master to the heroku remote.

```bash
heroku git:remote some-websockets-server
```

_**Note:** make sure to commit everything before pushing._

```bash
git push heroku master
```

### Testing the connection again

Finally, we can test the connection again, but this time with the url we got from `heroku apps:create` command.

```bash
> ws ws://some-websockets-server.herokuapp.com/ws
Welcome, sock
websocket: close 1006 (abnormal closure): unexpected EOF
```

Great! Everything works as expected. If something went wrong, and you need to monitor your deployed app, you can use the following command.

```bash
heroku logs --tail -a some-websockets-server
```

### Code

_The code for the Heroku app is [here](https://github.com/magnuswahlstrand/websockets-server/tree/pt3-deploy-to-heroku)._
