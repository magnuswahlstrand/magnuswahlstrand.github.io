---
title: "Automatic key rotation on Heroku"
slug: 2019-11-30-heroku-secrets-rotation
datetime: 2019-11-29
tags: ["security", "heroku"]
---

Automatic key rotation is a simple way of improving the security of an app. 

In this example, I have two services running on [Heroku](https://www.heroku.com/). The goal is that the API key in `service-1` one can be rotated smoothly (every 2 week), while `service-2` uses the rotating API keys to connect to `service-1`. 
We will use the Heroku plugin [securekey](https://elements.heroku.com/addons/securekey).

<!--more-->

## Creating the secret

First, we need to add the `securekey` addon to our app.

```bash
# Add addon to app
> heroku addons:create securekey:fortnightly -a service-1

Creating securekey:fortnightly on ⬢ service-1... free
Created securekey-solid-14332 as SECURE_KEY
```

This does two things:

1. Add an instance of the `securekey` addon (named `securekey-solid-14332`)
2. Create a config variable `SECRET_KEY`.

```bash

# List secret in service #1
> heroku config -a service-1 | grep SECURE_KEY

SECURE_KEY: 3F6D463C2A79289DC5B3C13A4EB2736B0D51A80234CAEAF0EA12D15F12E9FDEE,CF8BBE474F57D9CA1DB402B2D19873E2F05ABED1213256FB761E166A2C8E6EBA
```

### Attaching it to service #2

We can attach this secret to `service-2` using the following command. Remember to use the addon instance name (in my case `securekey-solid-14332`). We can set the name of the variable using the flag  `--as SERVICE_ONE_SECURE`.

```bash
> heroku addons:attach securekey-solid-14332 --as SERVICE_ONE_SECURE -a service-2

Attaching securekey-solid-14332 as SERVICE_ONE_SECURE to ⬢ service-2... done
Setting SERVICE_ONE_SECURE config vars and restarting ⬢ service-2... done, v3
```

As you can see, both services now share the same key

```bash
# List secret in service #2
> heroku config -a service-2 | grep SERVICE_ONE_SECURE_KEY 

SERVICE_ONE_SECURE_KEY: 3F6D463C2A79289DC5B3C13A4EB2736B0D51A80234CAEAF0EA12D15F12E9FDEE,CF8BBE474F57D9CA1DB402B2D19873E2F05ABED1213256FB761E166A2C8E6EBA
```

### Key rotation

In fact, key rotation is already enabled! [`securekey`](https://elements.heroku.com/addons/securekey) only has one plan, *Fortnightly*, so all we have to do is wait 2 weeks, and the key will be rotated for both services!




### Clean up

Clean up has to be done the reverse way. 

First in `service-2`

```bash
> heroku addons:remove securekey -a service-1 

Detaching SERVICE_ONE_SECURE to securekey-solid-14332 from ⬢ service-2... done
Unsetting SERVICE_ONE_SECURE config vars and restarting ⬢ service-2... done, v4
```

Then in `service-1`

```bash
> heroku addons:detach securekey-solid-14332 -a service-2
 ▸    WARNING: Destructive Action
 ▸    This command will affect the app service-1
 ▸    To proceed, type service-1 or re-run this command with
 ▸    --confirm service-1

> service-1
Destroying securekey-solid-14332 on ⬢ service-1... done
```

  ***Done!***

## *(Bonus) Graceful key rotation*

They key generated above is actually two keys, separated by a comma.

* **Latest** key: `3F6D463C2A79289DC5B3C13A4EB2736B0D51A...`
* **Previous** key: `CF8BBE474F57D9CA1DB402B2D19873E2F05...`

This can be used to smoothly transition between tokens. 

#### Example:

1. Client tries to connect to the server using the **Previous** key. 
2. Since the client has the **Previous** key, this means it has successfully authenticated before, and the server can instead return the **Latest** key.
3. This allows client to stay logged in, even while the secrets are being rotated

In my case, my two services are both inside Heroku and I can share the secret directly using the addon, and don't need graceful key rotation. 


## *Some notes*

* As far as I know, there is no way of triggering the secrets manually.
* I'm not sure if the secret update is triggered exactly at the same time when a secret is rotated. If uptime is very important, you might want to use graceful key rotation for between Heroku services as well
