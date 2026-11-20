# Topic tracker

A Topics page in the sidebar listing every study topic with its status:

- **Not started**: no session yet.
- **Taught**: a Teach session exists for it.
- **Practised**: a Practice session exists for it.
- **Already known**: you ticked "Already know it", so it's skipped when picking what's next.

**Teach** and **Practice** open a new session draft with the topic filled in
("Teach me: RoPE", "Practice: RoPE"). Nothing is sent until you press send. A session
counts for a topic when its title starts with that text, so a session you start by hand
counts too if you type it the same way.

The top cards suggest the next new topic (in the list's order, foundations first),
taught topics ready to practise (oldest first), and practised topics with no session in
two weeks. The topic list lives in `src/topics.cjs`. Ticked choices are saved in the
plugin's data folder. It makes no model calls.
