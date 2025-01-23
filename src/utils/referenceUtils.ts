/**
 * Checks if a string is a Hydra reference (starts with "${" and ends with "}")
 */
export function isHydraReference(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return value.startsWith("${") && value.endsWith("}");
}
