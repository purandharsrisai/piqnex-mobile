import React, { useState } from "react";
import { Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { colors, fonts, radius, shadow } from "@/theme";
import { Button, EmptyState, Icon, Screen, Text } from "@/components/ui";
import { INFO, INFO_TITLES, CONTACT_EMAIL, type Block, type InfoPage, type Section } from "@/content/info";

/** Renders **bold** and [label](href) inline markup. */
function Rich({ text, color = colors.ink[600], size = 15.5 }: { text: string; color?: string; size?: number }) {
  const router = useRouter();
  const open = (href: string) => {
    if (href.startsWith("mailto:") || href.startsWith("http")) Linking.openURL(href).catch(() => {});
    else router.push(href as Href);
  };
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return (
    <Text color={color} style={{ fontSize: size, lineHeight: size * 1.6 }}>
      {parts.map((s, i) => {
        const b = /^\*\*([^*]+)\*\*$/.exec(s);
        if (b) return <Text key={i} variant="label" color={colors.ink[800]} style={{ fontSize: size }}>{b[1]}</Text>;
        const l = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(s);
        if (l) return <Text key={i} variant="label" color={colors.clay[600]} style={{ fontSize: size, textDecorationLine: "underline" }} onPress={() => open(l[2])} accessibilityRole="link">{l[1]}</Text>;
        return s;
      })}
    </Text>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <View style={{ gap: 10 }}>
      {blocks.map((b, i) =>
        b.t === "p" ? (
          <Rich key={i} text={b.text} />
        ) : (
          <View key={i} style={{ gap: 6 }}>
            {b.items.map((it, j) => (
              <View key={j} style={{ flexDirection: "row", gap: 10 }}>
                <Text color={colors.clay[600]} style={{ lineHeight: 24 }}>{"•"}</Text>
                <View style={{ flex: 1 }}><Rich text={it} /></View>
              </View>
            ))}
          </View>
        ),
      )}
    </View>
  );
}

function SectionView({ s }: { s: Section }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="h3">{s.title}</Text>
      <Blocks blocks={s.blocks} />
    </View>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ gap: 8, marginBottom: 4 }}>
      <Text variant="h1">{title}</Text>
      {subtitle ? <Text color={colors.ink[500]} style={{ fontSize: 15.5, lineHeight: 23 }}>{subtitle}</Text> : null}
    </View>
  );
}

function FaqItem({ q, a, last, open, onToggle }: { q: string; a: string; last: boolean; open: boolean; onToggle: () => void }) {
  return (
    <View style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.ink[100], backgroundColor: open ? colors.clay[50] : "#fff" }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={q} style={{ minHeight: 56, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ flex: 1, fontFamily: open ? fonts.bold : fonts.semibold, fontSize: 16, lineHeight: 22 }} color={open ? colors.clay[700] : colors.ink[900]}>{q}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color={open ? colors.clay[600] : colors.ink[400]} />
      </Pressable>
      {open ? <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}><Rich text={a} /></View> : null}
    </View>
  );
}

function FaqView({ page }: { page: Extract<InfoPage, { kind: "faq" }> }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const needle = query.trim().toLowerCase();
  const groups = page.groups
    .filter((g) => cat === "all" || g.title === cat)
    .map((g) => ({ ...g, items: g.items.filter((it) => !needle || it.q.toLowerCase().includes(needle) || it.a.toLowerCase().includes(needle)) }))
    .filter((g) => g.items.length > 0);
  return (
    <>
      <Header title={page.title} subtitle={page.subtitle} />
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.ink[200], paddingHorizontal: 16, backgroundColor: "#fff" }}>
          <Icon name="search-outline" size={18} color={colors.ink[400]} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search questions" placeholderTextColor={colors.ink[400]} autoCorrect={false} returnKeyType="search" accessibilityLabel="Search questions" style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15.5, color: colors.ink[900] }} />
          {query ? <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search"><Icon name="close-circle" size={18} color={colors.ink[300]} /></Pressable> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
          {["all", ...page.groups.map((g) => g.title)].map((t) => {
            const on = cat === t;
            return (
              <Pressable key={t} onPress={() => { setCat(t); setOpenKey(null); }} accessibilityRole="button" accessibilityState={{ selected: on }} style={{ height: 38, paddingHorizontal: 16, borderRadius: 19, justifyContent: "center", backgroundColor: on ? colors.ink[900] : colors.ink[50], borderWidth: 1, borderColor: on ? colors.ink[900] : colors.ink[100] }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 14, lineHeight: 19 }} color={on ? "#fff" : colors.ink[700]}>{t === "all" ? "All" : t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      {groups.length === 0 ? (
        <EmptyState icon="search-outline" title="No matching questions" message="Try different words, or contact us and we'll help." />
      ) : groups.map((g) => (
        <View key={g.title} style={{ gap: 10 }}>
          <Text variant="h3">{g.title}</Text>
          <View style={{ borderWidth: 1, borderColor: colors.ink[100], borderRadius: radius.lg, backgroundColor: "#fff", overflow: "hidden", ...shadow.card }}>
            {g.items.map((it, i) => {
              const key = g.title + "|" + it.q;
              return <FaqItem key={key} q={it.q} a={it.a} last={i === g.items.length - 1} open={openKey === key} onToggle={() => setOpenKey(openKey === key ? null : key)} />;
            })}
          </View>
        </View>
      ))}
      <View style={{ backgroundColor: colors.ink[900], borderRadius: radius.xl, padding: 20, gap: 14, alignItems: "center" }}>
        <Text variant="h3" color="#fff">Still need help?</Text>
        <View style={{ flexDirection: "row", gap: 10, alignSelf: "stretch" }}>
          <View style={{ flex: 1 }}><Button title="Contact us" onPress={() => router.push("/contact")} /></View>
          <View style={{ flex: 1 }}><Button title="Email" variant="outline" onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})} /></View>
        </View>
      </View>
    </>
  );
}

function DocSection({ s, open, onToggle, last }: { s: Section; open: boolean; onToggle: () => void; last: boolean }) {
  return (
    <View style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.ink[100], backgroundColor: open ? colors.clay[50] : "#fff" }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={s.title} style={{ minHeight: 58, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 16, lineHeight: 22 }} color={open ? colors.clay[700] : colors.ink[900]}>{s.title}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color={open ? colors.clay[600] : colors.ink[400]} />
      </Pressable>
      {open ? <View style={{ paddingHorizontal: 16, paddingBottom: 18 }}><Blocks blocks={s.blocks} /></View> : null}
    </View>
  );
}

function DocView({ page }: { page: Extract<InfoPage, { kind: "doc" }> }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(page.sections[0]?.title ?? null);
  return (
    <>
      <Header title={page.title} subtitle={page.intro} />
      {page.lastUpdated ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: -14 }}>
          <Icon name="time-outline" size={16} color={colors.ink[400]} />
          <Text style={{ fontSize: 13.5, lineHeight: 19 }} color={colors.ink[500]}>Last updated {page.lastUpdated}</Text>
        </View>
      ) : null}
      <View style={{ borderWidth: 1, borderColor: colors.ink[100], borderRadius: radius.lg, backgroundColor: "#fff", overflow: "hidden", ...shadow.card }}>
        {page.sections.map((sec, i) => (
          <DocSection key={sec.title} s={sec} last={i === page.sections.length - 1} open={open === sec.title} onToggle={() => setOpen(open === sec.title ? null : sec.title)} />
        ))}
      </View>
      {page.cta ? (
        <View style={{ gap: 10 }}>
          <Button title="I need a part" onPress={() => router.push("/need")} />
          <Button title="I have a part to sell" variant="outline" onPress={() => router.push("/sell")} />
        </View>
      ) : null}
    </>
  );
}

function LegalView({ initial }: { initial: "terms" | "privacy" }) {
  const [tab, setTab] = useState<"terms" | "privacy">(initial);
  const page = INFO[tab];
  return (
    <>
      <View style={{ flexDirection: "row", backgroundColor: colors.ink[50], borderRadius: 24, padding: 4 }}>
        {([["terms", "Terms"], ["privacy", "Privacy"]] as const).map(([k, label]) => {
          const on = tab === k;
          return (
            <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: on ? colors.clay[600] : "transparent" }}>
              <Text style={{ fontFamily: on ? fonts.extrabold : fonts.semibold, fontSize: 15, lineHeight: 20 }} color={on ? "#fff" : colors.ink[500]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      {page.kind === "doc" ? <DocView key={tab} page={page} /> : null}
    </>
  );
}

export default function InfoScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const page = slug ? INFO[slug] : undefined;

  if (!page) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Not found" }} />
        <EmptyState icon="document-text-outline" title="Page not found" message="We couldn't find that page." actionLabel="Go home" onAction={() => router.replace("/")} />
      </Screen>
    );
  }

  const isLegal = slug === "terms" || slug === "privacy";
  const title = isLegal ? "Terms & Privacy" : INFO_TITLES[slug as string] ?? page.title;
  return (
    <Screen contentStyle={{ gap: 24, paddingBottom: 40 }}>
      <Stack.Screen options={{ title }} />
      {isLegal ? <LegalView initial={slug as "terms" | "privacy"} /> : null}
      {page.kind === "faq" && <FaqView page={page} />}

      {page.kind === "steps" && (
        <>
          <Header title={page.title} subtitle={page.subtitle} />
          {page.groups.map((g, gi) => {
            const brand = gi === 0;
            return (
              <View key={g.title} style={{ backgroundColor: brand ? colors.clay[600] : colors.ink[900], borderRadius: radius.xl, padding: 20, gap: 18 }}>
                <Text variant="h2" color="#fff">{g.title}</Text>
                {g.steps.map((s, i) => (
                  <View key={s.title} style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: brand ? "#fff" : colors.clay[600], alignItems: "center", justifyContent: "center" }}>
                      <Text variant="h3" color={brand ? colors.clay[700] : "#fff"}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="bodyMedium" color="#fff" style={{ fontFamily: "PlusJakartaSans_700Bold" }}>{s.title}</Text>
                      <Text color={brand ? colors.clay[50] : colors.ink[300]}>{s.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
          <SectionView s={page.extra} />
          <View style={{ gap: 10 }}>
            <Button title="I need a part" onPress={() => router.push("/need")} />
            <Button title="I have a part to sell" variant="outline" onPress={() => router.push("/sell")} />
          </View>
        </>
      )}

      {page.kind === "tips" && (
        <>
          <Header title={page.title} subtitle={page.subtitle} />
          {page.tips.map((t) => (
            <View key={t.title} style={{ borderWidth: 1, borderColor: colors.ink[100], borderRadius: radius.xl, padding: 18, gap: 8, backgroundColor: "#fff", ...shadow.card }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.clay[100], alignItems: "center", justifyContent: "center" }}>
                <Icon name={t.icon} size={22} color={colors.clay[600]} />
              </View>
              <Text variant="h3">{t.title}</Text>
              <Text color={colors.ink[600]} style={{ fontSize: 15.5, lineHeight: 23 }}>{t.body}</Text>
            </View>
          ))}
          <View style={{ backgroundColor: colors.ink[900], borderRadius: radius.xl, padding: 20, gap: 8 }}>
            <Text variant="h3" color="#fff">{page.footer.title}</Text>
            <Rich text={page.footer.text} color={colors.ink[300]} />
          </View>
        </>
      )}

      {!isLegal && page.kind === "doc" && <DocView page={page} />}
    </Screen>
  );
}
