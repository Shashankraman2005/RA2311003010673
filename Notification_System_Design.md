# Stage 1

## Priority Inbox — System Design

### Problem
Students receive a high volume of campus notifications across three categories —
Placements, Results, and Events. Important notifications like placement drives
often get buried under less critical ones like event announcements.

### Solution — Priority Scoring Algorithm

Each notification is assigned a score based on two factors:

**1. Type Weight (most important factor)**
| Type | Weight |
|------|--------|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

**2. Recency Score**
Within the same type, newer notifications appear first.
The timestamp is normalized so it adds a small boost without overriding type weight.

**Final Score Formula:**
score = typeWeight + (timestamp_ms / 1e12)

### Maintaining Top 10 Efficiently
When new notifications arrive, binary search finds the correct insert position in O(log n).
Only top N items are kept in view — no full re-sort needed.

### Output
Top N notifications (default 10, configurable to 15 or 20) sorted by:
Placement → Result → Event, then by recency within each type.
