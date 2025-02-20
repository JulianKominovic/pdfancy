import {
  colorPalleteFromHslPastelColor,
  stringToHsl,
  stripHslString,
} from "./color";

import { Category } from "@/stores/categories";

export function applyCategoryColor(category: Category) {
  if (category.color) {
    const pallete = colorPalleteFromHslPastelColor(stringToHsl(category.color));
    document.documentElement.style.setProperty("--bg-color", category.color);

    document.documentElement.style.setProperty(
      "--heroui-content2",
      stripHslString(pallete[200])
    );
    document.documentElement.style.setProperty(
      "--heroui-content3",
      stripHslString(pallete[400])
    );

    document.documentElement.style.setProperty(
      "--heroui-primary",
      stripHslString(category.color)
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-50",
      stripHslString(pallete[50])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-100",
      stripHslString(pallete[100])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-200",
      stripHslString(pallete[200])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-300",
      stripHslString(pallete[300])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-400",
      stripHslString(pallete[400])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-500",
      stripHslString(pallete[500])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-600",
      stripHslString(pallete[600])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-700",
      stripHslString(pallete[700])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-800",
      stripHslString(pallete[800])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-900",
      stripHslString(pallete[900])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-950",
      stripHslString(pallete[950])
    );
  }
}
