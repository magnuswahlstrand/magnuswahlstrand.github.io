---
title: "Push Notifications pt.2"
subtitle: Creating in-app notifications
slug: 2019-10-06-notifications
datetime: 2019-10-06
tags: ["android", "push notifications", "notifications", "mobile", "fcm"]
---

In [Part 1](./2019-10-05-push-notifications) we learned how to send push notifications
from [Firebase Cloud Messaging console](https://console.firebase.google.com). There are a number of improvements we can
make:

- [Show notification when the app in in the foreground](#show-notification-in-foregrounded-app)
- [Go to a specific view in the app when clicked](#go-to-specific-view)
- Buttons directly in the notifications
- Keep the notification open while the app is open

Let's get started!

<!--more-->

## Show notification in foregrounded app

_First of all, the documentation for Android notifications is great. Here are a few useful links:_

- [Notification overview](https://developer.android.com/guide/topics/ui/notifiers/notifications)
- [Create a notification](https://developer.android.com/training/notify-user/build-notification)
- [Notification anatomy](https://developer.android.com/guide/topics/ui/notifiers/notifications#Templates)

### Creating a notification channel

From Android API level 26, all notifications need to be assigned to a `notification channel`. The reason for this is
that the user can control notifications per channel for an app. In my app below you could disable notifications about
Taxis, while keeping the one for E-mails.


<div class="flex flex-row h-96 w-full">
<img src="/img/push-notifications/2_notification_channel_1-thumb.jpg" />
<img src="/img/push-notifications/2_notification_channel_2-thumb.jpg" />
<img src="/img/push-notifications/2_notification_channel_3-thumb.jpg" />
</div>

This code will only be called for API level 26 and above.

```kotlin
class MainActivity : AppCompatActivity() {

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channelID = "Some channel ID"
            val channelName = "E-mail"
            val channelDescription = "Information about e-mail"
            val channel = NotificationChannel(channelID, channelName, importance).apply {
                description = channelDescription
            }

            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        createNotificationChannel()

        // We will create the notification here next
        ...
    }
}
```

More info here: [Android: notification channels](https://developer.android.com/training/notify-user/channels).

### Creating a notification

Now we can create a notification that is shown when the user opens the app

```kotlin
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        createNotificationChannel()

        sendNotification()
    }

    private fun sendNotification() {
        // Note: if Android API level is less than 26, the channelID will be ignored
        val notificationBuilder = NotificationCompat.Builder(this, channelID)
            .setContentTitle("Hello Notification! \uD83D\uDC7B")
            .setContentText("This is the notification text \uD83D\uDC4F")
            .setSmallIcon(R.drawable.ic_launcher_foreground)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(1, notificationBuilder.build())
    }
```

Now if we build the app:

![Successful push](/img/push-notifications/2_notifications.jpg)

#### (Optional) Add a button that will trigger the notification

**activity_main.xml**

```xml

<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
                                                   xmlns:app="http://schemas.android.com/apk/res-auto"
                                                   xmlns:tools="http://schemas.android.com/tools"
                                                   android:layout_width="match_parent"
                                                   android:layout_height="match_parent"
                                                   tools:context=".MainActivity">

    <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Hello World!"
            app:layout_constraintBottom_toTopOf="@+id/notify_button"
            app:layout_constraintLeft_toLeftOf="parent"
            app:layout_constraintRight_toRightOf="parent"
            app:layout_constraintTop_toTopOf="parent"/>

    <!-- Added -->
    <Button
            android:id="@+id/notify_button"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginBottom="280dp"
            android:text="Notify!"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="parent"/>

</androidx.constraintlayout.widget.ConstraintLayout>
```

**ActivityMain.kt**

```kotlin
    override fun onCreate(savedInstanceState: Bundle?) {
        ...
        notify_button.setOnClickListener {
            sendNotification()
        }
    }
```

### Code

_The code for the push notification is foreground mode
is [here](https://github.com/magnuswahlstrand/android-push-notifications/tree/foreground-mode)._

## Go to specific view

When the user clicks on a notification, the app will open with the main activity active. In many cases we want to go an
activity that is related to the notification itself. For example, if we get a notification that our taxi has arrived, we
could open a screen with that particular ride. We do this by passing an intent to the notification (more
information [here](https://developer.android.com/training/notify-user/build-notification.html#click)).

1. Create a new Activity (**File > New > Activity > Empty Activity**). For example, **DetailsActivity**
2. Create an `Intent` and add it to the notificationBuilder

```kotlin
    private fun sendNotification() {
        val intent = Intent(this, DetailsActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent: PendingIntent = PendingIntent.getActivity(this, 0, intent, 0)


        // Note: if Android API level is less than 26, the channelID will be ignored
        val notificationBuilder = NotificationCompat.Builder(this, channelID)
            ...
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(1, notificationBuilder.build())
    }
```

Set `setAutoCancel(true)` will make sure that the notification disappears when the user clicks it.
Here is the result.

![Go to specific view](/img/push-notifications/2_specific_view.gif)

### Code

_The code to go to a specific view
is [here](https://github.com/magnuswahlstrand/android-push-notifications/tree/goto-view)._
