/** Combina classes condicionalmente sem dependência externa (evita instalar clsx). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
