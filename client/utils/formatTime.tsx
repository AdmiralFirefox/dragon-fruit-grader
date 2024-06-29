export const formatTime = (timestamp: string) => {
  const utcTime = new Date(timestamp);
  return utcTime.toLocaleString([], {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
