/**
 * @param hsl {h: number, s: number, l: number}
 * @returns {50:number, 100:number, 200:number, 300:number, 400:number, 500:number, 600:number, 700:number, 800:number, 900:number, 950:number}
 * @example colorPalleteFromHslPastelColor({ h: 200, s: 50, l: 50 })
 */
export function colorPalleteFromHslPastelColor(hsl: {
  h: number;
  s: number;
  l: number;
}) {
  // Treat input color as the 300 shade
  return {
    50: `hsl(${hsl.h}, ${Math.min(hsl.s * 0.75, 30)}%, 97%)`,
    100: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, // Input color
    200: `hsl(${hsl.h}, ${Math.min(hsl.s * 1.25, 50)}%, 85%)`,
    300: `hsl(${hsl.h}, ${Math.min(hsl.s * 1.5, 60)}%, 75%)`,
    400: `hsl(${hsl.h}, ${Math.min(hsl.s * 1.75, 70)}%, 65%)`,
    500: `hsl(${hsl.h}, ${Math.min(hsl.s * 2, 80)}%, 55%)`,
    600: `hsl(${hsl.h}, ${Math.min(hsl.s * 2.125, 85)}%, 45%)`,
    700: `hsl(${hsl.h}, ${Math.min(hsl.s * 2.25, 90)}%, 35%)`,
    800: `hsl(${hsl.h}, ${Math.min(hsl.s * 2.375, 95)}%, 25%)`,
    900: `hsl(${hsl.h}, ${Math.min(hsl.s * 2.375, 95)}%, 15%)`,
    950: `hsl(${hsl.h}, ${Math.min(hsl.s * 2.375, 95)}%, 10%)`,
  };
}

// Ignore errors in all file

export function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  let r = parseInt(result![1], 16);
  let g = parseInt(result![2], 16);
  let b = parseInt(result![3], 16);

  (r /= 255), (g /= 255), (b /= 255);
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h! /= 6;
  }
  let HSL = {
    h: h,
    s: s,
    l: l,
  };

  HSL["h"] = (h as number) * 360;
  HSL["s"] = s * 100;
  HSL["l"] = l * 100;

  return HSL;
}

export function stringToHsl(str: string) {
  const onlyNumbers = str.replace(/[^0-9\.\,]/g, "");
  const [h, s, l] = onlyNumbers.split(",");
  return { h: parseFloat(h), s: parseFloat(s), l: parseFloat(l) };
}

/**
 * @param str hsl(200, 50%, 50%)
 * @returns 200, 50, 50
 */
export function stripHslString(str: string) {
  return str
    .replaceAll("hsl(", "")
    .replaceAll(")", "")
    .replaceAll("%", "")
    .replaceAll(",", "")
    .trim();
}
