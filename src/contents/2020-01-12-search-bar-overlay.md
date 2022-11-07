---
title: "Slack: Search bar"
slug: 2020-01-12-search-bar-overlay
datetime: 2020-01-12
tags: ["bootstrap", "javascript", "jquery", "web"]
---

I use Slack a lot in my day-to-day work, and I think the UI is excellent. One of the things I like the most is the quick navigation/search bar that makes navigation the channels effortless.

![Search overlay](/img/slack-clone/6_end_result.gif)

In this article I try to recreate the basic look and functionality of it using HTML, Bootstrap and jQuery. I will not focus on the backend part, but rather getting the right look and feel.

<!--more-->

## Overview

To recreate the search bar, we need three parts:

1. A semi-transparent gray overlay that covers the chat
2. An input field where the search terms is entered
3. An area below the input field where the result can be shown in real time

If you click on the gray overlay, or the x in the top right corner, both the overlay and search bar should disappear.
If we enter something into the input field, we will show a few dummy search results, without pressing enter.

## Implementation

It turns out that [Bootstrap](https://getbootstrap.com/) (opensource UI framework from Twitter) has done most of the work for us with their Modals.

Using the example code from [Modal: live-demo](https://getbootstrap.com/docs/4.4/components/modal/#live-demo) we can already get a nice popup with a button in the top right corner to close it, and a gray overlay that covers the background. All we need to do is to add some styling and handle searches

![Simple modal](/img/slack-clone/4_simple_modal.png)

### Styling

Here is the updated modal

```html
<!-- Modal -->
<div
  class="modal"
  id="search_modal"
  tabindex="-1"
  role="dialog"
  aria-hidden="true"
>
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <!-- Search icon -->
      <i class="fa fa-search search-icon" aria-hidden="true"></i>

      <!-- Close search modal button -->
      <i
        class="fa fa-times search-close"
        data-dismiss="modal"
        aria-hidden="true"
      ></i>

      <!-- Search input -->
      <input
        type="text"
        class="form-control pl-5 border-0"
        id="search_input"
        name="123e4567-e89b-12d3-a456-42665544000"
        placeholder="Search discussions and channels"
      />
    </div>
  </div>
</div>
```

_Styling:_

```html
<style>
  .search-close,
  .search-icon {
    margin: 0 6px 0 12px;
    padding: 10px;
    position: absolute;
  }

  .search-close {
    right: 0px;
    cursor: hand;
  }
</style>
```

---

A few highlights:

- Changed the modal class from `modal` to `modal-lg` to make it fill up more space. More info [here](https://getbootstrap.com/docs/4.0/components/modal/#optional-sizes).

- Added a magnifying glass icon from [FontAwesome](https://fontawesome.com/) to clarify that it is a search window

- Replaced the bootstrap `x` icon with the `x` from [FontAwesome](https://fontawesome.com/)

- I made both the magnifying glass and the close button use `position:absolute;` to float on top of the input field.

![Layout updated](/img/slack-clone/5_layout_updated.png)

### Search results

When a user starts typing in the search field, we should show some results. Add the following inside the modal

```html
<!-- Dummy search results -->
<div class="search_results">
  <ul class="list-group">
    <li class="list-group-item">Cras justo odio</li>
    <li class="list-group-item">Dapibus ac facilisis in</li>
    <li class="list-group-item">Morbi leo risus</li>
    <li class="list-group-item">Porta ac consectetur ac</li>
    <li class="list-group-item">Vestibulum at eros</li>
  </ul>
</div>
```

_Styling:_

```css
.search_results {
  border-top: 1px solid lightgray;
  display: none;
}
.search_results > label {
  padding: 20px 16px 0px 28px;
  font-size: 12px;
  color: gray;
}
.search_results > ul > li {
  border: 0px;
  padding-left: 28px;
  border-radius: 0;
}
.search_results > ul > li:hover {
  background-color: cornflowerblue;
  color: white;
  cursor: hand;
}
```

Using jQuery and some javascript, we can complete the solution.

```javascript
$(document).ready(function() {
  // Focus the search input whenever the modal is shown
  $("#search_modal").on("hidden.bs.modal", function(e) {
    $("#search_input").val("");
    $(".search_results").hide();
  });

  // Focus the search input whenever the modal is shown
  $("#search_modal").on("shown.bs.modal", function(e) {
    $("#search_input").focus();
  });

  // Show search results when the input field has some text in it
  // Hide it when it empty
  $("#search_input").keyup(function() {
    if ($(this).val() == "") {
      $(".search_results").hide();
    } else {
      $(".search_results").show();
    }
  });
});
```

That's it! Now we have the base a nice search bar.

![Search overlay](/img/slack-clone/6_end_result.gif)

### Improvements

Here are some further improvements

#### 1. Keyboard navigation

We could add keyboard navigation of search results, for example, pressing down arrow could highlight the first search result, and pressing enter would navigate us to that result.

#### 2. Shortcut to open search bar

Ideally we should have keyboard shortcut to open the search bar. Slack for example uses `cmd+K` on Mac. Could easily be added using one of the many jQuery plugins, for example [jeresig/jquery.hotkeys](https://github.com/jeresig/jquery.hotkeys)

#### 3. Actual search data

Of course, everything would be more fun with real data :-)
