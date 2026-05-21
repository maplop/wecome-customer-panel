export const formatMxPhoneNumber = (value?: string | number | null): string => {
  const digits = `${value || ""}`.replace(/\D/g, "");

  if (!digits) return "";

  let localDigits = digits;

  if (digits.length >= 12 && digits.startsWith("52")) {
    localDigits = digits.slice(-10);
  } else if (digits.length > 10) {
    localDigits = digits.slice(-10);
  }

  if (localDigits.length !== 10) {
    return `+${digits}`;
  }

  const lada = localDigits.slice(0, 3);

  const part1 = localDigits.slice(3, 6);

  const part2 = localDigits.slice(6, 10);

  return `+52 ${lada} ${part1} ${part2}`;
};
