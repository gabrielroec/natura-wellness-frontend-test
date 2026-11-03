const paths = {
  box: "M3 6.5 10 3l7 3.5v7L10 17l-7-3.5v-7Z M3 6.5 10 10l7-3.5 M10 10v7",
  tag: "M3 3h6.5l7.5 7.5-6.5 6.5L3 9.5V3Z M7.5 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
  swap: "M4 7h12 M13 4l3 3-3 3 M16 13H4 M7 10l-3 3 3 3",
  results: "M3 17h14 M4 13l4-4 3 3 5-6",
  message: "M3 4h14v10H8l-4 3v-3H3V4Z",
  calendar: "M4 5h12v12H4V5Z M4 9h12 M7 3v4 M13 3v4",
  truck: "M2 5h10v9H2V5Z M12 8h3l3 3v3h-6 M7 15.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z M16 15.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  ticket: "M3 6h14v3a1.5 1.5 0 0 0 0 3v3H3v-3a1.5 1.5 0 0 0 0-3V6Z M12 6v1.5 M12 9.75v1.5 M12 13.5V15",
  pause: "M7 4v12 M13 4v12",
  minus: "M4 10h12",
  close: "m5 5 10 10 M15 5 5 15",
  refresh: "M16 10a6 6 0 1 1-1.8-4.3 M16 3v3.5h-3.5",
};

export type CancelIconName = keyof typeof paths;

export function CancelIcon({ name }: { name: CancelIconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
