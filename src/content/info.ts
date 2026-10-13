/** Static help/legal content, ported from the website (piqnex-frontend/src/app/{faq,how-it-works,safety,terms,privacy,about}).
 *  Inline markup: **bold** and [label](/route or mailto:...). */
import type { IconName } from "@/components/ui";

export const CONTACT_EMAIL = "support@piqnex.com";

export type Block = { t: "p"; text: string } | { t: "ul"; items: string[] };
export interface Section { title: string; blocks: Block[] }

export interface FaqGroup { title: string; items: { q: string; a: string }[] }
export interface Step { title: string; body: string }
export interface Tip { icon: IconName; title: string; body: string }

export type InfoPage =
  | { kind: "faq"; title: string; subtitle: string; groups: FaqGroup[] }
  | { kind: "steps"; title: string; subtitle: string; groups: { title: string; steps: Step[] }[]; extra: Section }
  | { kind: "tips"; title: string; subtitle: string; tips: Tip[]; footer: { title: string; text: string } }
  | { kind: "doc"; title: string; intro: string; lastUpdated?: string; sections: Section[]; cta?: boolean };

const p = (text: string): Block => ({ t: "p", text });
const ul = (...items: string[]): Block => ({ t: "ul", items });

export const INFO: Record<string, InfoPage> = {
  faq: {
    kind: "faq",
    title: "Frequently asked questions",
    subtitle: "Quick answers about finding, buying and selling spare parts on Piqnex.",
    groups: [
      {
        title: "Getting started",
        items: [
          { q: "What is Piqnex?", a: "Piqnex is a marketplace for single spare and replacement parts - a lost earbud, a laptop charger, a controller battery cover. If you're missing one piece, you can find it here, and if you have a spare, you can list it." },
          { q: "Does it cost anything to join?", a: "No. Creating an account is free." },
          { q: "Do I need an account to browse?", a: "You can browse listings without one. You’ll need a free account to list a part, post a request or message a seller. [Create an account](/signup)." },
        ],
      },
      {
        title: "Finding a part",
        items: [
          { q: "How do I find a specific part?", a: "Use the Browse tab to search and filter by category, brand, product, model, part, condition, price and location. Or go to [I need a part](/need) and tell us exactly what you have and what’s missing." },
          { q: "What does \"exact match\" mean?", a: "We only show a listing as a match for your request when the brand, product, model and part all line up. We'd rather show fewer, confirmed matches than a long list of maybes." },
          { q: "Nobody has my part listed. What now?", a: "Save a need request. Sellers who list a matching part later will see there is demand for it." },
          { q: "What are \"Sample\" listings?", a: "While the marketplace is new, some listings are demo data so the app doesn't look empty. They're clearly tagged Sample and have no real seller to contact." },
        ],
      },
      {
        title: "Buying",
        items: [
          { q: "How do I contact a seller?", a: "Open a listing and use the Contact seller button. Write a short message and add the contact detail you want them to use (phone, email or WhatsApp). It is shown only to the seller." },
          { q: "How do I pay for a part?", a: "Piqnex doesn't handle payments or delivery. You agree the price, payment and handover directly with the seller. Please read our [safety tips](/info/safety) first." },
          { q: "How do I know a part will fit?", a: "Check the brand, product, model and condition on the listing, and ask the seller for photos or part numbers before you commit." },
        ],
      },
      {
        title: "Selling",
        items: [
          { q: "How do I list a part?", a: "Log in and tap Sell. Add the brand, product, model, part, condition, price, photos and a short description." },
          { q: "How do I mark a part as sold or remove it?", a: "Open [My listings](/my-listings) from your Profile. Each listing has options to mark it sold or delete it." },
          { q: "Can I sell anything?", a: "Piqnex is for individuals passing on spare or leftover parts, not bulk resellers. See our [Terms](/info/terms) for what isn’t allowed." },
        ],
      },
      {
        title: "Account",
        items: [
          { q: "I forgot my password.", a: "Use [Forgot password](/forgot-password) on the log in screen and we’ll help you set a new one." },
          { q: "How is my data used?", a: "See our [Privacy Policy](/info/privacy)." },
        ],
      },
    ],
  },

  "how-it-works": {
    kind: "steps",
    title: "How it works",
    subtitle: "Don’t replace the whole product. Replace the missing piece. Most products don't break completely - they just lose one part. A left earbud. A laptop charger. A controller battery cover. Piqnex connects people who need that exact part with people who happen to have a spare one.",
    groups: [
      {
        title: "If you're missing a part",
        steps: [
          { title: "Tell us what you're missing", body: "Product, exact model, and the part you need." },
          { title: "Find a matching part", body: "We search active listings for an exact match." },
          { title: "Connect with the seller", body: "Message them directly and work out the details." },
        ],
      },
      {
        title: "If you have a spare part",
        steps: [
          { title: "Tell us what you have", body: "A spare, unused or leftover component from any product." },
          { title: "List the part", body: "Add condition, price, photos and a short description." },
          { title: "Meet someone who needs it", body: "We surface your listing to matching buyers." },
        ],
      },
    ],
    extra: {
      title: "Why exact matching matters",
      blocks: [p("We don’t guess at compatibility. A listing is only surfaced as a match for your request when the brand, product, model, and part all line up. As the catalog grows, we’ll layer in smarter compatibility suggestions (e.g. “this charger also fits models X and Y”) - but we’ll always be upfront about what’s a confirmed match versus a possible one.")],
    },
  },

  safety: {
    kind: "tips",
    title: "Buy and sell safely",
    subtitle: "Piqnex connects individuals, so a little care goes a long way. These tips apply to both buyers and sellers.",
    tips: [
      { icon: "checkmark-circle-outline", title: "Check the match first", body: "Confirm the brand, product, model and part number before you pay. Ask for photos of the part and, if you can, of the label or serial area." },
      { icon: "location-outline", title: "Meet somewhere public", body: "If you're handing over a part in person, choose a busy, well-lit place and go during the day. Consider bringing a friend." },
      { icon: "cash-outline", title: "Pay on your terms", body: "Piqnex doesn't handle payments or delivery. Be wary of sellers who ask for payment upfront for a part you haven't seen, or who refuse a quick call or video check." },
      { icon: "camera-outline", title: "Test before you pay", body: "Where possible, test the part with your own device at handover. Look for damage and confirm it works as described." },
      { icon: "key-outline", title: "Keep your details private", body: "Share only what's needed to complete the sale. Never share passwords, OTPs, banking logins or ID documents - we will never ask for them." },
      { icon: "warning-outline", title: "Trust your instincts", body: "If a deal feels too good to be true, or the other person is pressuring you to act fast, walk away." },
    ],
    footer: {
      title: "Something doesn’t look right?",
      text: `If you come across a suspicious listing, an abusive message or anything that makes you uncomfortable, email us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) with a link to the listing. See also our [FAQ](/info/faq) and [Terms](/info/terms).`,
    },
  },

  terms: {
    kind: "doc",
    title: "Terms & Conditions",
    lastUpdated: "25 September 2026",
    intro: "Please read these terms carefully. By creating an account or using Piqnex, you agree to them.",
    sections: [
      { title: "1. About these terms", blocks: [p("These Terms & Conditions (“Terms”) govern your use of the Piqnex app and services (“Piqnex”, “we”, “us”). If you do not agree with them, please do not use Piqnex.")] },
      { title: "2. What Piqnex is", blocks: [p("Piqnex is a platform that helps people who need a specific replacement part find people who have one. We provide the listings, requests, matching, and contact tools. **We are not a party to any sale, do not own or inspect the items listed, and do not handle payments or delivery.** Any transaction is strictly between the buyer and the seller.")] },
      { title: "3. Your account", blocks: [ul(
        "You must be at least 18 years old, or have a parent or guardian’s consent, to use Piqnex.",
        "The information you give us must be accurate and kept up to date.",
        "You are responsible for keeping your login details secure and for all activity under your account.",
        "One person, one account. Accounts may not be sold or transferred.",
      )] },
      { title: "4. Listings and requests", blocks: [p("When you post a listing (“I Have”) or a request (“I Need”), you agree that:"), ul(
        "You own the item you list, or are authorised to sell it.",
        "Descriptions, condition, photos, and prices are honest and accurate, and match the actual item.",
        "You will mark listings as sold or remove them once they are no longer available.",
        "You give Piqnex permission to display, store, and format your listing content so it can be shown on the platform.",
      )] },
      { title: "5. Prohibited items and conduct", blocks: [p("You must not use Piqnex to:"), ul(
        "List stolen, counterfeit, recalled, or unsafe items, or anything illegal to sell.",
        "Post misleading, fraudulent, abusive, or spam content.",
        "Harass other users or misuse their contact details.",
        "Scrape, reverse-engineer, overload, or otherwise interfere with the platform or its security.",
      ), p("We may remove content or suspend accounts that break these rules, without notice.")] },
      { title: "6. Dealing with other users", blocks: [p("Please use common sense when buying or selling: confirm compatibility, meet in safe public places, inspect items before paying, and never share sensitive financial information. Matches shown by Piqnex are based on the details users provide - we cannot guarantee that a part will fit or work.")] },
      { title: "7. Disclaimer and limitation of liability", blocks: [p("Piqnex is provided “as is” and “as available.” To the fullest extent permitted by law, we make no warranties about the platform or any item listed on it, and we are not liable for any loss or damage arising from transactions between users, from the quality, safety, or legality of items, or from your use of the platform.")] },
      { title: "8. Ending your use of Piqnex", blocks: [p("You can stop using Piqnex at any time. We may suspend or close accounts that violate these Terms or put other users at risk.")] },
      { title: "9. Changes to these terms", blocks: [p("We may update these Terms from time to time. When we do, we’ll change the “Last updated” date above. Continuing to use Piqnex after a change means you accept the updated Terms.")] },
      { title: "10. Governing law", blocks: [p("These Terms are governed by the laws of India, and any disputes are subject to the jurisdiction of the courts of India.")] },
      { title: "11. Contact", blocks: [p(`Questions about these Terms? Email us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). See also our [Privacy Policy](/info/privacy).`)] },
    ],
  },

  privacy: {
    kind: "doc",
    title: "Privacy Policy",
    lastUpdated: "25 September 2026",
    intro: "Your privacy matters to us. This policy explains what we collect, why, and what you can do about it.",
    sections: [
      { title: "1. Information we collect", blocks: [p("We only collect what we need to run the marketplace:"), ul(
        "**Account details** - your email address, password (stored securely, never in plain text), and display name.",
        "**Profile details** - your location and profile picture, if you choose to add them.",
        "**Listings and requests** - the parts you list or request, including descriptions, condition, price, location, and photos.",
        "**Messages** - contact requests you send to sellers, including any contact information you include in them.",
        "**Technical data** - basic information such as device type and the sign-in token needed to keep you signed in.",
      )] },
      { title: "2. How we use it", blocks: [ul(
        "To create and manage your account and keep you signed in.",
        "To show your listings and requests, and match them with other users.",
        "To pass your contact requests on to the relevant seller.",
        "To keep Piqnex safe, prevent fraud, and enforce our Terms.",
        "To understand how Piqnex is used and improve it.",
      ), p("We do not sell your personal information.")] },
      { title: "3. What other users can see", blocks: [p("Your display name, location, and the listings and requests you post are visible to other visitors - that’s how buyers and sellers find each other. When you send a contact request, the seller can see your message and any contact details you choose to include. Your email address is not shown publicly.")] },
      { title: "4. Service providers", blocks: [p("We use trusted third-party providers to run Piqnex, such as our database, authentication, file storage, and hosting providers. They process data on our behalf and only as needed to provide their services. Your data may be stored on servers outside your country."), p("We may also share information if required by law, or to protect the rights and safety of our users or the public.")] },
      { title: "5. Cookies and local storage", blocks: [p("We use essential storage to keep you signed in and to make the app work. We do not use advertising trackers.")] },
      { title: "6. How long we keep data", blocks: [p("We keep your information for as long as your account is active. If you delete your account, your profile, listings, requests, and messages are deleted, except where we need to keep limited records for legal or security reasons.")] },
      { title: "7. Your choices and rights", blocks: [ul(
        "You can view and edit your profile, listings, and requests at any time from your [profile](/profile).",
        "You can ask us for a copy of your data, to correct it, or to delete your account by emailing us. You can also delete your account from Settings.",
      )] },
      { title: "8. Security", blocks: [p("We use industry-standard measures to protect your information, including encrypted connections and access controls. No online service is completely secure, so please use a strong, unique password.")] },
      { title: "9. Children", blocks: [p("Piqnex is not intended for children under 18 without a parent or guardian’s consent, and we do not knowingly collect their data.")] },
      { title: "10. Changes to this policy", blocks: [p("We may update this policy from time to time. When we do, we’ll change the “Last updated” date above.")] },
      { title: "11. Contact", blocks: [p(`Questions or requests about your privacy? Email us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). See also our [Terms & Conditions](/info/terms).`)] },
    ],
  },

  about: {
    kind: "doc",
    title: "About us",
    intro: "Piqnex exists for one simple reason: most products don’t break completely - they just lose one piece.",
    cta: true,
    sections: [
      { title: "The problem", blocks: [
        p("A lost left earbud. A frayed laptop charger. A missing controller battery cover. When a single part goes missing, the usual options are to hunt for an official replacement that may not exist, or to throw the whole product away and buy a new one. That’s expensive for you and wasteful for everyone."),
        p("Meanwhile, drawers everywhere are full of perfectly good spare parts - the leftover earbud from a set someone replaced, the charger from a laptop that died, the cover from a controller that broke."),
      ] },
      { title: "What we do", blocks: [p("Piqnex connects those two groups. If you need a part, post an “I Need” request with the exact brand, product, model, and part. If you have one to spare, list it under “I Have.” We match requests and listings only when those details line up, so you’re not left guessing about compatibility.")] },
      { title: "What we believe", blocks: [ul(
        "**Repair beats replace.** Keeping a product working with one part is better than sending it to landfill.",
        "**Exact over approximate.** We’d rather show you fewer, confirmed matches than a long list of maybes.",
        "**People first.** Piqnex is a place for individuals to help each other out, not a storefront for bulk resellers.",
      )] },
      { title: "Where we are", blocks: [p(`Piqnex is an early build. We’re still growing the parts catalog and learning from the people who use it. If you have feedback, ideas, or just want to say hello, write to us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`)] },
    ],
  },
};

export const INFO_TITLES: Record<string, string> = {
  faq: "FAQ", "how-it-works": "How it works", safety: "Safety tips", terms: "Terms & Conditions", privacy: "Privacy Policy", about: "About us",
};
