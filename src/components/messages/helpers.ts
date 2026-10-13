import { formatTime } from "@/lib/utils";

export const BUYER_REPLIES = ["Is this still available?", "Can you share more photos?", "Where can I pick it up?", "What's your best price?"];
export const SELLER_REPLIES = ["Yes, it's still available", "I can share more photos", "Your offer works for me", "Sorry, that's too low for me"];

export const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function dayLabel(iso: string) {
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(new Date()) - startOf(d)) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export const timeOf = formatTime;
