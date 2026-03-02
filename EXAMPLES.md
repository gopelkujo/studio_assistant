# Studio Assistant — Example Prompts

A quick-reference guide for testing every command in the Studio Assistant. Click a command button in the UI or type the command manually into the chat input.

---

## 📜 `/narrative` — Lead Narrative Designer

Generates branching dialogue, character lore, or quest descriptions with 3 distinct player choices.

```
/narrative A veteran soldier returns to his destroyed hometown and discovers his missing daughter left a cryptic message for him inside the ruins
```

```
/narrative Write an origin story for a corrupted AI god who once served as the last city's benevolent protector
```

---

## 📦 `/asset-brief` — Lead Art Director

Translates a concept into a technical asset brief with polycount, texture resolution, and PBR material specs.

```
/asset-brief A weathered sci-fi sniper rifle used by a desert mercenary faction — bolt-action, sand-worn metal, glowing scope with UV-reactive engravings
```

```
/asset-brief An abandoned subway station overgrown with bioluminescent fungus, used as a black market hideout
```

---

## 💬 `/dialogue` — Character Dialogue Writer

Produces 3 variations of a character's dialogue with stage directions for different emotional registers.

```
/dialogue [Character: Kira, a cynical rogue AI] [Scenario: She realizes the player has been lying to her about their mission objective]
```

```
/dialogue [Character: General Harkon, a war-weary commander] [Scenario: He must order a retreat for the first time in his 30-year career]
```

---

## 👁️ `/vibe-check` — Visual Mood Brief

Converts a vague idea into an actionable art brief: lighting setup, color palette, and reference mood.

```
/vibe-check A neon-lit underground black market in a post-apocalyptic megacity — feels dangerous but alive, like a midnight bazaar
```

```
/vibe-check The moment after a massive battle — a quiet, fog-covered battlefield at dawn where only the protagonist is left standing
```

---

## 🐛 `/bug-triager` — QA Bug Ticket Formatter

Turns messy raw bug descriptions into a structured, professional Jira-style ticket.

```
/bug-triager when i open my inventory after dying and respawning the items are all duplicated and some have negative quantities, if i equip one the game crashes completely
```

```
/bug-triager the tutorial skip button sometimes doesnt work on first press but if you click it twice fast it skips two steps instead of one, only happens on controller
```

---

## ⚔️ `/quest-logic` — Quest Flow Designer

Outlines a quest with a Happy Path, a Fail State, and a Unique Reward.

```
/quest-logic Infiltrate a corrupted guild hall and expose the guilty guildmaster without being detected — stealth preferred but open combat is a valid fail state
```

```
/quest-logic Help a grieving blacksmith recover her stolen family heirloom from a gang that has already sold it to three different buyers across the city
```

---

## 📧 `/summarize-email` — Studio Producer Email Drafter

Drafts a concise, professional email with a subject line and clear action items.

```
/summarize-email [Recipient: External Sound Studio] [Topic: We need to delay the audio delivery milestone by 2 weeks due to scope changes in the final act cutscenes]
```

```
/summarize-email [Recipient: Internal QA Team] [Topic: The new build dropping Friday includes a major save system rewrite — please prioritize regression testing on all save/load flows]
```

---

## Tips

- Commands are **case-sensitive** — use lowercase `/narrative`, not `/Narrative`.
- Everything after the command keyword is treated as your prompt — be as descriptive as possible for better output.
- Use **Shift+Enter** in the chat input for multiline prompts.
