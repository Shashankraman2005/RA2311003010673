// Stage 1 - Priority Inbox Algorithm

const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function getPriorityScore(notification) {
  const typeWeight = PRIORITY_WEIGHTS[notification.Type] || 0;
  const recencyScore = new Date(notification.Timestamp).getTime() / 1e12;
  return typeWeight + recencyScore;
}

function getTopN(notifications, n = 10) {
  return [...notifications]
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
    .slice(0, n);
}

module.exports = { getTopN, getPriorityScore };