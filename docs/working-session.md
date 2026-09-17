# The Next Big Idea — BoldDesk Submission
## Full working session transcript

*Talia Frazier · September 17, 2026*

---

## Turn 1 — Talia

*(Attached: three images from the "The Next Big Idea" campaign flyer — "THE NEXT BIG IDEA" header, "Six Places To Look" categories, and "How It Works" rules.)*

I want to enter BoldDesk in this but I have some ideas I want to put together with you

---

## Turn 1 — Claude

Before anything else, the framing line on that flyer is the thing to design around: "Think bigger than a process fix." A migration from shared Outlook mailboxes to BoldDesk, described as such, is going to read to reviewers as exactly the process fix they're steering people away from — even though it's a big lift and you know how much it's changing.

So the move is to submit what BoldDesk *makes possible* rather than the rollout itself. The rollout is the infrastructure; the Big Idea is what gets built on top of it. Three angles that clear that bar:

**Client-facing SLA visibility (New Customer Experiences, maybe New Products or Services).** This is the strongest one, and it's Cindy's group. Her team is fielding loan servicing email for five correspondent clients with no shared inbox and SLA tracking done by hand. Once that's in BoldDesk with per-organization routing and Request Type categorization, Northpointe can actually measure response and resolution time per client — and then report it to them, or eventually give them a portal. That's not internal ops. That's a service level you can put in front of a correspondent partner as a reason to work with Northpointe instead of someone else. "Who we serve" and "what we offer," both.

**Nora on the ticket corpus (AI & Emerging Technology).** You already have the agent. What you didn't have until now was structured, centralized ticket data to point it at. Auto-triage, auto-categorization, suggested first responses, deflection on repeat questions. The category is sitting right there on the flyer and most submissions in it are going to be vague "we should use AI" ideas — yours would have a working agent and a real data source behind it.

**One front door (Operational Innovations).** Safest, least differentiated. Only worth submitting if you can frame it around what it unlocks — cross-department visibility into where work actually piles up — rather than around the consolidation.

One tactical note from the rules: one idea per submission, no cap on how many you send, and strong submissions each get a raffle entry. So these aren't competing — send them separately.

What were you thinking? If your angle is different from these I'd rather build on yours.

---

## Turn 2 — Talia

*(Attached: three images of the submission form — "Built For What's Next" with name/email/idea name fields, the "Who would benefit" and "Which area best describes your idea" dropdowns, and the supporting-documentation upload box.)*

This is the form, but I want to go above and beyond with a presentation

---

## Turn 2 — Claude

Good — the form is actually more forgiving than the flyer suggested. "Your idea does not need to be fully developed" plus an optional supporting-docs upload means a tight deck will stand out sharply against submissions that are three sentences in a text box.

Two things before I build it.

First, which idea. The form is one idea per submission, so the deck should carry one — trying to cover all three will dilute it. My recommendation is still the Client Account Management angle, because it's the only one of the three where you can honestly tick **Customers** and **Business partners** on the "who benefits" dropdown rather than just Employees, and because you have real specifics behind it: five named correspondent clients, a team tracking SLAs by hand today, and a system already configured with per-organization routing. The other two are good ideas but they read as internal.

Second, format. Your default is a branded PDF, which uploads to that drop zone cleanly and won't have font substitution problems on a reviewer's machine. A .pptx is the other option if you think someone might present it live or want to edit it.

Whichever way you go, I'll need the Northpointe logo PNGs re-uploaded — the Primary horizontal lockup and the Emblem Only mark, white and navy variants. And note the deck should be Northpointe navy and light blue, not BoldDesk's palette; this is a Northpointe idea that happens to run on BoldDesk, and the visual should say that.

*(Asked two questions: which idea the deck should make the case for, and what format to upload.)*

---

## Turn 3 — Talia

*(Answered: no format preference.)*

---

## Turn 3 — Claude

Branded PDF it is — that's your usual output, it'll render identically on whoever's screen reviews it, and it drops straight into that upload box.

That leaves the one thing I can't pick for you. You mentioned at the start that you had ideas of your own you wanted to work through, and you haven't told me those yet — I'd rather build around your angle than my guess at it. If you're not attached to one, I'll take the Client Account Management case and run.

Send whichever of these you have handy when you reply:

- Your own idea, even half-formed — a sentence is enough for me to work with
- The Northpointe logo PNGs (Primary lockup and Emblem Only, white and navy)

One thing worth deciding while you think about it: whether the deck names Cindy's team and the five clients outright, or keeps it generic. Naming them makes the case concrete and shows this is already running rather than hypothetical, which is exactly what will separate your submission from the pile. The tradeoff is that it puts a live internal pilot in front of whoever reviews these, before Phil has chosen how he wants visibility into that work. Your call on whether that's a problem — you know how that group's information travels better than I do.

---

## Turn 4 — Talia

I want to use a tool kind of like HeyGen, but I want to use Nora as the presenter. And I know with HeyGen, it doesn't always work the best with cartoon characters. So there might be a better platform, but basically I want to make a little video that has Nora explain all the benefits of Bold Desk and having a enterprise help desk and how many teams have struggled with organization, tracking, SLAs, searching within Outlook, and things like that, and how Bold Desk can help that.

---

## Turn 4 — Claude

You're right about HeyGen — its strength is a library of ready-made corporate avatars with brand-approved business looks, which is exactly the wrong shape for a custom cartoon character. You'd be fighting the tool.

**Hedra is the one you want.** It was built for precisely this case: unlike talking-head tools that work only with photographic faces, it handles illustrated characters, cartoon faces, and stylised artwork with equal effectiveness. You supply the character — a photo, an illustrated mascot, a stylized AI portrait — and it animates any of it. That single design decision is what makes it different. The Character-3 model processes image and audio simultaneously, which is what produces phoneme-aligned lip-sync rather than generic mouth movement, and it generates micro-expressions — blinks, small head tilts — that keep it from looking like a puppet.

Practical notes before you commit:

- Character-3 caps at 720p, where HeyGen and Synthesia do 1080p+. Fine for an embedded submission video, worth knowing.
- Non-frontal images produce inconsistent gaze and reduced expressiveness — so pick a Nora image that's straight-on with a clearly defined face. Your Nora assets live in Azure Blob behind container SAS tokens that don't render in a browser, so you'll need to pull one down properly rather than pasting a URL.
- Free tier is around 400 credits a month, roughly 6–7 minutes of video; paid starts near $10. Enough to do this without a purchase request.
- It's head-and-shoulders only — no full-body motion, which is fine for a presenter format.
- Pair it with ElevenLabs for the voice rather than the built-in TTS if you want Nora to have a consistent voice you can reuse later. Hedra supports ElevenLabs voice input directly.

One thing worth naming: using Nora as the presenter is a stronger move than you may be treating it as. It quietly demonstrates that Northpointe already has a working AI agent, which is the single hardest thing to convey in a text box. The video stops being a video *about* an idea and becomes evidence for the AI & Emerging Technology category at the same time. I'd lean into that — have Nora introduce herself as something IT already built and runs, not as a generic narrator.

Two things to check on your end: whether that upload box takes video files at all (you may need to host it and drop a link in the optional field instead), and whether pushing Northpointe brand assets through an unvetted SaaS tool needs a nod from Patti's side first. The script content is generic enough that I doubt it's an issue, but you'd know better than I would.

Want me to write the script? If so, tell me the target length — 60 seconds is about 150 words and is the right size for something a reviewer will actually watch to the end. I'd build it around the Outlook pain you named: the buried request, the SLA nobody can prove, the handoff when someone's out.

---

## Turn 5 — Talia

Yeah, so I want the video to start as Nora talking and saying like, hi, I'm Nora, you might know me as your friendly IT help desk assistant. Um, but if you haven't, if I hadn't had a chance to meet you, uh, it's nice to meet you. And then say, Talia and I have been working on a great new project that will really help North Point overall. And the idea is an enterprise support platform. And the application we decided to go forward with is Bold Desk. And then there should be a section of why Bold Desk? And say unlike other ticketing systems that might be used by an IT team, Bold Desk is super simple. Very user friendly for both customers and agents that are not tech savvy. The simplicity and the aesthetic of the portal creates a great experience for both teams and their customers. While we haven't been at North Point for very long, we have seen a common trend across the various teams. And that is lack of organization, tracking, and communication. Or I guess say Bold Desk would provide better and faster communication. It does not seem that SLAs are standardized across teams, resulting in unhappy customers, whether those customers are internal North Point employees or our external customers. We all have the same goal, regardless of our role, and that is to provide the best experience for our customers, whether that is another company, a borrower, or a retail banking customer. We all play a part. Sometimes that means that our customers for us, our internal North Point employees, which then directly impacts their ability to help those external customers. So whether you work with the public or not, you still directly impact our customers' experience. So when we have frustrations, we have to remember that it's all of us against the problem and not against each other. How Bold Desk can play a role is that we can provide that better experience and communication across teams and to our customers directly.

---

## Turn 5 — Claude

Here's a clean pass. I kept your structure and your lines where they were already working — the ending in particular, which is the strongest thing in the dictation.

> Hi, I'm Nora. You might know me as your friendly IT help desk assistant. And if we haven't met yet — it's nice to meet you.
>
> Talia and I have been working on something we think could help Northpointe overall. The idea is an enterprise support platform. Not just for IT — for any team that answers requests. And the application we've chosen to move forward with is BoldDesk.
>
> *[title card: Why BoldDesk?]*
>
> Most ticketing systems are built for IT people, by IT people. BoldDesk isn't. It's genuinely simple, and friendly for agents and customers alike — whether or not they think of themselves as technical. The portal is clean and it looks good. That matters more than it sounds. A tool people don't mind using is a tool people actually use.
>
> Here's what we've been seeing. Across dozens of conversations with teams all over the bank, the same pattern keeps surfacing. Requests living in shared Outlook mailboxes. Hard to search. Hard to hand off when someone's out. And nearly impossible to prove you answered on time. Service levels aren't standardized, so every team defines "fast" a little differently — and customers feel that difference.
>
> And here's the thing. Every one of us serves a customer. Sometimes that's another company. Sometimes a borrower. Sometimes a retail banking customer. And sometimes our customer is another Northpointe employee — which shapes how well they can serve theirs. So whether or not you work with the public, you affect our customers' experience.
>
> That's worth remembering when things get frustrating. It's all of us against the problem — not against each other.
>
> BoldDesk gives us a shared way to work that problem. Better tracking, faster communication, and one clear front door. Across teams, and out to the people we serve.

That runs about 2 minutes at a natural pace. Longer than the 60 seconds I floated, but I think it earns the time — and Character-3 handles multi-minute audio fine. If you want a 60-second cut, the section to lose is the "why BoldDesk" paragraph; the pain and the "all of us against the problem" close are what actually land.

Three changes I made deliberately, so you can put them back if you disagree:

**I cut "while we haven't been at Northpointe very long."** Going to leadership, tenure reads as a disclaimer on your own observation. What actually backs up the claim is the volume of discovery you've done — dozens of mailboxes, demos and second looks across accounting, compliance, servicing, sales, capital markets. That's the credential, so I used it instead.

**I turned "lack of organization, tracking, and communication" into a description of symptoms rather than a verdict.** You self-corrected toward this mid-dictation and I think your instinct was right. If this video travels past the reviewers, the teams hearing it are the same ones you still need to bring along, and some are already hesitant. Naming the Outlook problem lands; naming teams as disorganized invites defensiveness.

**I left your ending almost untouched.** It's the best writing in the piece and it's the part a reviewer will remember.

For production: keep "Why BoldDesk?" as an on-screen card rather than having Nora read a header out loud — spoken headers break the illusion fast. And when you generate the voice, check how ElevenLabs handles "BoldDesk" as one word; if it splits it oddly, spelling it "Bolddesk" in the input usually fixes the stress without changing what you hear.

---

## Turn 6 — Talia

One positive to note, especially for Bolddesk, is that it creates a seamless experience for our customers. So by transitioning our support boxes that are currently using Outlook to Bolddesk, it allows the teams to work on these emails as tickets and creates better visibility for teams and keeps teams accountable for meeting SLAs, which then result in happier customers due to better and faster communication. But then by switching to this platform, it does not require any change on the user's part. So they can continue to email and keep their experience easy while we are changing and growing. Some teams may not like the switch at first because change is hard. Change is always hard in some way, but typically it either results in a more positive experience down the road, or it is a learning experience, even if it doesn't go as planned. So it's always great to have an open mind and give things a try. Just like the first time you went on an airplane or did any type of new experience, it's something you haven't done before and it may be scary, but then it leads to a positive experience down the road.

---

## Turn 6 — Claude

That first point is the strongest thing you've given me yet, and it should go in. It's the one that answers the objection you've already been hearing — that switching means the email box goes away and the work gets harder. "Nothing changes for the person emailing you" defuses that in one line, and it's the kind of detail that makes a reviewer believe you've actually thought it through.

*(Full script returned with a new section added:)*

> *[title card: Nothing changes for your customer]*
>
> Here's the part I like best. When a team's support mailbox moves to BoldDesk, the person on the other end doesn't have to do anything differently. They send the same email to the same address, exactly like they always have. Behind the scenes, that email becomes a ticket — tracked, visible to the whole team, measured against a real service level. So the experience stays effortless for them, while we get organized underneath. We grow, and they never feel the seams.

The change-is-hard section I'd leave out of this one, and I want to be straight about why rather than just dropping it.

It's aimed at a different audience. Everything else in this script is pitched at leadership deciding whether an idea is worth exploring. "Change is hard, please give it a try" is pitched at the teams being migrated. Mixing them weakens both, and in a submission it does something you don't want: it signals that the idea is contested before anyone's raised an objection. The line about it being "a learning experience even if it doesn't go as planned" is the risky one — you don't want a reviewer hearing "this might not work" from the person pitching it.

But the section itself is good, and the airplane framing is the kind of thing people actually remember. It belongs in front of the teams, not the reviewers. You've got a natural home for it: the broader all-user launch meeting BoldDesk is planning, or the front of the deferred training sessions you're following up on the week of the 22nd. Same Nora, same voice, 45 seconds, opening a training instead of closing a pitch. If you want, I'll write that one as a companion piece — it'd also mean the Nora presenter format is something you've used twice, which makes it read as a real capability rather than a one-off for a contest.

---

## Turn 7 — Talia

And while not all change creates a positive experience, the same it will for others, it may be a great learning opportunity. And then maybe in this slide, it's something funny like a girl getting bangs and on one person it looks really great, good, another person it looks really bad. And then it shows the person that has the bad bangs remembering that for next time they go get their hair cut or something like that, like to make it a relatable. I'm kind of thinking the video will be like little stick figure animation or something like that.

---

## Turn 7 — Claude

Stick figures are a good instinct — they're fast, they read instantly, and "stick figure with bangs" is legible in a way that a detailed illustration wouldn't be. But it does mean you're now producing two different kinds of animation, and Hedra only does one of them.

Hedra gives you a talking head. It animates a face from a single image; it won't generate a scene of a stick figure walking into a salon. So the structure becomes: Nora on screen for the talking segments, cutting away to illustrated panels while her voice keeps going. That's a normal, well-worn format — the cut-aways illustrate the narration rather than acting out dialogue, which is much easier than it sounds because nothing in the cut-away has to lip sync.

The reliable way to build it:

1. **Generate the whole voiceover as one ElevenLabs file first.** This matters — if you generate segment by segment, Nora's tone drifts between clips and you'll hear it at the cuts.
2. **Split that audio** and run the on-camera portions through Hedra.
3. **Make the cut-away panels as stills**, not animation. Three or four static stick-figure panels, cut on the beat of the line, will read as intentional and comedic. Actual motion is where this gets expensive and where consistency falls apart — if you generate panels with an AI image tool, keeping the same stick figure across four frames is the hard part.
4. **Assemble in CapCut or Descript.** Both free-tier fine, both handle "talking head, cut to panel, cut back" without fuss.

If you do want real motion on the cut-aways, whiteboard-animation tools like Vyond or Doodly are built almost exactly for this, and stick figures are their native style. Worth a look, but static panels will get you 90% of the effect for 10% of the work.

Here's the beat written out:

> And I'll be honest with you — not every change turns out great.
>
> *[panel: stick figure at a mirror, fresh bangs, looks fantastic]*
>
> For some people, it's exactly right.
>
> *[panel: second stick figure, same bangs, clearly a disaster]*
>
> For others… less so.
>
> *[panel: same figure, later, back in the chair, one hand raised]*
>
> But even then — you learned something. And next time, you know better.
>
> Most changes land somewhere in that range. Either it's better than what you had, or you find out something useful. Both of those are worth trying for.

Two notes. Keep the figures gender-neutral and let it be "someone gets bangs" rather than a girl — stick figures are ambiguous by default, so you lose nothing, and in a video going out bank-wide you'd rather the joke not land on a woman's appearance specifically. Second, the third panel is what makes it work. Without the callback it's just a bad haircut; with it, it's the point of the whole section.

One thing I want to check: is this going in the training video or the submission? You said "this slide," which makes me think you may still want it in the main one. My read from last time hasn't changed — it softens the pitch in front of reviewers and it's perfect in front of the teams. But it's your call and you know that audience. If you want it in the submission, tell me and I'll place it where it does the least damage, probably right after the "nothing changes for your customer" section where you've just banked a win.

---

## Turn 8 — Talia

I was kind of thinking of HeyGen, of how it had slides, quote unquote, but it ends up being one video. So if it ends up being a similar platform we use.

---

## Turn 8 — Claude

Ah — that changes the recommendation, and it's worth being precise about what you're describing.

What HeyGen has is a **scene-based editor**. You build the video as a sequence of scenes — each one with its own avatar, background, on-screen text, or full-screen graphic — and it renders out as a single continuous video. That's exactly the model you want for this: Nora talking in scene 1, stick-figure panel in scene 4, Nora back in scene 5, one MP4 at the end. No separate editing step.

Hedra doesn't have that. It's a generator, not an editor — one image plus one audio file equals one clip. Which means the workflow I described (generate clips, assemble in CapCut) is real work HeyGen would do for you.

So the actual tradeoff is:

**HeyGen** gives you the scene editor and 1080p, but its avatar engine is tuned for photorealistic human faces. Nora as a cartoon is the case it handles worst. You might get something usable — it's worth spending 20 minutes testing with an actual Nora image before deciding anything — but you may find the face goes uncanny or the mouth doesn't track.

**Hedra** nails Nora and gives you nothing else.

There's a third option that may be the best fit: **Synthesia** or **Colossyan** both have scene-based editors in the same shape as HeyGen's, and both let you upload a custom avatar image. Whether they'll accept an illustrated character cleanly, I'd want to verify rather than promise — the honest answer is that the scene-editor tools all lean toward realistic avatars and the cartoon-friendly tools all lean toward bare generation.

And the fourth, which I'd genuinely consider: **build it in HeyGen and use Hedra only for Nora's clips.** Generate Nora in Hedra, upload those clips into a scene-based editor as video assets, and use the editor for everything else — panels, titles, captions, the single render. You get the good Nora and the assembly in one place.

Want me to dig into which of these actually accepts a cartoon avatar in a scene editor? That's a specific enough question that a bit of searching would settle it rather than me guessing. Otherwise the fastest path is to drop a Nora image into HeyGen's free tier tonight and see what her face does — that one test tells you more than any comparison I can give you.

---

## Turn 9 — Talia

Remember everything I've told you so far. I want to continue on of the script first.

---

## Turn 9 — Claude

*(Full script assembled with the change-is-hard section placed after "nothing changes for your customer," plus a new closing section. Notes on the changes:)*

**Section 5 placement.** I put it right after the "nothing changes" win, so the acknowledgment of resistance lands while a reviewer is still feeling the upside rather than before they've heard one. I also opened it with "I'll be honest with you," which reframes the section — it stops reading as a plea to the hesitant and starts reading as candor from someone confident in the idea. Same content, different posture.

**Section 8** is new and it's doing real work. Everything before it describes an idea; this says it exists. One group live, several in trial, and the closing line puts the viewer inside the pattern rather than outside it. If you'd rather not name numbers you can cut to just the last two lines and it still closes cleanly.

The Nora sign-off is worth keeping. A named AI agent signing off as a thing Northpointe already runs is a stronger closing image than anything the script could say out loud about AI.

If you want a 60-second cut for a version that has to be short: sections 1, 4, 6, and the last two lines of 8. That's the spine.

---

## Turn 10 — Talia

I want to also add the feature of the bold desk portal. So it's a one-stop for all North Point employees to track all of their requests they've opened with all teams in Bold Desk, open new tickets, and access a knowledge base that all teams can contribute to. So every team that works in Bold Desk can publish knowledge base articles for self-serve options, helpful tips, and basically anything that they're constantly reminding their customers they'll have access to.

One thing to note is even though email will still work and teams can email their shared inboxes that are in Outlook, which will be forwarded to Bold Desk, the portal is really helpful so they can use the form in the portal and actually get an even better experience. And while that might be challenging for some users at first, to go to a new place rather than their comfortable email, it'll actually help them in the long run. So something to think about, especially for IT tickets, but this really will apply for everyone.

Something I wrote up for IT: every IT request, a problem, an access request, or new hardware, starts with a ticket in the IT service desk portal. Tickets make sure your request reaches the right team, is tracked to completion, and it doesn't get lost in someone's inbox. *(You can take out the "this guide walks you through" part.)* And I think that really applies to all teams.

So why the portal beats email — and that's for both customers and our agents working in Bold Desk. So yes, emailing still opens a ticket, but a ticket is only as good as the request inside it. So here's what going through the portal does better:

- Your question doesn't get lost in a thread. A really common issue I've seen among teams is receiving forwarded email chains that are CC'd to multiple boxes. A forwarded chain means a technician has to dig through the whole conversation just to find the actual ask before they can start helping. The portal has you state what you need in your own words, and a clear ask gets a fast answer.
- No more "who's got this?" When a request is cc'd to several teams at once, someone has to figure out who owns it — and while that gets sorted, nobody is actually working on it. Picking a category in the portal sends your request straight to the right team, first try.
- A little intention goes a long way. The templates take about 30 seconds and ask you to spell out exactly what you're requesting — which usually means you get exactly that, done right the first time, with no clarifying emails in between.
- You can see your status anytime. Your technician, status, and details are all in the portal at a glance — no follow-up email required.
- Every clear ticket helps your technicians. Clean, categorized tickets show us what's breaking most often so we can fix root causes for the whole bank — and every minute not spent untangling an email chain is a minute spent solving problems. Maybe yours!

Same request, less waiting — everybody wins!

---

## Turn 10 — Claude

The portal is the biggest thing you've added, and I don't think you're framing it as big enough. Everything else in the script makes email work better. The portal plus a shared knowledge base is the part that actually changes how the bank works — one place where any employee sees every request they have open with every team, and where any team can publish what they're tired of repeating. That's not a better inbox. That's a capability Northpointe doesn't have today in any form.

So I'd split your material. The capability goes in the submission video. The "why the portal beats email" persuasion — which is genuinely good writing — goes in the companion piece for teams, where it's aimed at the people who need convincing.

**New section for the submission:**

> *[title card: One place for everything]*
>
> And if you want more than email, there's the portal.
>
> The portal is a single place where any Northpointe employee can see every request they have open — with IT, with servicing, with accounting, with any team working in BoldDesk. Open a new one. Check where an old one stands. No follow-up email required.
>
> It also holds a knowledge base that every team can contribute to. If your team answers the same question forty times a year, you can write it down once, and the next person finds the answer before they ever open a ticket. Self-serve options. Helpful tips. All of it in one place, built by the people who actually know the answers.
>
> That's the part I find genuinely exciting. Not a better inbox — a place where what one team knows becomes something the whole bank can use.

That's about 40 seconds and it's the section I'd protect if you have to cut elsewhere. "What one team knows becomes something the whole bank can use" is the line that makes a reviewer sit up, because it's a growth story rather than an efficiency story.

**And your portal-vs-email material, tightened and de-IT'd for the training piece:**

Your open holds up almost as written, just generalized: *Every request — a problem, an access request, new hardware, a loan question, a report — can start with a ticket in the portal. Tickets make sure your request reaches the right team, gets tracked to completion, and doesn't get lost in somebody's inbox.* I dropped the "this guide walks you through" line as you said.

Then: *Yes, emailing still opens a ticket. But a ticket is only as good as the request inside it. Here's what going through the portal does better.*

- **Your question doesn't get lost in a thread.** One of the most common things teams see is a forwarded chain CC'd to three other boxes. Somebody then has to read the whole conversation just to find the actual ask before they can start helping. The portal asks you to say what you need in your own words — and a clear ask gets a fast answer.
- **No more "who's got this?"** When a request goes to several teams at once, someone has to sort out who owns it, and while that's happening nobody's working on it. Picking a category sends your request straight to the right team, first try.
- **A little intention goes a long way.** The templates take about thirty seconds and ask you to spell out exactly what you need — which usually means you get exactly that, done right the first time, with no clarifying emails in between.
- **You can see your status anytime.** Who has it, where it stands, what's been done — all in one place, at a glance.
- **Every clear ticket helps the team helping you.** Clean, categorized tickets show us what breaks most often, so we can fix root causes for the whole bank. Every minute not spent untangling an email chain is a minute spent solving problems. Maybe yours.

*Same request, less waiting. Everybody wins.*

I changed almost nothing there — the bullets were already in good shape. The main edits were swapping "technician" for "the team helping you" so it reads for servicing and accounting as well as IT, and cutting "with C below," which I think was a transcription artifact.

One thing worth deciding now rather than later: the companion piece is turning into a real deliverable — the change-is-hard beat, the bangs gag, and all of this. That's a 3-4 minute user-facing video, which is a bigger build than the submission. Do you want to keep developing both in parallel, or nail the submission first and come back to the training one before the week of the 22nd?

---

## Turn 11 — Talia

Also note for our users on the go, this will especially apply to sales. The portal is mobile friendly and does not require being connected to the VPN. All they need to do is bookmark the link and they can access the form. They just log in with their same Outlook password that they would use to log into Teams and Outlook on their phone, which I'm sure they have already done. So it's just one extra app they can add and they can fill out the template for each team that they need to reach out to.

And this will ask for a little bit of information up front, which might be an extra 30 seconds to a minute. It may feel frustrating at first, but in the long run, they're saving time by not having to go back and forth asking for that information. And by providing that up front, the teams can work on their requests faster, which then in turn will give them a faster response that they can give to their customer.

So for example, if a user can't log into a system that they need to log into to help their borrower, if they don't say what system they need access to up front, that's time sitting with a team and then just asking what application it's for and however long that takes — whereas if they would have given that information up front, it could have been done right away. And then they would be able to help their customer faster.

---

## Turn 11 — Claude

Good addition, and it belongs in the submission rather than the training piece. Mobile access without VPN is a reach story — it means the portal works for people who aren't at a desk, which is most of sales. That's the kind of detail that makes an idea feel deployable rather than theoretical.

I'd fold it into the end of the portal section instead of giving it its own:

> And it works wherever you are. The portal is mobile friendly and it doesn't need VPN — bookmark the link on your phone and it's there. You sign in with the same account you already use for Outlook and Teams, so there's nothing new to set up and nothing new to remember.
>
> For anyone who spends their day out of the office, that's the difference between waiting until you're back at a desk and handling it between meetings.

One wording note: I'd say "the same account you already use for Outlook and Teams" rather than "the same password." Same meaning to a listener, but it describes single sign-on accurately, and in a video that may end up in front of people who care about how authentication works, the precise version costs you nothing.

Also worth a thought before you say "no VPN required" on camera — not because it's wrong, but because a bank-wide video asserting that a system is reachable from personal phones off-network is the sort of line that generates a question. You know the posture better than I do; I'd just rather you choose to say it than discover it was a topic afterward.

**Your worked example goes in the training piece**, where it's the best thing in that section:

> Say you can't log into a system you need to help a borrower. If the ticket just says "I can't log in," the first thing that happens is somebody emails you back to ask which application. That round trip might take an hour. Might take until tomorrow. And your borrower is waiting the whole time.
>
> If the form had asked you up front — and it does — that same request gets worked the moment it lands.
>
> That's the whole trade. Thirty extra seconds when you submit, against an hour of back-and-forth after. It feels like friction in the moment. It's the opposite.

That's also a natural spot for a stick-figure panel if you want a second one: figure at a laptop with a question mark, cut to the same figure still waiting, clock moved. Runs parallel to the bangs gag without repeating the joke.

Where we're at: the submission video is now roughly two and a half minutes with the portal and mobile sections in, which is still a reasonable watch. The training piece has accumulated four solid segments and no through-line yet. Say the word when you want me to assemble either one as a clean full draft rather than sections.

---

## Turn 12 — Talia

Bolddesk also offers user-friendly reporting and dashboards. So now managers can have a quick place to access to see an overview of how their team is looking. They can quickly see how many tickets are currently open with their teams. And not only the one team, but if they manage multiple teams, they can see all of their teams at a quick glance. So they can have dashboards and reporting for combined teams or just the certain teams individually.

And from those dashboards, they can see how many tickets are open, how many are in a pending status waiting for the customer to respond, how many were closed out of the ones open this month, how many tickets does each team member have. They can see if someone's overworked, if someone has more capacity, they can see how many tickets were able to meet the first response SLA and also the closed SLA. Maybe we have a goal across the board where all teams need to respond within one to two hours, or each team can have individual SLAs. And that is the beauty of Bolddesk — each team can be very customized individually, or we can have set expectations across the board depending on what leadership decides.

They can even see tracking of internal North Point employees versus external customers, how many emails they're getting for each. They can track the type of requests they're getting. There's really endless possibilities with tracking in Bolddesk and assisting in meeting SLAs by showing this visibly and also getting notified to remind users to work their tickets in a timely manner.

It also is great for when someone is on lunch or is out of office. It lets their team pick up where they left off with the helpful notes function in Bolddesk. They can leave a note for what they've done so far on a ticket and their team can see that and work the rest of the ticket. They have access to all of the tickets on their specific team. There is also a function to share a ticket with another team or another person that maybe isn't part of their team, so they can share visibility if needed. They can also forward tickets just like email if they need to. They can print out full tickets — so if you need a ticket printed for audit purposes, it's super helpful. The full chain is there.

And down the road, if it's something we wanted to implement, there is a connector for ChatGPT. So if we ever wanted teams to be able to have some AI connection to Bolddesk, it can actually give them summaries of tickets. This may be super helpful for managers where they can ask for a summary of a ticket. It can read all the back and forth in the ticket so they can kind of have a TLDR, so managers can have better visibility of what their team is working on and see what's happening.

They can also set different priorities for tickets, different tags. So there's just a lot of ways to enhance our customer service, our SLAs, our reporting, and overall just provide a better user experience for everyone.

---

## Turn 12 — Claude

This is the section that will matter most to whoever reviews your submission, because it's the first thing in the whole script that's aimed at them rather than at end users. Reviewers are managers. "I can see my teams at a glance" is a benefit they feel personally.

But there's more here than a video can carry. I'd take three things into the script and move the rest to the deck.

**Into the script, after the portal section:**

> *[title card: Visibility]*
>
> There's one more piece, and it's for the people running these teams.
>
> BoldDesk comes with reporting and dashboards that are actually readable. A manager can see how many requests are open right now — across one team, or across every team they oversee. How many are waiting on a customer. How many closed this month. How much each person is carrying, so you can tell who's buried and who has room.
>
> And it tracks service levels. First response, time to close, team by team.
>
> That last part opens a real question for Northpointe, and it's one leadership should decide. We could set a single standard across the bank — every request gets a first response within two hours. Or every team could set its own, fitted to the work it does. BoldDesk supports either. What matters is that for the first time, whichever we choose, we'd actually be able to see whether we're meeting it.

The final paragraph is the strongest strategic move in the whole script. It hands leadership a decision instead of a finished product. Reviewers engage far more with an idea that needs their judgment than one that just needs their approval — and it's honest, because that genuinely is their call.

**And one line to fold into section 3**, where you've already named the handoff problem:

> ...and hard to hand off when someone's out. In BoldDesk, whoever picks it up sees the notes on what's already been done, and just carries on.

**Everything else belongs in the deck.** Ticket sharing across teams, forwarding, priorities and tags, internal-versus-external volume tracking, request type reporting — these are real and they're persuasive on a page, but in a video they turn into a feature list and a listener's attention slides off.

One of them I'd actually feature prominently in the deck rather than bury: **printing a complete ticket with the full chain for audit**. At a bank that's not a convenience, it's an examination and evidentiary story, and it's the kind of thing that makes a compliance-minded reader relax about the whole proposal. Worth its own callout.

**On the ChatGPT connector** — I'd keep it out of the video, and I want to be clear it's not a capability concern. It's that a video going to bank leadership that names sending ticket contents to OpenAI invites a data-governance conversation you haven't had yet, and it would be the one thing in three minutes that a reviewer snags on. Ticket threads at Northpointe contain borrower information.

There's also a better version of the same idea available to you. You already have Nora, running on infrastructure you control, doing ticket creation and Linear issues today. "Summarize this thread for me" is a capability you could build into something that already exists rather than a connector to a third party.

---

## Turn 13 — Talia

Also add that Bold Desk has the opportunity for lots of automation. So Bold Desk can connect to other platforms. For example, some teams want to track larger tickets as a project in ClickUp. There's a way to connect to ClickUp where we just have a checkbox added in Bold Desk. And when they check that box, it pushes the ticket to ClickUp automatically, and then it fills out a form in Bold Desk in that ticket and gives the ClickUp ticket number and the link, and it copies the full ticket information over to ClickUp and then pushes it back over to Bold Desk. So they both have a link to see the connection between the two.

That is just one example, but it could be linked to other systems. There could also be automations to auto respond a canned response. So maybe a team has less staff and they want to provide a better user experience to make sure they're at least responding to customers right away. So they could set up an auto response saying, hey, we've received your email, we're currently working on it, here's our hours and turn times so you are aware, or something like that. They can really make it whatever they want.

But there's so many different automations that can be set up depending on the team's need. So the fact that there can be custom actions done automatically, it can reduce the need for repetitive tasks to allow teams to work on more important things and also create a less stressful environment.

---

## Turn 13 — Claude

The ClickUp integration is the single most valuable thing you've described in this whole conversation, and it's because of one fact: it already exists. Everything else in the script is a capability BoldDesk offers. This is proof that you can extend the platform into whatever Northpointe already uses — and you've demonstrated it, not proposed it.

That deserves to be the note the script ends on.

> *[title card: It connects to what we already use]*
>
> And BoldDesk doesn't have to stand alone.
>
> One team wanted to track their bigger requests as projects in ClickUp, where they already work. So we built it. There's now a checkbox on the ticket — tick it, and the ticket becomes a ClickUp task automatically, with the full details carried across. The ClickUp ID and a link come straight back into the ticket, so both sides stay connected and nobody re-types anything.
>
> That took a webhook and an afternoon. And it's just one example — the same approach works for other systems we already run.
>
> Automation goes the other direction too. A smaller team can set an automatic first reply: *we've got your request, here are our hours and our typical turn times.* Nobody's left wondering whether their email landed, and nobody on the team is writing the same reply forty times a day.
>
> That's the part that adds up. Every repetitive thing a system handles is time a person gets back for work that actually needs a person — and a little less pressure on a team that's already stretched.

Two things I did on purpose there.

**"So we built it."** Three words, and they reframe the entire submission. Up to that point Nora has been describing a platform; there she's describing something your team already delivered.

**"A webhook and an afternoon."** Specific, modest, and it tells a reviewer the marginal cost of the next integration is small. That's the thing leadership actually wants to know when they hear "it connects to other systems" — not whether it's possible, but whether it's expensive.

On placement: this goes after the visibility section, so the script ends on capability-plus-proof rather than on dashboards. The arc becomes *here's the problem → here's the platform → here's what it unlocks → here's what we've already built → here's the ask.*

---

## Turn 14 — Talia

Go to Linear and read all the issues and sub issues in here: `https://linear.app/northpointe/project/help-desk-realignment-6650fdcd5629/issues`

Is there anything I missed or worth mentioning? I want this to be very strong and really make sure all issues are covered that make sense companywide to know. It doesn't have to be too granular, but at least every feature is covered

---

## Turn 14 — Claude

*(Read all 46 issues in the Help Desk Realignment project via the browser.)*

Findings, ordered by how much they'd strengthen the submission:

**The numbers.** 46 issues in scope, 35 complete, Phase 1 at 100% as of September 16, Phase 2 at 76% with an October 30 target, running since late April. Plus ~20 distinct business functions touched.

**Features in Linear not in the script:**

- **Support hours and after-hours auto-response** (SVD-14, SVD-16, SVD-17) — teams publish their hours; anything outside them gets an automatic reply.
- **Auto-assignment and unassigned-ticket cleanup** (SVD-59, SVD-11) — requests get assigned automatically, nothing sits with nobody's name on it.
- **A second, different automation example** (SVD-62) — the purchase advice PDF pulling out of a ticket into the MPP dashboard. Document handling, not task sync — two unlike examples prove extensibility better than two similar ones.
- **Subject-line routing** (SVD-56) — deck, not video.

**A strategic flag.** The project sits under a CIO-level initiative, *Service Desk & ITSM Transformation*, added in July. Good for credibility, slightly awkward for a "new idea" submission. Argues for emphasizing what *isn't* scoped yet: the company-wide portal, the shared knowledge base, and bank-wide SLA standards. SVD-23 (SLA Standardization and Enforcement) is still in the backlog — so the thing the script asks leadership to decide is genuinely undecided.

*(I also said SVD-38, Vendor Management Review & Approval, was closed out. That was wrong — see Turn 15.)*

---

## Turn 15 — Talia

Yes *(build the full draft)*

---

## Turn 15 — Claude

*(Delivered the full four-minute script in ten numbered sections with cut markers, plus a ten-page deck outline: cover, idea in one paragraph, the problem, what's already delivered, portal and knowledge base, visibility and service levels, audit and recordkeeping, extensibility, the SLA decision, what's needed to explore further.)*

---

## Turn 16 — Talia

I want you to still add the ChatGPT part as something that may be something we want to offer down the road. And then also take out the part that we've already been working on this, like all the issues in linear, because some teams like that are actually in there already obviously know, but overall the entire company isn't aware of Bold Desk and it technically hasn't actually passed vendor management. So this still, even though it's being heavily implemented, we are only on a one month trial right now. So it still is being pushed as a big idea. And since it hasn't been addressed to the entire company, I feel like this still qualifies. So don't mention all of that, if that makes sense.

---

## Turn 16 — Claude

Understood, and that reframes it correctly — if the whole company hasn't heard of BoldDesk and it's a one-month trial, then the idea genuinely is new to almost everyone reading it.

I also need to correct something I told you last message. I said SVD-38 was closed out and vendor management was handled. That was wrong — the row rendered oddly and I read it as complete when it wasn't. Good thing you caught it, because that would have been a bad assumption baked into a deck.

It also shapes the edit more than just deleting numbers. A few lines in the draft imply a decision that hasn't been made — "the application we've chosen to move forward with," "so we built it." If a reviewer hears that and then asks vendor management where things stand, the gap between the video and the answer is worse than just saying "trial" up front. So I've shifted the tense rather than only cutting. It costs nothing persuasively; "we're trialing this and here's what we've already seen" is if anything more credible than a fait accompli.

**Section 1** — last line becomes:

> The idea is an enterprise support platform. Not just for IT — for any team that answers requests. Right now we're trialing an application called BoldDesk, and what we're seeing is worth sharing.

**Section 3** — replace the list of onboarded functions with discovery framing:

> Here's what we've been seeing. We've spent months talking with teams across the bank about how requests actually reach them — and the same pattern keeps surfacing.

**Section 8** — retensed, plus the AI addition at the end:

> And BoldDesk doesn't have to stand alone.
>
> One team wanted to track their bigger requests as projects in ClickUp, where they already work. So during the trial we tried it. There's now a checkbox on the ticket — tick it, and the ticket becomes a ClickUp task automatically, with the full details carried across. The ClickUp ID and a link come straight back into the ticket, so both sides stay connected and nobody re-types anything. That took a webhook and an afternoon.
>
> Another automation pulls documents straight out of tickets and files them where they need to go, with no one re-uploading anything.
>
> And teams can publish their support hours, so anything arriving outside them gets an automatic reply — nobody's left wondering whether their request landed at nine on a Friday night. A smaller team can do the same during the day: *we've got your request, here are our typical turn times.*
>
> That's the part that adds up. Every repetitive thing a system handles is time a person gets back for work that actually needs a person — and a little less pressure on a team that's already stretched.
>
> *[title card: And down the road…]*
>
> There's also more available than we'd turn on tomorrow. BoldDesk offers an AI connector, so eventually a manager could ask for a summary of a long ticket thread instead of reading forty replies to find out where things stand. That's not something we'd enable without a careful look at what information goes where — but it's there when we're ready. And when you're choosing a platform to grow into, it's worth knowing what it can grow into.

The caveat line does real work for you. It signals to anyone in the room who thinks about data governance that you've already thought about it, which is how you get to mention the capability without inheriting the objection.

**Section 10** — new close:

> BoldDesk gives us a shared way to work that problem. Better tracking, faster communication, and one clear front door. Across teams, and out to the people we serve.
>
> Every team that's taken a look at this started in the same place — a mailbox, a growing pile of requests, and the sense that there had to be a better way.
>
> There is. And I think it's worth building.
>
> Thanks for listening. I'm Nora — and I'll see you at the help desk.

**Deck changes:** Page 4 (what's already delivered) is gone — renumber to nine. Page 8 gains the AI connector as a future option with the governance note. Page 10 becomes: completing and evaluating the trial, vendor management review, the SLA decision, and the Nora summarization option as a longer-term possibility. Naming vendor management there is deliberate — reviewers trust a person who tells them what isn't done yet.

---

## Turn 17 — Talia

Also, at this time, IT is not in bold desk, so don't have anything that says IT is in bold desk. Don't really mention the specific teams, just kind of generalize that all teams would be in here. I would love to move IT into bold desk, and that's the direction I want to go. But at this time, that's not confirmed, so I don't want to give any promises that they will be in there because they may stay separate.

---

## Turn 17 — Claude

Caught it — the portal section was the main offender, and there's one more in the deck.

**Section 5**, second paragraph. Replace:

> The portal is a single place where any Northpointe employee can see every request they have open — with IT, with servicing, with accounting, with any team working in BoldDesk.

With:

> The portal is a single place where any Northpointe employee can see every request they have open — with any team working in BoldDesk, all in one view.

That's the only line in the script that named teams or put IT in the platform. Everything else was already generic after the last pass.

One line I'd leave alone, but flag so it's your call: Nora introducing herself as "your friendly IT help desk assistant." That's accurate — she *is* IT's assistant — and it doesn't claim IT runs on BoldDesk. But since the whole video is IT proposing this, someone could read an implication. If you want it airtight, drop the two letters: "your friendly help desk assistant." Slight loss, since IT is where most people would have met her.

**Deck changes:**

- **Page 3 (The problem)** — drop "across ~20 business functions." Say "shared mailboxes across the organization."
- **Page 8 (Extensibility)** — the ClickUp entry loses the team attribution. "ClickUp bidirectional integration, built and tested during the trial." Nothing else on that page names anyone.
- **Page 10** — "the remaining teams to onboard" becomes "a plan for which teams come on board and in what order." Truer, and it doesn't presume any particular team's outcome, including IT's.

On the underlying thing: moving IT in is a strong instinct and the portal argument you wrote is at its best when IT is the example, because that's where most employees will encounter it first. But that's an argument for a later conversation, not for this video. Nothing in the current draft forecloses it — if IT moves in six months, every word still holds.

---

## Current state

**Submission video:** ten sections, roughly four minutes as written, with a two-minute cut available (sections 1, 3, 4, 5, 9, 10). Framed as a trial, no specific teams named, no IT-in-BoldDesk claim, AI connector included as a future option with a governance caveat.

**Supporting deck:** nine pages, branded PDF, Northpointe navy `#164356` and light blue `#0086b1`, Lato, Emblem Only white mark on the cover. Not yet built — needs logo PNGs and optionally a portal screenshot.

**Companion training video (separate, for teams):** change-is-hard beat with the bangs gag, portal-versus-email bullets, the can't-log-in worked example. Four segments, no through-line yet.

**Production approach:** Nora generated in Hedra (Character-3 handles illustrated characters; 720p cap; front-facing image needed), voice in ElevenLabs as one continuous file, assembled in a scene-based editor or CapCut. Stick-figure cut-aways as static panels rather than animation.

**Open items:** whether the form's upload box accepts video; whether pushing brand assets through an unvetted video tool needs an InfoSec nod; which idea angle the deck leads with if not the general enterprise-platform framing.
