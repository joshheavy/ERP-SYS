/**
 * The self-service portal is a separate design target: mobile-first, simple and
 * friendly, deliberately outside the dense console shell. It gets a plain
 * full-height frame; the portal component supplies its own compact chrome.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full overflow-y-auto bg-canvas">{children}</div>;
}
