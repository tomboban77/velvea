type IconProps = { className?: string };

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.3-1.4 1.5-1.4h1.3V5.5c-.6-.1-1.4-.2-2.3-.2-2.3 0-3.8 1.4-3.8 3.9v2H7.8V14h2.1v7h3.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PinterestIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9.3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.7 17.5c-.3-1 .1-2.3.4-3.4.3-1.2.9-3.4.9-3.4-.2-.4-.3-1-.3-1.5 0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.5 0 .9-.6 2.3-.9 3.6-.2.9.5 1.7 1.4 1.7 1.7 0 2.9-2.2 2.9-4.7 0-2-1.3-3.4-3.7-3.4-2.7 0-4.3 2-4.3 4 0 .8.3 1.4.7 1.8.1.1.1.2.1.4l-.2.9c0 .2-.2.3-.4.2-1.1-.5-1.7-1.8-1.7-3.2 0-2.4 2-5.3 5.9-5.3 3.1 0 5.2 2.3 5.2 4.7 0 3.2-1.8 5.6-4.4 5.6-.9 0-1.7-.5-2-1 0 0-.5 1.9-.6 2.3-.2.7-.6 1.4-.9 1.9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TiktokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 3.5v10.8a3.3 3.3 0 1 1-2.5-3.2m2.5-4c.5 1.9 2 3.4 4 3.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
