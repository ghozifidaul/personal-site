---
title: "I Failed a Test Because of a Race Condition (So I Learned It Properly)"
description: "Understanding what is race conditiong in react and how to handle it properly."
date: 2026-02-11
tags: ["react", "race condition", "javascript","technical test"]
image: "blog/brianna-parks.webp"
---
*Photo by Brianna Parks on Unsplash*

A few weeks ago, I got a technical test question about **race conditions**.

My honest reaction?

> “Race condition? I’ve heard the term… but have I ever _fixed_ one in real life?”

Nope.

I didn’t know how to solve it.  
And yes… I failed the test.

But hey — failure is just paid learning 💸  
So I went down the rabbit hole and learned one of the most common race conditions in React.

This article is the result of that journey.

---
## So… what is a race condition?

A **race condition** happens when multiple async processes compete to update the same data.

Whoever finishes last wins the race.  
And sometimes… the wrong one wins 🥲

This usually happens when dealing with **API calls**.

Still sounds abstract? Let’s break it with code.

---
## The innocent React code

Look at this perfectly normal React component:

```js
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
    });
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

Looks clean.  
Looks correct.  
Looks harmless.

This code is secretly plotting against you.

---
## The bug that only appears in real life

Imagine this timeline:
1. Page loads → fetch **User 123**
2. User clicks very fast → switch to **User 456**
3. Now both requests are running at the same time 🏃‍♂️🏃‍♂️

Whichever request finishes last wins.
And sometimes the wrong one wins.

### The nightmare scenario

- Request for **User 456** finishes first → UI shows user 456 ✅
- Then request for **User 123** finishes later → UI suddenly shows user 123 ❌

Congratulations 🎉  
Your UI just time-traveled backwards.

This is a race condition.

---

## How do we stop the chaos?

There are two classic strategies:
1. Ignore outdated requests
2. Cancel outdated requests

Let’s start with the easiest fix.

---
## Solution #1 — Ignore outdated requests

We basically tell React:
> “Only the latest request is allowed to talk.”

```js
useEffect(() => {
  let isCurrentRequest = true;

  fetchUser(userId).then(data => {
    if (isCurrentRequest) {
      setUser(data);
    }
  });

  return () => {
    isCurrentRequest = false;
  };
}, [userId]);
```

### What’s happening here?

React calls the cleanup function when:
- the component unmounts, OR
- the dependency (`userId`) changes

So the timeline becomes:
1. Fetch user 123 → flag = true
2. userId changes → flag becomes false 🚫
3. Old request finishes → ignored 🙅‍♂️
4. New request finishes → rendered 😎    

Simple. Effective. Minimal drama.

---
## Solution #2 — Cancel the request completely

Instead of ignoring the old request, we **terminate it**.

Yes. We fire it. 🔫

```js
useEffect(() => {
  const abortController = new AbortController();

  fetchUser(userId, { signal: abortController.signal })
    .then(data => {
      setUser(data);
    })
    .catch(error => {
      if (error.name !== "AbortError") {
        // Real error handling
      }
    });

  return () => {
    abortController.abort();
  };
}, [userId]);
```

When `userId` changes, the old request gets cancelled before it can cause trouble.

No race. No drama.

---

## Which solution is better?

### Ignore outdated requests
**Pros**
- Super simple
- Quick to implement

**Cons**
- Old requests still run in the background 💸
- Wastes bandwidth & server resources
### Cancel outdated requests
**Pros**
- Better performance 🚀 
- Less server load

**Cons**
- Slightly more complex

---
## The “overprotective developer” solution

Why choose one when you can choose **both**?

```js
useEffect(() => {
  const abortController = new AbortController();
  let isCurrentRequest = true;

  fetchUser(userId, { signal: abortController.signal })
    .then(data => {
      if (isCurrentRequest) {
        setUser(data);
      }
    })
    .catch(error => {
      if (error.name !== "AbortError" && isCurrentRequest) {
        // Handle real errors
      }
    });

  return () => {
    abortController.abort();
    isCurrentRequest = false;
  };
}, [userId]);
```

This gives you:
- Cancelled requests ✅
- Ignored outdated responses ✅
- Peace of mind 🧘‍♂️
    

---
## Final thoughts

Race conditions are sneaky.

Your app works perfectly… until a real user clicks faster than your expectations.

And suddenly your UI is living in the past.

Now you know how to stop that from happening 🙂

---
