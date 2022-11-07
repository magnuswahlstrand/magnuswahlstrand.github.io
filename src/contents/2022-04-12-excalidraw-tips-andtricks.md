---
title: Excalidraw 
subtitle: Tips and tricks
slug: 2022-04-12-excalidraw-tips-andtricks
datetime: 2022-04-12 
tags: ["excalidraw", "architecture", "tools"]
---

Communication in a "mostly remote" workplace can be difficult. Lucky for us, there are new tools that can help us collaborate and share knowledge online!

A tool that I have used and enjoyed the last few years is [Excalidraw](https://excalidraw.com/). Description from their homepage:

> Virtual whiteboard for sketching hand-drawn like diagrams.
Collaborative and end-to-end encrypted.

In this post I will go through a few of Exalidraw's features that are useful and great.

## Table of contents

<!--more-->
## Basics

First, Excalidraw can draw most of the basic shapes you expect from a white boarding-tool.

![Basics](/img/excalidraw/basics.gif)

Each tool has a keyboard shortcut from 0-9, and most of them also have a letter. Below is the complete list.

* `1` or `V` - Selection     
* `2` or `R` - **R**ectangle 
* `3` or `D` - **D**iamond   
* `4` or `O` - Ellipsis      
* `5` or `A` - **A**rrow     
* `6` or `L` - **L**ine      
* `7` or `X` - Draw          
* `8` or `T` - **T**ext      
* `9`        - Image         
* `0`        - Library       

<br><br>

### Duplicate Command
**Keyboard shortcut:** `cmd`+`D` **or** `opt`+`drag` 
                  
Sometimes, you have created a really nice shape, and want more of it. Best way to do this is to either duplicate with `cmd`+`D`. If you have a specific place in mind for the duplicate, use `opt`+`drag`.

![Duplicate](/img/excalidraw/duplicate.gif)

<br><br>

### Copy to clipboard as PNG
**Keyboard shortcut:** `shift` + `opt` + `C`/`V`

Another useful feature for quick discussions is to create `png` images from a selection. 

![Copy to clipboard](/img/excalidraw/copy_to_clipboard.gif)

Now I have the images as a PNG and can paste in to a Slack message, or e-mail, without having to take a screenshot. **Resulting PNG:**

![result](/img/excalidraw/copied.png)

<br><br>

### Set background color
**Keyboard shortcut:** `G` `[code]`

We can change background color by bringing up the color picker with `g`, and then choosing color.

![Change color](/img/excalidraw/change_color.gif)

<br><br>

I often use these colors:

| `[code]` |                                                                                                         | Color       | RGB      |
|----------|---------------------------------------------------------------------------------------------------------|-------------|----------|
| 0        | <div style="width:1.3em;height:1.3em;background: rgba(255, 0, 0, .0); float: left; border: 1px solid black;"></div> | Transparent |          |
| 1        | <div style="width:1.3em;height:1.3em;background: #ced4da; float: left; border: 1px solid black;"></div> | Light Gray  | #ced4da  |
| 2        | <div style="width:1.3em;height:1.3em;background: #868e96; float: left; border: 1px solid black;"></div> | Dark Gray   | #868e96  |
| 3        | <div style="width:1.3em;height:1.3em;background: #fa5252; float: left; border: 1px solid black;"></div> | Red         | #fa5252  |
| E        | <div style="width:1.3em;height:1.3em;background: #4863ec; float: left; border: 1px solid black;"></div> | Blue        | #4863ec  |
| D        | <div style="width:1.3em;height:1.3em;background: #92c744; float: left; border: 1px solid black;"></div> | Green       | #92c744  |


<br><br>

### Copy/paste styles
**Keyboard shortcut:** `shift` + `opt` + `C`

![Copy style](/img/excalidraw/copy_style.gif)

### Curved and straight arrows
We can do curved lines, by pressing `A` and then clicking as many times as we want. If we want straight lines, press `A`, and then drag from start to finish.

**Keyboard shortcut (curved):** `A` `click` `click` `click`

**Keyboard shortcut (straight):** `A` `drag`

![Eraser](/img/excalidraw/lines.gif)

<br><br>

### Graphs(!)
While writing this post, I found out that you can do graphs in Excalidraw! Only documentation I found is on their blog: ["Tell your story story with charts"](https://blog.excalidraw.com/tell-your-story-with-charts/).

**Keyboard shortcut:** (with csv copied) `cmd`+`V`

To create a chart:
1. copy any two column CSV or table data, for example the table below, and 
2. paste it into Excalidraw.

| Month | Users |
|-------|-------|
| Jan   | 10    |
| Feb   | 5     |
| March | 7     |
| April | 15    |
| May   | 23    |

**Result:**

![Eraser](/img/excalidraw/graph.gif)

<br><br>

### Eraser
**Keyboard shortcut:** `E`

And, of course, the most useful feature of them all. `E` for the eraser!

![Eraser](/img/excalidraw/eraser.gif)

## Conclusion
That's all. Happy diagramming!

## Resources
* The Excalidraw tool itself: [excalidraw.com](https://excalidraw.com/)
* The Excalidraw [blog](https://blog.excalidraw.com/)

<br><br>

## Bonus: *features I don't use at all*

* **Draw tool (`X`)** - I prefer not to free hand anything...
* **Flip horizontal/vertical (`shift`+`H`/`V`)** - Does almost _nothing_ to rectangles, diamonds, ellipses. Does _exactly_ nothing to texts and library objects.
* **Add link to selected shape (`cmd` + `K`)** - Adds a web link to a shape. Might be useful?
* **Set stroke color (`S` `[code]`)** - Not very useful, since stroke should always be black.

If someone finds a good use case for these features, please tell me at [@wahlstra](https://twitter.com/wahlstra).
