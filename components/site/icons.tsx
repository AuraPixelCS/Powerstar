/* Shared inline SVGs, ported verbatim from the concept design. */

export function StarMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2.4 6.6L21 9l-5 4.2L17.6 21 12 17l-5.6 4 1.6-7.8L3 9l6.6-.4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M.5 23.5l1.7-6A11.4 11.4 0 1112 23.4a11.5 11.5 0 01-5.8-1.6L.5 23.5zM6.6 19.9l.4.2a9.5 9.5 0 105.1 1.5 9.5 9.5 0 00-2.9-15.7A9.5 9.5 0 003.5 12a9.4 9.4 0 001.4 5l.3.4-1 3.5 3.4-1zm10.9-5.1c-.1-.2-.5-.4-1-.6s-1.4-.7-1.6-.8-.4-.1-.5.2-.6.7-.7.9-.3.2-.5.1a7.8 7.8 0 01-2.3-1.4 8.6 8.6 0 01-1.6-2c-.2-.3 0-.4.1-.6l.4-.4.3-.5v-.4c0-.2-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a1 1 0 00-.7.3 2.9 2.9 0 00-.9 2.2 5 5 0 001.1 2.7 11.5 11.5 0 004.4 3.9c2.1.8 2.1.5 2.5.5a2.6 2.6 0 001.7-1.2 2.1 2.1 0 00.1-1.2z" />
    </svg>
  );
}

const socialPaths: Record<string, React.ReactNode> = {
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 22v-8h3l1-4h-4V8c0-1 .3-2 2-2h2V2.2C18.5 2.1 17.3 2 16 2c-3 0-5 1.8-5 5.2V10H8v4h3v8z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5A2.5 2.5 0 002.5 6a2.5 2.5 0 005 0 2.5 2.5 0 00-2.52-2.5zM3 8.98h4V21H3zM10 8.98h3.8v1.64h.05c.53-1 1.83-2.06 3.76-2.06C21.4 8.56 22 11 22 14.16V21h-4v-6.06c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4z" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 3c.3 2.3 1.8 3.9 4 4.1v3c-1.5 0-2.9-.5-4-1.3v6.4A6.2 6.2 0 119.8 9v3.1A3.1 3.1 0 1013 15V3z" />
    </svg>
  ),
};

export function SocialIcon({ name }: { name: string }) {
  return <>{socialPaths[name] ?? null}</>;
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
