// DSL grammar the server accepts (LogService.TryParseLogFilterDsl): a mode char first — c: contains,
// =: equals, ^: starts, $: ends, ~: fuzzy, *: regex — optionally followed by at most one ! (negate)
// and one # (case-insensitive) in either order, then ':'. ! and # are modifiers, never prefixes on
// their own (e.g. "!c:foo" or "#:foo" are server-side 400s). A bare value is shorthand for "c:"
// (case-sensitive contains), so we make it case-insensitive by default unless the user typed valid
// DSL themselves; anything else gets wrapped as a literal.
const hasDslPrefix = (value: string) => /^[c=^$~*](?:!#|#!|!|#)?:/.test(value);

export const toServerSearch = (value: string) => (!value || hasDslPrefix(value) ? value : `c#:${value}`);
