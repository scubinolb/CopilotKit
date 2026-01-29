export function IntegrationsSelectorDarkDesktop({
  className,
  rowPositions,
  svgHeight,
}: {
  className?: string;
  rowPositions: number[];
  svgHeight: number;
}) {
  // Unique ID prefix to avoid conflicts
  const idPrefix = `dark-desktop-${svgHeight}`;

  // Connector coordinates in viewBox space
  const CONNECTOR_START_X = 0;
  const CONNECTOR_END_X = 60;
  const svgWidth = CONNECTOR_END_X;

  // Kite center at SVG vertical center (which aligns with grid center due to items-center)
  const KITE_CENTER_Y = svgHeight / 2;

  // Generate connector path - S-shaped cubic curve from center to target row
  const getConnectorPath = (targetY: number) => {
    const startX = CONNECTOR_START_X;
    const endX = CONNECTOR_END_X;

    // Proper S-curve (logistic-like): starts flat and ends flat
    // Control points at the same Y level as their anchors
    // Midpoint control points create a smooth S transition
    const cp1X = startX + (endX - startX) * 0.4;
    const cp1Y = KITE_CENTER_Y;

    const cp2X = startX + (endX - startX) * 0.6;
    const cp2Y = targetY;

    return `M${startX} ${KITE_CENTER_Y}C${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${targetY}`;
  };

  return (
    <svg
      className={className}
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dynamic connectors for each row */}
      {rowPositions.map((targetY, i) => (
        <path
          key={i}
          d={getConnectorPath(targetY)}
          stroke={`url(#${idPrefix}-connector${i})`}
          strokeWidth="2"
        />
      ))}

      <defs>
        {rowPositions.map((targetY, i) => (
          <linearGradient
            key={i}
            id={`${idPrefix}-connector${i}`}
            x1={CONNECTOR_START_X}
            y1={KITE_CENTER_Y}
            x2={CONNECTOR_END_X}
            y2={targetY}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7076D5" stopOpacity="0" />
            <stop offset="0.1" stopColor="#7076D5" />
            <stop offset="0.9" stopColor="#7076D5" />
            <stop offset="1" stopColor="#7076D5" stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}
