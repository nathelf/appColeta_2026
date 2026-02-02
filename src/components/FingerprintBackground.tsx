export function FingerprintBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#e8e4dc]">
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="fingerprint-pattern" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
            {/* Top left fingerprint */}
            <g transform="translate(50, 50)">
              <circle cx="0" cy="0" r="15" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="25" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="35" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="45" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="55" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="65" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="75" fill="none" stroke="#c9a961" strokeWidth="3" />
            </g>
            
            {/* Top right fingerprint */}
            <g transform="translate(350, 50)">
              <circle cx="0" cy="0" r="15" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="25" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="35" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="45" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="55" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="65" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="75" fill="none" stroke="#c9a961" strokeWidth="3" />
            </g>
            
            {/* Bottom left fingerprint */}
            <g transform="translate(50, 350)">
              <circle cx="0" cy="0" r="15" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="25" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="35" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="45" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="55" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="65" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="75" fill="none" stroke="#c9a961" strokeWidth="3" />
            </g>
            
            {/* Bottom right fingerprint */}
            <g transform="translate(350, 350)">
              <circle cx="0" cy="0" r="15" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="25" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="35" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="45" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="55" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="65" fill="none" stroke="#c9a961" strokeWidth="3" />
              <circle cx="0" cy="0" r="75" fill="none" stroke="#c9a961" strokeWidth="3" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fingerprint-pattern)" />
      </svg>
    </div>
  );
}
