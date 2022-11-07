---
title: "2D animation: Screen shake"
subtitle: Code examples in Go + Ebiten
slug: 2019-04-29-screen-shake
datetime: 2019-04-29
tags: ["go", "ebiten", "animation", "2d graphics", "gamedev"]
---

A good way of improving the feel of a game is to add screen shake, when a player gets hit or when something heavy lands on the ground. I have implemented two ways of doing this, one _simple_ and one _nice_. The end result will look something like this

![End result](/img/screenshake/shake.gif)

<!--more-->

## Screen shake?

First, let's cover the question: _what is screen shake?_. The typical screen shake is created by adding an offset for what is draw on the screen in on the horizontal(x) and vertical(y) axes. The amount of offset (amplitude) usually decreases over time, in the example below I use [linear interpolation](https://en.wikipedia.org/wiki/Linear_interpolation) (lerp) from 20 to 0.

```go
// Simple offset
amplitude := 20 * gfx.Lerp(1, 0, t)
dx := amplitude * (2*rand.Float64() - 1)
dy := amplitude * (2*rand.Float64() - 1)
```

Let us use this code in full example.

## Simple screen shake

The trick is to first draw our content on a temporary image (canvas), and then draw that image to the screen, with an offset. `scene1` is an `*ebiten.Image` (see setup in my post about [2D transitions](/post/2019-04-28-2d-transitions/#setup)).

```go
func simpleScreenShake(screen *ebiten.Image) {
   // Draw scene onto tmpScreen
   tmpScreen.DrawImage(scene1, &ebiten.DrawImageOptions{})

   // Draw tmpScreen on an offset (screen shake) applied, stop when t > 0
   maxAmplitude := 10.0
   op := &ebiten.DrawImageOptions{}
   if t < 1 {
      amplitude := maxAmplitude * gfx.Lerp(1, 0, t)
      dx := amplitude * (2*rand.Float64() - 1)
      dy := amplitude * (2*rand.Float64() - 1)
      op.GeoM.Translate(dx, dy)
   }
   screen.DrawImage(tmpScreen, op)
}
```

This function is called from the main game loop.

```go
func update(screen *ebiten.Image) error {
   simpleScreenShake(screen, t)
   t += 1 / 60.0
   return nil
}
```

![End result](/img/screenshake/shake.gif)

Easy! Let's make it more complicated.
_Code for the easy shake is [here](https://github.com/magnuswahlstrand/animex/blob/basic-shake/screenshake/main.go)_.

## Nice\(r) screen shake

As you see above, we get a black border around the image when we shake. While it is not terrible, we can do better! What we want to do is something like the image below, i.e. draw **more** to the temp image than we will draw to the screen. Then we can draw the content of the red rectangle onto the screen.

```go
func main() {
   ...
   // Create a screent hat is larger than our actual screen
   biggerTmpScreen, err = ebiten.NewImage(screenWidth+40, screenHeight+40, ebiten.FilterDefault)
   if err != nil {
      log.Fatal(err)
   }
   ...
}
```

```go
func nicerScreenShake(screen *ebiten.Image, t float64) {
   // Draw scene onto tmpScreen
   biggerTmpScreen.DrawImage(scene1, &ebiten.DrawImageOptions{})

   // Draw tmpScreen on an offset (screen shake) applied
   op := &ebiten.DrawImageOptions{}
   op.GeoM.Translate(-padding, -padding)
   if t < 1 {
      amplitude := maxAmplitude * gfx.Lerp(1, 0, t)
      dx := amplitude * (2*rand.Float64() - 1)
      dy := amplitude * (2*rand.Float64() - 1)
      op.GeoM.Translate(-dx, -dy)
   }

   screen.DrawImage(biggerTmpScreen, op)
}
```

This function is called from the main game loop.

```go
func update(screen *ebiten.Image) error {
   nicerScreenShake(screen, t) // Previously simpleScreenShake(screen, t)
   t += 1 / 60.0
   return nil
}
```

![End result](/img/screenshake/shake-rectangle.gif)

_Code for the nicer shake is [here](https://github.com/magnuswahlstrand/animex/blob/nicer-shake/screenshake/main.go)_.
