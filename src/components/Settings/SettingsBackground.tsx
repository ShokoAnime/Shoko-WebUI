type Props = {
  containerHeight: number;
};

const SettingsBackground = ({ containerHeight }: Props) => (
  <div
    id="settings-background"
    className="fixed top-0 left-0 -z-10 w-full bg-cover bg-fixed opacity-20"
    // If this height feels like a hack, you figure out how to fix it
    // 3rem accounts for the top and bottom padding of the container (1.5rem each side)
    style={{
      backgroundImage: 'url(/api/v3/Image/Random/Backdrop)',
      height: `calc(${containerHeight}px + 3rem)`,
    }}
  />
);

export default SettingsBackground;
