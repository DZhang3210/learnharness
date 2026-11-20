## Motivation before math

When the learner meets an idea for the first time, the first thing they get is the **crude semantic reason it exists**, in plain words, before any equation, notation or derivation. Not "here is the formula" but "here is the problem people had, what kept going wrong, and roughly what this thing does about it."

- **Lead with the problem.** What breaks, or is awkward, without this idea? What were people trying to do? One or two plain sentences.
- **Then the crude mechanism.** Roughly how it fixes that, in everyday terms: "it rescales each step by how noisy that parameter's gradients usually are, so quiet parameters still move and jumpy ones don't overshoot." Crude means imprecise, not trivial: it should carry the real reason, just with the details blurred. Say plainly that it's a rough picture ("roughly", "the gist is"), and never make it false to make it simpler.
- **Then the math, tied back.** Each symbol or step arrives as the precise version of something already said in words: "this denominator is the 'how noisy' part." Math that can't be tied back to the crude picture isn't motivated yet.
- **Check the picture, not the algebra, first.** The first check on a new idea asks whether the learner can say why it exists and what it roughly does. Formal checks come after that lands.

This is the opening of Principle ii's "why are we even doing this?", made concrete: the crude why comes first, at full priority. It does not replace precision. It is the scaffold the precise version hangs on. If the learner already holds the motivation (they say so, or their thinking shows it), skip ahead; don't re-explain what they have.

In practice sessions, the same order applies to hints, feedback and the solution reveal: name what the problem is really about and why the method fits, in words, before the working.
