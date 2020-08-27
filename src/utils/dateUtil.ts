export function getUserLocalDate(dateString: string): Date {
  // if we don't have time in dateString
  if (dateString.length < 19) {
    return new Date(dateString);
  }
  return new Date(
    dateString + `+0${(new Date().getTimezoneOffset() / 60) * -1}:00`
  );
}

export const monthNames = [
  "jaanuar",
  "veebruar",
  "märts",
  "aprill",
  "mai",
  "juuni",
  "juuli",
  "august",
  "september",
  "oktoober",
  "november",
  "detsember",
];
