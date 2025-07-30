export const lebaneseMonths = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيار",
  "حزيران", "تموز", "آب", "أيلول", "تشرين الأول",
  "تشرين الثاني", "كانون الأول",
];

export const toArabicNumber = (str) =>
  str.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

export const formatLebanese = (date) => {
  const d = new Date(date);
  const day = toArabicNumber(d.getDate().toString().padStart(2, "0"));
  const hour = toArabicNumber(d.getHours().toString().padStart(2, "0"));
  const minute = toArabicNumber(d.getMinutes().toString().padStart(2, "0"));
  const monthName = lebaneseMonths[d.getMonth()];
  return `${day} ${monthName} ${hour}:${minute}`;
};

export const formatLebaneseDayOnly = (date) => {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const label = isSameDay(d, today)
    ? "اليوم"
    : isSameDay(d, tomorrow)
    ? "غداً"
    : `${toArabicNumber(d.getDate().toString().padStart(2, "0"))} ${
        lebaneseMonths[d.getMonth()]
      }`;

  return {
    label,
    prefix: "من:",
  };
};

const arabicWeekdays = [
  "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
];

export const getArabicWeekday = (date) => arabicWeekdays[date.getDay()];

export const formatTimeArabic = (date) => {
  const hour = date.getHours();
  const arabicHour = toArabicNumber(hour.toString());
  if (hour < 12) return `الساعة ${arabicHour} صباحاً`;
  if (hour < 16) return `الساعة ${arabicHour} ظهراً`;
  if (hour < 18) return `الساعة ${arabicHour} بعد الظهر`;
  return `الساعة ${arabicHour} مساءً`;
};