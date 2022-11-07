---
title: "App shortcuts"
slug: 2019-10-13-app-shortcuts
datetime: 2019-10-13
tags: ["android", "mobile"]
---

This article covers how to create Android app shortcuts like the one below.

![Target](/img/app-shortcuts/target.png)

<!--more-->

## Setup

First, since this article will be using icons quite a bit, let's add a few vector graphics and replace the default Android app icon with our own.

* **New > Vector Asset > Clip Art >** Select the icon you want

I used 

* ic_app_icon.xml (from **fiber\_new** icon)
* ic_battery_shortcut.xml (from **battery\_unknown** icon)
* ic_widgets_shortcut.xml (from **widgets** icon)

Then we can change the app icon by updating the AndroidManifest

_**AndroidManifest.xml**_

```xml
<application
        ...
        android:icon="@drawable/ic_app_icon"
        android:roundIcon="@drawable/ic_app_icon"
        ...
        >
    ...
</application>
```

And create the text for the shortcuts

_**res/values/strings.xml**_

```xml
<resources>
    <string name="app_name">New App</string>
    <string name="charge_shortcut">Charge</string>
    <string name="widgets_shortcut">Widgets</string>
</resources>
```

## Creating the shortcuts

Once the setup is done, we can create the actual shortcuts. Add the following meta-data tag inside your _**AndroidManifest.xml**_, and create the corresponding **res/xml/shortcuts.xml** file.

```xml
...
<activity android:name=".MainActivity">
    ...
    <meta-data android:name="android.app.shortcuts"
        android:resource="@xml/shortcuts" />
    ...
</activity>
```

Notice that I add the `android:action` that will be used in the MainActivity.

_**res/xml/shortcuts.xml**_

```xml
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
    <shortcut
        android:shortcutId="show widgets"
        android:icon="@drawable/ic_widgets_shortcut"
        android:shortcutShortLabel="@string/widgets_shortcut">
        <intent
            android:action="cafe.gophers.myintenttutorial.ShowWidgets"
            android:targetPackage="cafe.gophers.myintenttutorial"
            android:targetClass="cafe.gophers.myintenttutorial.MainActivity"
            />
    </shortcut>

    <shortcut
        android:shortcutId="charge"
        android:icon="@drawable/ic_battery_shortcut"
        android:shortcutShortLabel="@string/charge_shortcut">
        <intent
            android:action="cafe.gophers.myintenttutorial.Charge"
            android:targetPackage="cafe.gophers.myintenttutorial"
            android:targetClass="cafe.gophers.myintenttutorial.MainActivity"
            />
    </shortcut>
</shortcuts>
```

Finally, we update the text in the app based on which action was clicked:

_**MainActivity.kt**_

```kotlin
package cafe.gophers.myintenttutorial

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {

    val CHARGE_BATTERY_ACTION = "cafe.gophers.myintenttutorial.Charge"
    val SHOW_WIDGETS_ACTION = "cafe.gophers.myintenttutorial.ShowWidgets"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Following code added
        val action: String? = intent?.action
        text_view.text = when (action) {
            CHARGE_BATTERY_ACTION -> "Charging battery"
            SHOW_WIDGETS_ACTION -> "Showing some widgets"
            else -> "Main app"
        }
    }
}
```

_**Note:** an alternative would be to use `intent?.data` and pass it in the shortcut using something like `android:data="content://cafe.gophers.myintenttutorial/?from=shortcut_charge"`_

## End result

Here is the end result. By clicking on the app icon, we come to the main activity with the default text, and if we press and hold we can click one of the shortcuts we have defined.

![End result](/img/app-shortcuts/complete.gif)

### Code

The code can be found [here](https://github.com/magnuswahlstrand/android-app-shortcuts).

### Links

* [Android: creating shortcuts](https://developer.android.com/guide/topics/ui/shortcuts/creating-shortcuts)
* [SO: How to add data to app shortcut Intent](https://stackoverflow.com/questions/42554349/how-to-add-data-to-app-shortcut-intent)
