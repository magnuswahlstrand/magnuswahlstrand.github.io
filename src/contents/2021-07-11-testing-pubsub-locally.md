---
title: "Running Google Pub/Sub locally"
slug: 2021-07-11-testing-pubsub-locally
datetime: 2021-07-11
tags: ["gcp", "pubsub", "go"]
--- 

I have recently started using Google's event queue "[**Cloud Pub/Sub**](https://cloud.google.com/pubsub)" for a few projects at work, and I enjoyed how straightforward it is to configure and use in production.  Their documentation is usually great, but often misses how to tie everything for your local environment. 

Here is a quick guide how I set up my integration test locally using the **Pub/Sub** emulator. Code examples are written in Go.   

<!--more-->

## Starting the emulator

To run the emulator, you first need the `gcloud` cli ([setup instructions](https://cloud.google.com/sdk/docs/install)). Next can we install the emulator.
```
gcloud components install pubsub-emulator
gcloud components update
```

Finally, we start the emulator on **localhost:8085**.  

```
gcloud beta emulators pubsub start --project=test-project
```

Output:
```
Executing: /Users/test/Downloads/google-cloud-sdk/platform/pubsub-emulator/bin/cloud-pubsub-emulator --host=localhost --port=8085
[pubsub] This is the Google Pub/Sub fake.
[pubsub] Implementation may be incomplete or differ from the real system.
....
```

## Code
We can use the Google Pub/Sub client to publish or subscribe on a topic.
```
go get -u cloud.google.com/go/pubsub
```

#### Setup the client
We need to point the `pubsub.Client` to our emulator. For this purpose, `pubsub.NewClient` uses a magic environment variable ```PUBSUB_EMULATOR_HOST```.
You can set it in a shell using `$(gcloud beta emulators pubsub env-init)`. For our test code, we use `os.Setenv`.

**Note**: If we don't set `PUBSUB_EMULATOR_HOST`, the client will default to an actual Google project. Be careful :-).

```go
// Initialize client
os.Setenv("PUBSUB_EMULATOR_HOST", "localhost:8085")
client, err := pubsub.NewClient(ctx, "test-project")
...

#### Receive message 

#### Receive message
// Create topic
topic, err := client.CreateTopic(ctx, "some-topic")
...
```

#### Receive message 

Now that we have a topic, we could publish a message. However, we don't have any subscriptions yet, and so the published message would be discared.

* Push - **Pub/Sub** is responsible for pushing any incoming messages on a topic to a specific endpoint in the service
* Pull - Service is responsible for setting up a connection to a **Pub/Sub** topic, and waits for incoming messages. 

##### Creating a pull subscription
```go
sub, err := client.CreateSubscription(ctx, "some-subscription-id", pubsub.SubscriptionConfig{
    Topic: topic,
})

// Wrap context for cancellation, and cancel the first
cctx, cancel := context.WithCancel(ctx)

// Receive will block until the context is cancelled, or we get a non-recoverable error
err = sub.Receive(cctx, func(_ context.Context, m *pubsub.Message) {
    m.Ack()
    cancel() // for test purpose, shut down after first message 
})
```
**Note**: If we don't receive a message for some reason, the `Receive` call will be stuck forever. I will fix this in the full test code example.

##### Creating a push subscription

For the push example, we need a endpoint that can receive and decode the PubSub message. 
```go
func pubSubHandler(w http.ResponseWriter, r *http.Request) {
	var event pubSubMessage

	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Do something with event
	// ...
}
```
Then all we need to do is to add  `pubsub.PushConfig` with our endpoint, when we configure create a subscription.
```go
_, err = client.CreateSubscription(ctx, "some-subscription-id-2", pubsub.SubscriptionConfig{
    Topic: topic,
    PushConfig: pubsub.PushConfig{
        Endpoint: "localhost:8080/pubsub/event",
    },
})
```

#### Publishing a message

Finally, we can publish a message to **Pub/Sub**. Keep in mind that `Publish` is asynchronous, and you should use `res.Get` afterwards if the result is important.  
```go
res := topic.Publish(ctx, &pubsub.Message{
    Data: []byte("hello test"),
})

// Wait for result, if you care about it :-) 
messageID, err = res.Get(ctx)
...
```


## Summary

In this guide I showed how to do the following:
1. Start the **Pub/Sub** emulator
1. Configure the Go client
2. Create topics
3. Create *pull* and *push* subscriptions
5. Publish and receive events

If you are interested in the full code I have included two testcases below.

## Appendix: Complete test code

```go
package main

import (
	"cloud.google.com/go/pubsub"
	"context"
	"encoding/json"
	"github.com/google/uuid"
	"github.com/magnuswahlstrand/gcp-examples/pubsub/common"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"
)

// Test 1: Pull subscription
func TestSendWithPull(t *testing.T) {
	topicID := "topic-" + uuid.New().String()
	subscriptionID := "sub-" + uuid.New().String()

	ctx := context.Background()

	os.Setenv("PUBSUB_EMULATOR_HOST", "localhost:8085")
	client, err := pubsub.NewClient(ctx, "fake-project")
	require.NoError(t, err)

	topic, err := client.CreateTopic(ctx, topicID)
	require.NoError(t, err)

	sub, err := client.CreateSubscription(ctx, subscriptionID, pubsub.SubscriptionConfig{
		Topic: topic,
	})
	require.NoError(t, err)

	// Act: publish message
	res := topic.Publish(ctx, &pubsub.Message{
		Data: []byte("hello test"),
	})

	_, err = res.Get(ctx)
	require.NoError(t, err)

	cctx, cancel := context.WithCancel(ctx)
	okCh := make(chan string)

	go func() {
		// Use a callback to receive messages via subscription.
		// Receive will block until the context is cancelled, or we get a non-recoverable error
		err = sub.Receive(cctx, func(_ context.Context, m *pubsub.Message) {
			m.Ack()
			okCh <- string(m.Data)
			cancel()
		})
	}()

	select {
	case msg := <-okCh:
		require.Equal(t, "hello test", msg)
	case <-time.After(300 * time.Millisecond):
		require.Fail(t, "did not receive message within deadline")
		cancel()
	}
}

// Test 2: Push subscription
func TestSendWithPush(t *testing.T) {
	topicID := "topic-" + uuid.New().String()[0:8]
	subscriptionID := "sub-" + uuid.New().String()[0:8]

	okCh := make(chan string)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var event pubSubMessage

		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		okCh <- string(event.Message.Data)
	}))

	ctx := context.Background()

	os.Setenv("PUBSUB_EMULATOR_HOST", "localhost:8085")
	client, err := pubsub.NewClient(ctx, "fake-project")
	require.NoError(t, err)

	topic, err := client.CreateTopic(ctx, topicID)
	require.NoError(t, err)

	_, err = client.CreateSubscription(ctx, subscriptionID, pubsub.SubscriptionConfig{
		Topic: topic,
		PushConfig: pubsub.PushConfig{
			Endpoint: server.URL,
		},
	})
	require.NoError(t, err)

	// Act: publish message
	_ = topic.Publish(ctx, &pubsub.Message{
		Data: []byte("hello test"),
	})

	select {
	case msg := <-okCh:
		require.Equal(t, "hello test", msg)
	case <-time.After(500 * time.Millisecond):
		require.Fail(t, "did not receive message within deadline")
	}
}
```


## Resources
* [Installing Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
* [Testing apps locally with the emulator](https://cloud.google.com/pubsub/docs/emulator)
