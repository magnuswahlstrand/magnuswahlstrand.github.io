---
title: "How to protect yourself from workslop"
url: https://www.seangoedecke.com/how-to-protect-yourself-from-workslop/
author: Sean Goedecke
read: 2026-09-02
tags: ["ai", "sean-goedecke", "engineering"]
---

Covers the problem of large chunks of AI generated text (and code, I assume)
generated or sent by colleagues or bosses. It is easy to produce, but can take a
long time to parse, review and reason about. Sean calls this type of content
"Workslop".

> **Workslop** is when your colleagues or bosses communicate with you by pasting
> big chunks of AI-generated text.

I think this is a very interesting, new phenomenon that has emerged in the last
few years due to AI tools. I think Sean is usually quite pragmatic in his
approach to AI agents and to code generation in service of organisational and
product needs, so I'm a bit surprised that he seems to treat much of agent
generated work as workslop. I have (of course?) produced my share of "workslop"
myself. Some things we work on are simply not important enough to pay 100%
attention to. Some things that come to mind could include code that is
well-isolated, and can easily be replaced, or scripts that will only be used a
few times.

Anyway, Sean suggests a few different strategies for handling this type of
contributions:

- **Tell them off** – If you have enough leverage or power over the person, you
  can tell them to just stop doing it
- **Use the person as a high latency coding agent** – If the person just takes
  whatever you wrote to them, and pastes it into Claude, generates a PR, and asks
  you to review it, you could simply treat it as a very slow Claude session, e.g.
  inspect the changes on a high level and give feedback on that level.
- **Use AI to fight AI** – Use an agent of your own to review and comment on the
  changes.
- **Bias towards calls or in-person meetings**
- **Just ignore**

A few thoughts about the strategies:

- Many of these strategies were valid before AI agents. What if your colleague
  produced PRs that were too large? Or too tiny? Tests were lacking? Too many
  integration and too few unit tests? Same strategies worked before as well (with
  the exception of fight AI with AI).
- What are these strategies about?
  - **Protecting your own time** by ignoring, or slowing down production of work
    that takes your time.
  - **Making the cost of producing slop higher** (with meetings or slow
    turnaround time)
  - **Classifying how serious the contribution should be taken**. Is this just an
    idea that someone thought about, created a PR with Claude and didn't look at
    it themselves? Or did they actually think the change through?

Overall, I think that the ideal response, if possible, is to talk directly to
your colleague to see if you can agree to a common standard way of working. If
you can't persuade or coerce them, the best solution is probably to involve
management to see what the organisation's guidelines are or should be.
