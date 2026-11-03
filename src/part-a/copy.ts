export const copy = {
  title: "Manage my subscription",
  loading: "Loading your subscription",
  loadFailed: {
    title: "We couldn't load your subscription",
    body: "Your subscription hasn't changed. Try again, or contact customer support if this keeps happening.",
    retry: "Try again",
  },
  notFound: {
    title: "We couldn't find your subscription",
    body: "Contact customer support and we'll help you find it.",
  },
  status: {
    nextCharge: "Next charge",
    pausedUntil: "Paused until",
    cancelledOn: "Cancelled on",
  },
  cancelReasons: [
    { id: "tooMuchProduct", label: "I have too much product left" },
    { id: "tooExpensive", label: "It costs too much" },
    { id: "differentProduct", label: "I'm trying a different product" },
    { id: "noResults", label: "I didn't see results" },
    { id: "other", label: "Other" },
  ],
};
