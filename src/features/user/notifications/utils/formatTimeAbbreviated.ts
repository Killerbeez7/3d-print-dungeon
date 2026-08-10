import { formatDistanceToNow } from "date-fns";

export function formatTimeAbbreviated(date: Date) {
  const distance = formatDistanceToNow(date, {
    addSuffix: false,
  });

  if (distance.includes("minute")) {
    const minutes = distance.match(/(\d+)/)?.[1] ?? "0";
    return `${minutes} min`;
  }

  if (distance.includes("hour")) {
    const hours = distance.match(/(\d+)/)?.[1] ?? "0";
    return `${hours} h`;
  }

  if (distance.includes("day")) {
    const days = distance.match(/(\d+)/)?.[1] ?? "0";
    return `${days} d`;
  }

  if (distance.includes("week")) {
    const weeks = distance.match(/(\d+)/)?.[1] ?? "0";
    return `${weeks} w`;
  }

  if (distance.includes("month")) {
    const months = distance.match(/(\d+)/)?.[1] ?? "0";
    return `${months} m`;
  }

  if (distance.includes("year")) {
    const years = distance.match(/(\d+)/)?.[1] ?? "0";
    return `${years} y`;
  }

  return distance;
}
