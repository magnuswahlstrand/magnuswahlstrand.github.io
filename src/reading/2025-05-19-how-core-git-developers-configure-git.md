---
title: "How Core Git Developers Configure Git"
url: https://blog.gitbutler.com/how-git-core-devs-configure-git
author: Scott Chacon
read: 2025-05-19
tags: ["git", "tooling"]
---

Summarises the output of an event called "Spring Cleaning" where Git core team
members were challenged to remove their own git configuration and see how the
defaults work. The result is a short list of commands that the Git core team
developers think are most important to change from git's own defaults.

**Reflection:** I really like this kind of posts. TDLR at the top if you are
lazy, but technical and information dense for the connoisseur. Never heard of
Scott before, but this is a great read. I spend a considerable amount of time
improving my own dev setup (too much?), but sometimes I need a reminder that
there are even more things to tweak 🤔. Here are some of the recommendations that
I have already applied:

- `git config --global branch.sort -committerdate` - Sort branches by most recent
  commit date. I already had an alias for this, but it was 200 characters of git
  and awk intermingled 😵‍💫
- `git config --global diff.algorithm histogram` - Use the improved _histogram_
  over the default _myers_ algorithm for diffing. Much better at grouping changes
  in a way that makes sense to a human it seems.
- `git config --global help.autocorrect prompt` - Prompt for auto correct of
  incorrectly typed git commands.
- `git config --global push.autoSetupRemote true` - Automatically create upstream
  branch if missing, and avoid the classic error:
  `fatal: The current branch BRANCH has no upstream branch.`
