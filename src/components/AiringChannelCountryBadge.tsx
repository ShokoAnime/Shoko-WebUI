// One shared formatter: the names come from the browser, in English like the rest of the WebUI.
const regionNames = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' });

const getCountryName = (countryCode: string) => {
  try {
    return regionNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
};

/** A channel's country as a small badge with its two-letter code, named in the tooltip. Nothing without a country. */
const AiringChannelCountryBadge = ({ countryCode }: { countryCode: string | null | undefined }) => {
  if (!countryCode) return null;
  return (
    <span
      className="shrink-0 rounded-sm border border-panel-border px-1 text-xs opacity-80"
      data-tooltip-id="tooltip"
      data-tooltip-content={getCountryName(countryCode)}
    >
      {countryCode.toUpperCase()}
    </span>
  );
};

export default AiringChannelCountryBadge;
