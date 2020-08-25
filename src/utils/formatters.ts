import { getUserLocalDate } from "./dateUtil";

export const dayNames = [
  "pühapäev",
  "esmaspäev",
  "teisipäev",
  "kolmapäev",
  "neljapäev",
  "reede",
  "laupäev",
];

export function getDayName(input: string) {
  const date = getUserLocalDate(input);
  return dayNames[date.getDay()];
}

export function getDayNameShort(input: string) {
  return getDayName(input)[0].toUpperCase();
}

export function formatHours(date: Date) {
  let hours = date.getHours();

  if (hours < 10) {
    return "0" + hours;
  }
  return String(hours);
}
