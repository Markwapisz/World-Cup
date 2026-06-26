import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Check,
  Medal,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "family-world-cup-pool-v1";
const LOCAL_BACKUPS_KEY = "family-world-cup-pool-local-backups-v1";
const MAX_LOCAL_BACKUPS = 30;
const SCHEDULE_VERSION = "fifa-2026-netherlands-sweden-start-109";
const CLOUD_ROW_ID = "main";
const MONTANA_TIME_ZONE = "America/Denver";
const FIRST_ACTIVE_MATCH_ID = "m35";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const CLOUD_SYNC_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const removedMatchStages = new Set([
  "Round of 32",
  "Round of 16",
  "Quarterfinal",
  "Semifinal",
  "Third-place match",
  "Final",
]);

const seedTeams = [
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Bosnia and Herzegovina",
  "Brazil",
  "Cabo Verde",
  "Canada",
  "Colombia",
  "Congo DR",
  "Croatia",
  "Curaçao",
  "Czechia",
  "Côte d'Ivoire",
  "Ecuador",
  "Egypt",
  "England",
  "France",
  "Germany",
  "Ghana",
  "Haiti",
  "Iran",
  "Iraq",
  "Japan",
  "Jordan",
  "Korea Republic",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Panama",
  "Paraguay",
  "Portugal",
  "Qatar",
  "Saudi Arabia",
  "Scotland",
  "Senegal",
  "South Africa",
  "Spain",
  "Sweden",
  "Switzerland",
  "Tunisia",
  "Turkey",
  "United States",
  "Uruguay",
  "Uzbekistan",
];

const seedMatches = [
  { id: "m1", date: "2026-06-11", stage: "Group A", home: "Mexico", away: "South Africa", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m2", date: "2026-06-12", stage: "Group A", home: "Korea Republic", away: "Czechia", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m3", date: "2026-06-12", stage: "Group B", home: "Canada", away: "Bosnia and Herzegovina", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m4", date: "2026-06-13", stage: "Group D", home: "United States", away: "Paraguay", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m5", date: "2026-06-14", stage: "Group C", home: "Haiti", away: "Scotland", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m6", date: "2026-06-14", stage: "Group D", home: "Australia", away: "Turkey", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m7", date: "2026-06-13", stage: "Group C", home: "Brazil", away: "Morocco", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m8", date: "2026-06-13", stage: "Group B", home: "Qatar", away: "Switzerland", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m9", date: "2026-06-14", stage: "Group E", home: "Côte d'Ivoire", away: "Ecuador", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m10", date: "2026-06-14", stage: "Group E", home: "Germany", away: "Curaçao", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m11", date: "2026-06-14", stage: "Group F", home: "Netherlands", away: "Japan", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m12", date: "2026-06-15", stage: "Group F", home: "Sweden", away: "Tunisia", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m13", date: "2026-06-15", stage: "Group H", home: "Saudi Arabia", away: "Uruguay", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m14", date: "2026-06-15", stage: "Group H", home: "Spain", away: "Cabo Verde", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m15", date: "2026-06-16", stage: "Group G", home: "Iran", away: "New Zealand", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m16", date: "2026-06-15", stage: "Group G", home: "Belgium", away: "Egypt", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m17", date: "2026-06-16", stage: "Group I", home: "France", away: "Senegal", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m18", date: "2026-06-16", stage: "Group I", home: "Iraq", away: "Norway", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m19", date: "2026-06-17", stage: "Group J", home: "Argentina", away: "Algeria", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m20", date: "2026-06-17", stage: "Group J", home: "Austria", away: "Jordan", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m21", date: "2026-06-17", stage: "Group L", home: "Ghana", away: "Panama", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m22", date: "2026-06-17", stage: "Group L", home: "England", away: "Croatia", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m23", date: "2026-06-17", stage: "Group K", home: "Portugal", away: "Congo DR", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m24", date: "2026-06-18", stage: "Group K", home: "Uzbekistan", away: "Colombia", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m25", date: "2026-06-18", stage: "Group A", home: "Czechia", away: "South Africa", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m26", date: "2026-06-18", stage: "Group B", home: "Switzerland", away: "Bosnia and Herzegovina", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m27", date: "2026-06-18", stage: "Group B", home: "Canada", away: "Qatar", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m28", date: "2026-06-19", stage: "Group A", home: "Mexico", away: "Korea Republic", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m29", date: "2026-06-20", stage: "Group C", home: "Brazil", away: "Haiti", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m30", date: "2026-06-19", stage: "Group C", home: "Scotland", away: "Morocco", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m31", date: "2026-06-20", stage: "Group D", home: "Turkey", away: "Paraguay", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m32", date: "2026-06-19", stage: "Group D", home: "United States", away: "Australia", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m33", date: "2026-06-20", stage: "Group E", home: "Germany", away: "Côte d'Ivoire", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m34", date: "2026-06-20", stage: "Group E", home: "Ecuador", away: "Curaçao", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m35", date: "2026-06-20", stage: "Group F", home: "Netherlands", away: "Sweden", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m36", date: "2026-06-20", stage: "Group F", home: "Tunisia", away: "Japan", homeScore: "", awayScore: "", resultUpdatedAt: "", timeMt: "10:00 PM" },
  { id: "m37", date: "2026-06-21", stage: "Group H", home: "Uruguay", away: "Cabo Verde", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m38", date: "2026-06-21", stage: "Group H", home: "Spain", away: "Saudi Arabia", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m39", date: "2026-06-21", stage: "Group G", home: "Belgium", away: "Iran", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m40", date: "2026-06-21", stage: "Group G", home: "New Zealand", away: "Egypt", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m41", date: "2026-06-22", stage: "Group I", home: "Norway", away: "Senegal", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m42", date: "2026-06-22", stage: "Group I", home: "France", away: "Iraq", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m43", date: "2026-06-22", stage: "Group J", home: "Argentina", away: "Austria", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m44", date: "2026-06-22", stage: "Group J", home: "Jordan", away: "Algeria", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m45", date: "2026-06-23", stage: "Group L", home: "England", away: "Ghana", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m46", date: "2026-06-23", stage: "Group L", home: "Panama", away: "Croatia", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m47", date: "2026-06-23", stage: "Group K", home: "Portugal", away: "Uzbekistan", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m48", date: "2026-06-23", stage: "Group K", home: "Colombia", away: "Congo DR", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m49", date: "2026-06-24", stage: "Group C", home: "Scotland", away: "Brazil", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m50", date: "2026-06-24", stage: "Group C", home: "Morocco", away: "Haiti", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m51", date: "2026-06-24", stage: "Group B", home: "Switzerland", away: "Canada", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m52", date: "2026-06-24", stage: "Group B", home: "Bosnia and Herzegovina", away: "Qatar", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m53", date: "2026-06-24", stage: "Group A", home: "Czechia", away: "Mexico", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m54", date: "2026-06-24", stage: "Group A", home: "South Africa", away: "Korea Republic", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m55", date: "2026-06-25", stage: "Group E", home: "Curaçao", away: "Côte d'Ivoire", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m56", date: "2026-06-25", stage: "Group E", home: "Ecuador", away: "Germany", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m57", date: "2026-06-25", stage: "Group F", home: "Japan", away: "Sweden", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m58", date: "2026-06-25", stage: "Group F", home: "Tunisia", away: "Netherlands", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m59", date: "2026-06-25", stage: "Group D", home: "Turkey", away: "United States", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m60", date: "2026-06-25", stage: "Group D", home: "Paraguay", away: "Australia", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m61", date: "2026-06-26", stage: "Group I", home: "Norway", away: "France", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m62", date: "2026-06-26", stage: "Group I", home: "Senegal", away: "Iraq", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m63", date: "2026-06-26", stage: "Group G", home: "Egypt", away: "Iran", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m64", date: "2026-06-26", stage: "Group G", home: "New Zealand", away: "Belgium", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m65", date: "2026-06-26", stage: "Group H", home: "Cabo Verde", away: "Saudi Arabia", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m66", date: "2026-06-26", stage: "Group H", home: "Uruguay", away: "Spain", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m67", date: "2026-06-27", stage: "Group L", home: "Panama", away: "England", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m68", date: "2026-06-27", stage: "Group L", home: "Croatia", away: "Ghana", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m69", date: "2026-06-27", stage: "Group J", home: "Algeria", away: "Austria", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m70", date: "2026-06-27", stage: "Group J", home: "Jordan", away: "Argentina", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m71", date: "2026-06-27", stage: "Group K", home: "Colombia", away: "Portugal", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m72", date: "2026-06-27", stage: "Group K", home: "Congo DR", away: "Uzbekistan", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m73", date: "2026-06-28", stage: "Round of 32", home: "Group A Runner-Up", away: "Group B Runner-Up", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m74", date: "2026-06-29", stage: "Round of 32", home: "Group E Winner", away: "Group A/B/C/D/F 3rd Place", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m75", date: "2026-06-30", stage: "Round of 32", home: "Group F Winner", away: "Group C Runner-Up", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m76", date: "2026-06-29", stage: "Round of 32", home: "Group C Winner", away: "Group F Runner-Up", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m77", date: "2026-06-30", stage: "Round of 32", home: "Group I Winner", away: "Group C/D/F/G/H 3rd Place", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m78", date: "2026-06-30", stage: "Round of 32", home: "Group E Runner-Up", away: "Group I Runner-Up", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m79", date: "2026-07-01", stage: "Round of 32", home: "Group A Winner", away: "Group C/E/F/H/I 3rd Place", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m80", date: "2026-07-01", stage: "Round of 32", home: "Group L Winner", away: "Group E/H/I/J/K 3rd Place", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m81", date: "2026-07-02", stage: "Round of 32", home: "Group D Winner", away: "Group B/E/F/I/J 3rd Place", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m82", date: "2026-07-01", stage: "Round of 32", home: "Group G Winner", away: "Group A/E/H/I/J 3rd Place", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m83", date: "2026-07-02", stage: "Round of 32", home: "Group K Runner-Up", away: "Group L Runner-Up", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m84", date: "2026-07-02", stage: "Round of 32", home: "Group H Winner", away: "Group J Runner-Up", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m85", date: "2026-07-03", stage: "Round of 32", home: "Group B Winner", away: "Group E/F/G/I/J 3rd Place", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m86", date: "2026-07-03", stage: "Round of 32", home: "Group J Winner", away: "Group H Runner-Up", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m87", date: "2026-07-04", stage: "Round of 32", home: "Group K Winner", away: "Group D/E/I/J/L 3rd Place", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m88", date: "2026-07-03", stage: "Round of 32", home: "Group D Runner-Up", away: "Group G Runner-Up", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m89", date: "2026-07-04", stage: "Round of 16", home: "Match 74 Winner", away: "Match 77 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m90", date: "2026-07-04", stage: "Round of 16", home: "Match 73 Winner", away: "Match 75 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m91", date: "2026-07-05", stage: "Round of 16", home: "Match 76 Winner", away: "Match 78 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m92", date: "2026-07-06", stage: "Round of 16", home: "Match 79 Winner", away: "Match 80 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m93", date: "2026-07-06", stage: "Round of 16", home: "Match 83 Winner", away: "Match 84 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m94", date: "2026-07-07", stage: "Round of 16", home: "Match 81 Winner", away: "Match 82 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m95", date: "2026-07-07", stage: "Round of 16", home: "Match 86 Winner", away: "Match 88 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m96", date: "2026-07-07", stage: "Round of 16", home: "Match 85 Winner", away: "Match 87 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m97", date: "2026-07-09", stage: "Quarterfinal", home: "Match 89 Winner", away: "Match 90 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m98", date: "2026-07-10", stage: "Quarterfinal", home: "Match 93 Winner", away: "Match 94 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m99", date: "2026-07-11", stage: "Quarterfinal", home: "Match 91 Winner", away: "Match 92 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m100", date: "2026-07-12", stage: "Quarterfinal", home: "Match 95 Winner", away: "Match 96 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m101", date: "2026-07-14", stage: "Semifinal", home: "Match 97 Winner", away: "Match 98 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m102", date: "2026-07-15", stage: "Semifinal", home: "Match 99 Winner", away: "Match 100 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m103", date: "2026-07-18", stage: "Third-place match", home: "Match 101 Loser", away: "Match 102 Loser", homeScore: "", awayScore: "", resultUpdatedAt: "" },
  { id: "m104", date: "2026-07-19", stage: "Final", home: "Match 101 Winner", away: "Match 102 Winner", homeScore: "", awayScore: "", resultUpdatedAt: "" },
];

const seedPlayers = [
  { id: "p1", name: "Grandma", champion: "Brazil", championLocked: true },
  { id: "p2", name: "Dad", champion: "United States", championLocked: true },
  { id: "p3", name: "Cousin Alex", champion: "Argentina", championLocked: true },
];

const seedPicks = [];
const firstActiveMatchNumber = Number(FIRST_ACTIVE_MATCH_ID.replace("m", ""));

function matchNumber(matchId) {
  const match = String(matchId || "").match(/^m(\d+)$/);
  return match ? Number(match[1]) : null;
}

function isBeforeFirstActiveMatch(match) {
  const number = matchNumber(match.id);
  return number !== null && number < firstActiveMatchNumber;
}

function isRemovedMatch(match) {
  return isBeforeFirstActiveMatch(match) || removedMatchStages.has(match.stage);
}

const activeScheduleMatches = seedMatches.filter((match) => !isRemovedMatch(match));

const chartColors = ["#d93048", "#156f5a", "#c79624", "#3763b6", "#6f4fb0", "#c45a25", "#24788f", "#8b3f6a"];
const restoredPointTotals = {
  mark: 143,
  agnieszka: 123,
  jerzy: 123,
  robert: 120,
  tomek: 115,
  jarek: 109,
  sean: 37,
  monika: 29,
  tim: 25,
  "david a": 15,
};
const montanaDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: MONTANA_TIME_ZONE,
});

function montanaNoonDate(dateKey) {
  return new Date(`${dateKey}T18:00:00Z`);
}

function formatMontanaDate(dateKey) {
  if (!dateKey) return "";
  return `${montanaDateFormatter.format(montanaNoonDate(dateKey))} MT`;
}

function formatMatchDate(match) {
  const dateLabel = formatMontanaDate(match?.date);
  return match?.timeMt ? `${dateLabel} · ${match.timeMt} MT` : dateLabel;
}

function montanaDateKey(dateKey) {
  if (!dateKey) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: MONTANA_TIME_ZONE,
  }).formatToParts(montanaNoonDate(dateKey));
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${valueByType.year}-${valueByType.month}-${valueByType.day}`;
}

function HandDrawnWorldCupIcon({ size = 18 }) {
  return (
    <svg
      className="handdrawn-trophy-icon"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <defs>
        <filter id="handdrawn-trophy-depth" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="1.5" dy="2" stdDeviation="1.2" floodColor="#6f4d16" floodOpacity="0.35" />
          <feDropShadow dx="-0.7" dy="-0.7" stdDeviation="0.45" floodColor="#fff8dc" floodOpacity="0.8" />
        </filter>
        <linearGradient id="handdrawn-trophy-gold" x1="18%" y1="10%" x2="82%" y2="95%">
          <stop offset="0%" stopColor="#fff8dc" />
          <stop offset="38%" stopColor="#f7d68a" />
          <stop offset="72%" stopColor="#c99a3b" />
          <stop offset="100%" stopColor="#7a5216" />
        </linearGradient>
      </defs>
      <circle className="flower-petal red" cx="10" cy="14" r="3.4" />
      <circle className="flower-petal white" cx="16" cy="10" r="3.1" />
      <circle className="flower-petal blue" cx="20" cy="16" r="3.3" />
      <circle className="flower-petal green" cx="14" cy="20" r="3.1" />
      <circle className="flower-center" cx="15.2" cy="15.2" r="2.4" />
      <circle className="flower-petal blue" cx="48" cy="10" r="3.1" />
      <circle className="flower-petal red" cx="54" cy="14" r="3.2" />
      <circle className="flower-petal green" cx="50" cy="20" r="3.1" />
      <circle className="flower-petal white" cx="56" cy="21" r="2.9" />
      <circle className="flower-center" cx="52" cy="16.4" r="2.2" />
      <path className="sketch-shadow" d="M27 13c-3 3-5 8-4 13 1 5 4 8 9 9 5-1 8-4 9-9 1-5-1-10-4-13-2 3-3 4-5 4s-3-1-5-4Z" />
      <path className="sketch-gold fill" d="M27 13c-3 3-5 8-4 13 1 5 4 8 9 9 5-1 8-4 9-9 1-5-1-10-4-13-2 3-3 4-5 4s-3-1-5-4Z" />
      <path className="sketch-gold line" d="M27 13c-3 3-5 8-4 13 1 5 4 8 9 9 5-1 8-4 9-9 1-5-1-10-4-13-2 3-3 4-5 4s-3-1-5-4Z" />
      <path className="sketch-gold line thin" d="M25 20c-5 1-8 3-9 7-1 3 1 6 5 7M39 20c5 1 8 3 9 7 1 3-1 6-5 7" />
      <path className="sketch-green" d="M26 35c1 3 3 5 6 6 3-1 5-3 6-6" />
      <path className="sketch-gold fill" d="M28 41h8l1 7h-10l1-7Z" />
      <path className="sketch-gold line" d="M28 41h8l1 7h-10l1-7Z" />
      <path className="sketch-gold fill" d="M21 51c3-3 19-3 22 0l2 4H19l2-4Z" />
      <path className="sketch-gold line" d="M21 51c3-3 19-3 22 0l2 4H19l2-4Z" />
      <path className="sketch-blue" d="M25 25c3 2 10 2 14 0" />
      <path className="sketch-red" d="M28 30c2 1 6 1 8 0" />
    </svg>
  );
}

function RealisticClipboardIcon({ size = 18 }) {
  return (
    <svg
      className="realistic-clipboard-icon"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <defs>
        <filter id="clipboard-depth" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="2.1" dy="2.6" stdDeviation="1.55" floodColor="#4f331d" floodOpacity="0.28" />
          <feDropShadow dx="-0.8" dy="-0.8" stdDeviation="0.55" floodColor="#ffffff" floodOpacity="0.75" />
        </filter>
        <linearGradient id="clipboard-board" x1="16%" y1="8%" x2="84%" y2="96%">
          <stop offset="0%" stopColor="#f0b36c" />
          <stop offset="44%" stopColor="#c47a45" />
          <stop offset="100%" stopColor="#704326" />
        </linearGradient>
        <linearGradient id="clipboard-paper" x1="14%" y1="4%" x2="84%" y2="100%">
          <stop offset="0%" stopColor="#fffefa" />
          <stop offset="58%" stopColor="#f7edd8" />
          <stop offset="100%" stopColor="#e4cfab" />
        </linearGradient>
        <linearGradient id="clipboard-metal" x1="16%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#fff8e9" />
          <stop offset="42%" stopColor="#d7b991" />
          <stop offset="100%" stopColor="#806447" />
        </linearGradient>
      </defs>
      <path className="clipboard-shadow" d="M16 12h32c3 0 5 2 5 5v36c0 3-2 5-5 5H16c-3 0-5-2-5-5V17c0-3 2-5 5-5Z" />
      <path className="clipboard-board" d="M15 10h34c3.4 0 5.5 2.2 5.5 5.5v36c0 3.4-2.1 5.5-5.5 5.5H15c-3.4 0-5.5-2.1-5.5-5.5v-36C9.5 12.2 11.6 10 15 10Z" />
      <path className="clipboard-board-edge" d="M15.5 11.8h33c2.1 0 3.5 1.4 3.5 3.6v35.2c0 2.2-1.4 3.6-3.5 3.6h-33c-2.1 0-3.5-1.4-3.5-3.6V15.4c0-2.2 1.4-3.6 3.5-3.6Z" />
      <path className="clipboard-paper" d="M18 17.5h28c2 0 3.3 1.3 3.3 3.3v27.9c0 2-1.3 3.3-3.3 3.3H18c-2 0-3.3-1.3-3.3-3.3V20.8c0-2 1.3-3.3 3.3-3.3Z" />
      <path className="clipboard-paper-glow" d="M19.5 19.2h25.8c1.1 0 1.8 0.7 1.8 1.8v6.5c-8.8 1.6-18 1.1-29.4-1.4V21c0-1.1 0.7-1.8 1.8-1.8Z" />
      <path className="clipboard-clip" d="M24.8 8.2h4.1c0.5-2 1.8-3.1 3.5-3.1 1.8 0 3 1.1 3.6 3.1h4c2 0 3.2 1.3 3.2 3.2V17H21.6v-5.6c0-1.9 1.2-3.2 3.2-3.2Z" />
      <circle className="clipboard-clip-hole" cx="32.4" cy="9.6" r="2.1" />
      <path className="clipboard-line red" d="M22 29h12" />
      <path className="clipboard-line blue" d="M22 37h17" />
      <path className="clipboard-line green" d="M22 45h13" />
      <path className="clipboard-check red" d="M40 28.6l2.4 2.5 5-5.6" />
      <path className="clipboard-check blue" d="M40 36.7l2.4 2.5 5-5.6" />
      <path className="clipboard-check green" d="M40 44.8l2.4 2.5 5-5.6" />
      <circle className="clipboard-pin yellow" cx="20.4" cy="22.7" r="2.15" />
      <circle className="clipboard-pin coral" cx="44.8" cy="22.4" r="2" />
    </svg>
  );
}

function RealisticCalendarIcon({ size = 18 }) {
  return (
    <svg className="realistic-calendar-icon" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <filter id="calendar-depth" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="2" dy="2.6" stdDeviation="1.35" floodColor="#5a3d24" floodOpacity="0.26" />
          <feDropShadow dx="-0.7" dy="-0.7" stdDeviation="0.5" floodColor="#ffffff" floodOpacity="0.78" />
        </filter>
        <linearGradient id="calendar-body" x1="18%" y1="4%" x2="86%" y2="100%">
          <stop offset="0%" stopColor="#fff8ea" />
          <stop offset="62%" stopColor="#f0dcba" />
          <stop offset="100%" stopColor="#d3a76f" />
        </linearGradient>
        <linearGradient id="calendar-header" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#f4a86a" />
          <stop offset="52%" stopColor="#c86f3e" />
          <stop offset="100%" stopColor="#764626" />
        </linearGradient>
      </defs>
      <path className="calendar-shadow" d="M16 12h34c3 0 5 2 5 5v34c0 3-2 5-5 5H16c-3 0-5-2-5-5V17c0-3 2-5 5-5Z" />
      <path className="calendar-body" d="M15 10h34c3.4 0 5.5 2.2 5.5 5.5v35c0 3.4-2.1 5.5-5.5 5.5H15c-3.4 0-5.5-2.1-5.5-5.5v-35C9.5 12.2 11.6 10 15 10Z" />
      <path className="calendar-header" d="M15 10h34c3.4 0 5.5 2.2 5.5 5.5v10H9.5v-10C9.5 12.2 11.6 10 15 10Z" />
      <path className="calendar-shine" d="M15.5 12.2h33c1.9 0 3.1 1.1 3.3 3-9.5 2-24.4 2.1-39.5 0.2 0.2-2 1.3-3.2 3.2-3.2Z" />
      <path className="calendar-ring" d="M22 6.5v11" />
      <path className="calendar-ring" d="M42 6.5v11" />
      <circle className="calendar-dot red" cx="22" cy="34" r="3.2" />
      <circle className="calendar-dot blue" cx="32" cy="34" r="3.2" />
      <circle className="calendar-dot green" cx="42" cy="34" r="3.2" />
      <circle className="calendar-dot blue" cx="22" cy="44" r="3.2" />
      <circle className="calendar-dot green" cx="32" cy="44" r="3.2" />
      <path className="calendar-check" d="M39 43.8l3.1 3.1 6.2-7" />
    </svg>
  );
}

function RealisticPlayerIcon({ size = 18 }) {
  return (
    <svg className="realistic-player-icon" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <filter id="player-depth" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="2" dy="2.4" stdDeviation="1.35" floodColor="#5b3a23" floodOpacity="0.26" />
          <feDropShadow dx="-0.7" dy="-0.7" stdDeviation="0.55" floodColor="#ffffff" floodOpacity="0.78" />
        </filter>
        <linearGradient id="player-badge" x1="13%" y1="8%" x2="86%" y2="94%">
          <stop offset="0%" stopColor="#fff0d4" />
          <stop offset="48%" stopColor="#d99b67" />
          <stop offset="100%" stopColor="#8e5b39" />
        </linearGradient>
        <linearGradient id="player-shirt" x1="16%" y1="0%" x2="86%" y2="100%">
          <stop offset="0%" stopColor="#c6bf6b" />
          <stop offset="55%" stopColor="#807a3a" />
          <stop offset="100%" stopColor="#4f5128" />
        </linearGradient>
        <linearGradient id="player-accent" x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#ff9c86" />
          <stop offset="100%" stopColor="#c84264" />
        </linearGradient>
      </defs>
      <circle className="player-shadow" cx="33" cy="33" r="24" />
      <circle className="player-badge" cx="32" cy="31.5" r="24" />
      <path className="player-badge-shine" d="M16.5 24c4-9 15-14 25-10 4.2 1.7 7.4 4.5 9.3 8.1-9.2-1.7-20.7-1.2-34.3 1.9Z" />
      <circle className="player-head main" cx="31.5" cy="24" r="7.4" />
      <path className="player-shirt main" d="M18.7 47c1.4-8.3 6.3-13.2 12.8-13.2S43 38.7 44.4 47H18.7Z" />
      <circle className="player-head side-left" cx="19.8" cy="31.2" r="5.1" />
      <path className="player-shirt side-left" d="M11.5 48.2c0.9-6 4.1-9.5 8.5-9.5 3.1 0 5.7 1.7 7.2 4.8-2 1.1-3.4 2.7-4.4 4.7H11.5Z" />
      <circle className="player-head side-right" cx="44.8" cy="31.2" r="5.1" />
      <path className="player-shirt side-right" d="M41.1 48.2c-1-2-2.5-3.6-4.4-4.7 1.5-3.1 4.1-4.8 7.2-4.8 4.4 0 7.6 3.5 8.5 9.5H41.1Z" />
      <path className="player-sash" d="M25 39l13 8" />
    </svg>
  );
}

function RealisticRulesIcon({ size = 18 }) {
  return (
    <svg className="realistic-rules-icon" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <filter id="rules-depth" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="2" dy="2.5" stdDeviation="1.35" floodColor="#54361f" floodOpacity="0.26" />
          <feDropShadow dx="-0.7" dy="-0.7" stdDeviation="0.5" floodColor="#ffffff" floodOpacity="0.78" />
        </filter>
        <linearGradient id="rules-cover" x1="14%" y1="8%" x2="84%" y2="96%">
          <stop offset="0%" stopColor="#e7bb75" />
          <stop offset="48%" stopColor="#bd7b45" />
          <stop offset="100%" stopColor="#6f4228" />
        </linearGradient>
        <linearGradient id="rules-page" x1="12%" y1="0%" x2="86%" y2="100%">
          <stop offset="0%" stopColor="#fffefa" />
          <stop offset="60%" stopColor="#eee7d8" />
          <stop offset="100%" stopColor="#cfc5b3" />
        </linearGradient>
        <linearGradient id="rules-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c2bd70" />
          <stop offset="100%" stopColor="#737436" />
        </linearGradient>
      </defs>
      <path className="rules-shadow" d="M19 9h27c3 0 5 2 5 5v38c0 2.6-1.9 4.6-4.5 4.6H18.2c-2.6 0-4.7-2-4.7-4.6V14.5C13.5 11.2 15.6 9 19 9Z" />
      <path className="rules-pages" d="M20 12h28c2.2 0 3.5 1.4 3.5 3.5v35c0 2.2-1.3 3.5-3.5 3.5H20c-2.2 0-3.5-1.3-3.5-3.5v-35c0-2.1 1.3-3.5 3.5-3.5Z" />
      <path className="rules-cover" d="M16.2 10h27.5c3 0 5 2 5 5v38.2c-7.4-2-17.9-2-31.4 0-2.5 0-4.2-1.7-4.2-4.2V15c0-3 2-5 3.1-5Z" />
      <path className="rules-cover-shine" d="M17.2 12.4h25.3c2 0 3.2 1.2 3.2 3.1V21c-9.5 1.7-19.4 1.3-29.8-1.3v-4.2c0-1.9 1.1-3.1 1.3-3.1Z" />
      <path className="rules-page-edge" d="M48.7 17.5h2.8v31.7c0 2.2-1.3 3.5-3.5 3.5h-2.1" />
      <path className="rules-ribbon" d="M35.7 10v21l4.4-3.2 4.3 3.2V10H35.7Z" />
      <path className="rules-line coral" d="M21 31h13" />
      <path className="rules-line teal" d="M21 39h17" />
      <path className="rules-line white" d="M21 47h11" />
      <path className="rules-check" d="M39.5 41.5l3.1 3.1 6.4-7.1" />
    </svg>
  );
}

const worldCupCalendarEvents = {
  "2026-06-11": ["Group stage opens"],
  "2026-06-12": ["Group stage"],
  "2026-06-13": ["Group stage"],
  "2026-06-14": ["Group stage"],
  "2026-06-15": ["Group stage"],
  "2026-06-16": ["Group stage"],
  "2026-06-17": ["Group stage"],
  "2026-06-18": ["Group stage"],
  "2026-06-19": ["Group stage"],
  "2026-06-20": ["Group stage"],
  "2026-06-21": ["Group stage"],
  "2026-06-22": ["Group stage"],
  "2026-06-23": ["Group stage"],
  "2026-06-24": ["Group stage"],
  "2026-06-25": ["Group stage"],
  "2026-06-26": ["Group stage"],
  "2026-06-27": ["Group stage ends"],
  "2026-06-28": ["Round of 32"],
  "2026-06-29": ["Round of 32"],
  "2026-06-30": ["Round of 32"],
  "2026-07-01": ["Round of 32"],
  "2026-07-02": ["Round of 32"],
  "2026-07-03": ["Round of 32"],
  "2026-07-04": ["Round of 32", "Round of 16"],
  "2026-07-05": ["Round of 16"],
  "2026-07-06": ["Round of 16"],
  "2026-07-07": ["Round of 16"],
  "2026-07-09": ["Quarterfinal"],
  "2026-07-10": ["Quarterfinal"],
  "2026-07-11": ["Quarterfinal"],
  "2026-07-12": ["Quarterfinal"],
  "2026-07-14": ["Semifinal"],
  "2026-07-15": ["Semifinal"],
  "2026-07-18": ["Third-place match"],
  "2026-07-19": ["Final"],
};

const worldCupCalendarMonths = [
  { year: 2026, month: 5, label: "June 2026" },
  { year: 2026, month: 6, label: "July 2026" },
];

const initialState = {
  players: seedPlayers,
  matches: activeScheduleMatches,
  picks: seedPicks,
  teams: seedTeams,
  deletedPlayerIds: [],
  scheduleVersion: SCHEDULE_VERSION,
  updatedAt: 0,
  rules: {
    exact: 10,
    goalDifference: 7,
    result: 5,
    champion: 100,
  },
};

function poolHasFamilyData(pool) {
  const players = pool.players ?? [];
  const hasCustomPlayers = players.length !== seedPlayers.length || players.some((player, index) => (
    player.id !== seedPlayers[index]?.id || player.name !== seedPlayers[index]?.name
  ));
  const hasPicks = (pool.picks ?? []).length > 0;
  const hasResults = (pool.matches ?? []).some((match) => isFilled(match.homeScore) || isFilled(match.awayScore));
  const hasDeletedPlayers = (pool.deletedPlayerIds ?? []).length > 0;
  return hasCustomPlayers || hasPicks || hasResults || hasDeletedPlayers;
}

function completedResultCount(pool) {
  return (pool.matches ?? []).filter((match) => isFilled(match.homeScore) && isFilled(match.awayScore)).length;
}

function backupFingerprint(pool) {
  return JSON.stringify({
    players: (pool.players ?? []).map((player) => [player.id, player.name, player.champion, player.championLocked]),
    matches: (pool.matches ?? []).map((match) => [match.id, match.homeScore, match.awayScore, match.resultLocked]),
    picks: (pool.picks ?? []).map((pick) => [pick.playerId, pick.matchId, pick.homeScore, pick.awayScore, pick.locked]),
    deletedPlayerIds: pool.deletedPlayerIds ?? [],
  });
}

function getLocalBackups() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_BACKUPS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalBackup(pool, force = false) {
  const normalized = normalizePool(pool);
  const completedResults = completedResultCount(normalized);
  if (!force && completedResults === 0) return getLocalBackups();

  const fingerprint = backupFingerprint(normalized);
  const backups = getLocalBackups();
  if (!force && backups[0]?.fingerprint === fingerprint) return backups;

  const nextBackups = [
    {
      id: `backup-${Date.now()}`,
      createdAt: Date.now(),
      completedResults,
      players: normalized.players.length,
      fingerprint,
      data: normalized,
    },
    ...backups.filter((backup) => backup.fingerprint !== fingerprint),
  ].slice(0, MAX_LOCAL_BACKUPS);

  localStorage.setItem(LOCAL_BACKUPS_KEY, JSON.stringify(nextBackups));
  return nextBackups;
}

function getStoredState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizePool(JSON.parse(saved)) : initialState;
  } catch {
    return initialState;
  }
}

function supabaseHeaders(extraHeaders = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extraHeaders,
  };
}

async function loadCloudPool() {
  if (!CLOUD_SYNC_ENABLED) return null;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/pool_state?id=eq.${CLOUD_ROW_ID}&select=data`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) throw new Error("Could not load shared pool");
  const rows = await response.json();
  if (!rows[0]?.data) return null;

  const pool = normalizePool(rows[0].data);
  try {
    return await loadPoolWithVisibleTableEdits(pool);
  } catch {
    return pool;
  }
}

async function saveCloudPool(pool) {
  if (!CLOUD_SYNC_ENABLED) return;
  const cloudPool = await loadCloudPool();
  const mergedPool = cloudPool ? mergePoolStates(cloudPool, pool) : normalizePool(pool);
  const correctedPool = await loadPoolWithVisibleTableEdits(mergedPool);
  if (cloudPool && completedResultCount(correctedPool) < completedResultCount(cloudPool)) {
    throw new Error("Refusing to save fewer completed results than the shared pool already has");
  }
  await writeCloudPool(correctedPool);
  return correctedPool;
}

async function writeCloudPool(pool) {
  const normalizedPool = normalizePool(pool);
  if (!poolHasFamilyData(normalizedPool)) {
    throw new Error("Refusing to overwrite shared pool with demo data");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/pool_state?on_conflict=id`, {
    method: "POST",
    headers: supabaseHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify({
      id: CLOUD_ROW_ID,
      data: normalizedPool,
      updated_at: new Date(Number(normalizedPool.updatedAt || Date.now())).toISOString(),
    }),
  });
  if (!response.ok) throw new Error("Could not save shared pool");

  try {
    await syncVisibleSupabaseTables(normalizedPool);
  } catch (error) {
    console.warn("Saved shared pool, but could not update visible Supabase tables.", error);
  }
}

function toSupabaseTime(value) {
  const timestamp = Number(value || 0);
  return timestamp ? new Date(timestamp).toISOString() : null;
}

function blankToNull(value) {
  if (value === 0 || value === "0") return "0";
  return isFilled(value) ? String(value) : null;
}

async function replaceVisibleTable(tableName, rows) {
  await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?pool_id=eq.${CLOUD_ROW_ID}`, {
    method: "DELETE",
    headers: supabaseHeaders({ Prefer: "return=minimal" }),
  });

  if (!rows.length) return;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
    method: "POST",
    headers: supabaseHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error(`Could not sync ${tableName}`);
}

async function loadVisibleTable(tableName, selectColumns) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?pool_id=eq.${CLOUD_ROW_ID}&select=${selectColumns}`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) return [];
  return response.json();
}

function visibleScoreValue(value) {
  if (value === 0 || value === "0") return "0";
  return isFilled(value) ? String(value) : "";
}

function visibleRowTimestamp(row) {
  return Math.max(Date.parse(row.updated_at || "") || 0, Date.parse(row.result_updated_at || "") || 0);
}

function normalizedTeamName(team) {
  return String(team || "").trim().toLowerCase();
}

function findVisibleMatch(row, matches) {
  const idMatch = matches.find((match) => match.id === row.match_id);
  if (idMatch) return idMatch;

  const homeTeam = normalizedTeamName(row.home_team);
  const awayTeam = normalizedTeamName(row.away_team);
  const rowDate = row.match_date || "";

  const teamMatches = matches.filter((match) => {
    const homeMatches = normalizedTeamName(match.home) === homeTeam;
    const awayMatches = normalizedTeamName(match.away) === awayTeam;
    const reversedHomeMatches = normalizedTeamName(match.home) === awayTeam;
    const reversedAwayMatches = normalizedTeamName(match.away) === homeTeam;
    return (homeMatches && awayMatches) || (reversedHomeMatches && reversedAwayMatches);
  });

  const dateMatch = teamMatches.find((match) => {
    const dateMatches = !rowDate || montanaDateKey(rowDate) === montanaDateKey(match.date);
    return dateMatches;
  });
  if (dateMatch) return dateMatch;
  return teamMatches.length === 1 ? teamMatches[0] : null;
}

function visibleScoresForMatch(row, match) {
  const homeScore = visibleScoreValue(row.home_score);
  const awayScore = visibleScoreValue(row.away_score);
  const rowIsReversed = normalizedTeamName(row.home_team) === normalizedTeamName(match.away)
    && normalizedTeamName(row.away_team) === normalizedTeamName(match.home);
  return rowIsReversed
    ? { homeScore: awayScore, awayScore: homeScore }
    : { homeScore, awayScore };
}

function applyVisibleTableEdits(pool, resultRows, pickRows) {
  const normalized = normalizePool(pool);
  const playersById = new Map(normalized.players.map((player) => [player.id, player]));
  const playersByName = new Map(normalized.players.map((player) => [player.name.toLowerCase(), player]));
  const resultRowsByMatchId = new Map();
  resultRows.forEach((row) => {
    const match = findVisibleMatch(row, normalized.matches);
    if (match) resultRowsByMatchId.set(match.id, row);
  });

  const matches = normalized.matches.map((match) => {
    const row = resultRowsByMatchId.get(match.id);
    const { homeScore, awayScore } = row ? visibleScoresForMatch(row, match) : { homeScore: "", awayScore: "" };
    if (!row || !isFilled(homeScore) || !isFilled(awayScore)) return match;
    const rowTimestamp = visibleRowTimestamp(row);
    const matchTimestamp = itemUpdatedAt(match);
    if (hasAnyScore(match) && (!rowTimestamp || rowTimestamp < matchTimestamp)) return match;
    if (match.homeScore === homeScore && match.awayScore === awayScore && Boolean(match.resultLocked) === Boolean(row.result_locked)) {
      return match;
    }

    const updatedAt = rowTimestamp || Date.now();
    return {
      ...match,
      homeScore,
      awayScore,
      resultLocked: Boolean(row.result_locked || match.resultLocked),
      resultUpdatedAt: updatedAt,
      updatedAt,
    };
  });

  const picksByKey = new Map(normalized.picks.map((pick) => [`${pick.playerId}-${pick.matchId}`, pick]));
  pickRows.forEach((row) => {
    const player = playersById.get(row.player_id) || playersByName.get(String(row.player_name || "").toLowerCase());
    const match = findVisibleMatch(row, normalized.matches);
    const { homeScore, awayScore } = match ? visibleScoresForMatch(row, match) : { homeScore: "", awayScore: "" };
    if (!player || !match || !isFilled(homeScore) || !isFilled(awayScore)) return;

    const key = `${player.id}-${match.id}`;
    const existingPick = picksByKey.get(key);
    const rowTimestamp = visibleRowTimestamp(row);
    if (hasAnyScore(existingPick) && (!rowTimestamp || rowTimestamp < itemUpdatedAt(existingPick))) return;
    if (
      existingPick
      && existingPick.homeScore === homeScore
      && existingPick.awayScore === awayScore
      && Boolean(existingPick.locked) === Boolean(row.locked)
    ) {
      return;
    }

    picksByKey.set(key, {
      ...(existingPick || { id: uid("pick"), playerId: player.id, matchId: match.id }),
      homeScore,
      awayScore,
      locked: Boolean(row.locked || existingPick?.locked),
      updatedAt: rowTimestamp || Date.now(),
    });
  });

  return normalizePool({
    ...normalized,
    matches,
    picks: [...picksByKey.values()],
    updatedAt: Date.now(),
  });
}

async function loadPoolWithVisibleTableEdits(pool) {
  const [resultRows, pickRows] = await Promise.all([
    loadVisibleTable("match_results", "match_id,match_date,home_team,away_team,home_score,away_score,result_locked,result_updated_at,updated_at"),
    loadVisibleTable("player_picks", "player_id,player_name,match_id,match_date,home_team,away_team,home_score,away_score,locked,updated_at"),
  ]);
  return applyVisibleTableEdits(pool, resultRows, pickRows);
}

async function syncVisibleSupabaseTables(pool) {
  if (!CLOUD_SYNC_ENABLED) return;
  const normalized = normalizePool(pool);
  const playersById = new Map(normalized.players.map((player) => [player.id, player]));
  const matchesById = new Map(normalized.matches.map((match) => [match.id, match]));

  const playerRows = normalized.players.map((player) => ({
    pool_id: CLOUD_ROW_ID,
    id: player.id,
    name: player.name,
    champion: player.champion || null,
    champion_locked: Boolean(player.championLocked),
    updated_at: toSupabaseTime(player.updatedAt || normalized.updatedAt),
  }));

  const resultRows = normalized.matches.map((match) => ({
    pool_id: CLOUD_ROW_ID,
    match_id: match.id,
    match_date: match.date,
    stage: match.stage,
    home_team: match.home,
    away_team: match.away,
    home_score: blankToNull(match.homeScore),
    away_score: blankToNull(match.awayScore),
    result_locked: Boolean(match.resultLocked),
    result_updated_at: toSupabaseTime(match.resultUpdatedAt),
    updated_at: toSupabaseTime(match.updatedAt || match.resultUpdatedAt || normalized.updatedAt),
  }));

  const pickRows = normalized.picks.map((pick) => {
    const player = playersById.get(pick.playerId);
    const match = matchesById.get(pick.matchId);
    return {
      pool_id: CLOUD_ROW_ID,
      player_id: pick.playerId,
      player_name: player?.name || null,
      match_id: pick.matchId,
      match_date: match?.date || null,
      stage: match?.stage || null,
      home_team: match?.home || null,
      away_team: match?.away || null,
      home_score: blankToNull(pick.homeScore),
      away_score: blankToNull(pick.awayScore),
      locked: Boolean(pick.locked),
      updated_at: toSupabaseTime(pick.updatedAt || normalized.updatedAt),
    };
  });

  await replaceVisibleTable("pool_players", playerRows);
  await replaceVisibleTable("match_results", resultRows);
  await replaceVisibleTable("player_picks", pickRows);
}

function poolUpdatedAt(pool) {
  return Number(pool?.updatedAt || 0);
}

function markPoolUpdated(pool) {
  return {
    ...pool,
    updatedAt: Date.now(),
  };
}

function markBackupRestored(pool) {
  const restoredAt = Date.now();
  return {
    ...pool,
    players: pool.players.map((player) => ({ ...player, updatedAt: restoredAt })),
    matches: pool.matches.map((match) => ({
      ...match,
      updatedAt: restoredAt,
      resultUpdatedAt: isFilled(match.homeScore) && isFilled(match.awayScore) ? restoredAt : match.resultUpdatedAt,
    })),
    picks: pool.picks.map((pick) => ({ ...pick, updatedAt: restoredAt })),
    updatedAt: restoredAt,
  };
}

function itemUpdatedAt(item) {
  return Number(item?.updatedAt || item?.resultUpdatedAt || 0);
}

function newestItem(first, second) {
  if (!first) return second;
  if (!second) return first;
  if (itemUpdatedAt(second) > itemUpdatedAt(first)) return second;
  return first;
}

function hasCompleteScore(item) {
  return isFilled(item?.homeScore) && isFilled(item?.awayScore);
}

function hasAnyScore(item) {
  return isFilled(item?.homeScore) || isFilled(item?.awayScore);
}

function protectedNewestItem(first, second) {
  if (!first) return second;
  if (!second) return first;
  const firstHasScore = hasCompleteScore(first);
  const secondHasScore = hasCompleteScore(second);
  if (firstHasScore && !secondHasScore) return first;
  if (secondHasScore && !firstHasScore) return second;
  return newestItem(first, second);
}

function mergeById(firstItems, secondItems) {
  const merged = new Map();
  [...firstItems, ...secondItems].forEach((item) => {
    merged.set(item.id, newestItem(merged.get(item.id), item));
  });
  return [...merged.values()];
}

function mergePicks(firstPicks, secondPicks) {
  const merged = new Map();
  [...firstPicks, ...secondPicks].forEach((pick) => {
    const key = `${pick.playerId}-${pick.matchId}`;
    const current = merged.get(key);
    const next = protectedNewestItem(current, pick);
    merged.set(key, {
      ...next,
      locked: Boolean(current?.locked || pick.locked || next.locked),
    });
  });
  return [...merged.values()];
}

function mergeMatches(firstMatches, secondMatches) {
  const merged = new Map();
  [...firstMatches, ...secondMatches].forEach((match) => {
    const current = merged.get(match.id);
    const next = protectedNewestItem(current, match);
    const hasScore = hasCompleteScore(next);
    merged.set(match.id, {
      ...next,
      resultLocked: hasScore && Boolean(current?.resultLocked || match.resultLocked || next.resultLocked),
    });
  });
  return [...merged.values()].sort((a, b) => `${a.date}-${a.id}`.localeCompare(`${b.date}-${b.id}`));
}

function mergePoolStates(firstPool, secondPool) {
  const first = normalizePool(firstPool);
  const second = normalizePool(secondPool);
  const newerPool = poolUpdatedAt(second) > poolUpdatedAt(first) ? second : first;
  const deletedPlayerIds = [...new Set([...(first.deletedPlayerIds ?? []), ...(second.deletedPlayerIds ?? [])])];

  return normalizePool({
    ...newerPool,
    deletedPlayerIds,
    players: mergeById(first.players, second.players).filter((player) => !deletedPlayerIds.includes(player.id)),
    matches: mergeMatches(first.matches, second.matches),
    picks: mergePicks(first.picks, second.picks).filter((pick) => !deletedPlayerIds.includes(pick.playerId)),
    updatedAt: Math.max(poolUpdatedAt(first), poolUpdatedAt(second), Date.now()),
  });
}

function legacyPoolUpdatedAt(pool) {
  if (pool.updatedAt) return Number(pool.updatedAt);
  const hasExtraPlayers = (pool.players?.length ?? seedPlayers.length) !== seedPlayers.length;
  const hasDifferentPlayers = (pool.players ?? []).some((player, index) => player.id !== seedPlayers[index]?.id || player.name !== seedPlayers[index]?.name);
  const hasPicks = (pool.picks?.length ?? 0) > 0;
  const hasResults = (pool.matches ?? []).some((match) => isFilled(match.homeScore) || isFilled(match.awayScore));
  return hasExtraPlayers || hasDifferentPlayers || hasPicks || hasResults ? Date.now() : 0;
}

function normalizePool(pool) {
  const rules = pool.rules ?? initialState.rules;
  const shouldUpgradeSchedule = pool.scheduleVersion !== SCHEDULE_VERSION || (pool.matches?.length ?? 0) < activeScheduleMatches.length;
  const deletedPlayerIds = [...new Set(pool.deletedPlayerIds ?? [])];
  const existingMatches = pool.matches ?? initialState.matches;
  const existingMatchesById = new Map(existingMatches.map((match) => [match.id, match]));
  const activeScheduleMatchIds = new Set(activeScheduleMatches.map((match) => match.id));
  const scheduleMatches = shouldUpgradeSchedule
    ? [
      ...activeScheduleMatches.map((seedMatch) => {
        const existingMatch = existingMatchesById.get(seedMatch.id);
        if (!existingMatch) return seedMatch;
        return {
          ...seedMatch,
          homeScore: existingMatch.homeScore ?? seedMatch.homeScore,
          awayScore: existingMatch.awayScore ?? seedMatch.awayScore,
          resultLocked: existingMatch.resultLocked ?? seedMatch.resultLocked,
          resultUpdatedAt: existingMatch.resultUpdatedAt ?? seedMatch.resultUpdatedAt,
          updatedAt: existingMatch.updatedAt ?? seedMatch.updatedAt,
        };
      }),
      ...existingMatches.filter((match) => !activeScheduleMatchIds.has(match.id) && !isRemovedMatch(match)),
    ]
    : existingMatches.filter((match) => !isRemovedMatch(match));
  const players = (pool.players ?? initialState.players).map((player) => ({
    ...player,
    champion: player.champion ?? "",
    championLocked: Boolean(player.championLocked),
    updatedAt: Number(player.updatedAt || pool.updatedAt || 0),
  })).filter((player) => !deletedPlayerIds.includes(player.id));
  const matches = scheduleMatches.map((match) => {
    const hasEitherScore = isFilled(match.homeScore) || isFilled(match.awayScore);
    const homeScore = normalizeScoreValue(match.homeScore, hasEitherScore);
    const awayScore = normalizeScoreValue(match.awayScore, hasEitherScore);
    return {
      ...match,
      homeScore,
      awayScore,
      resultUpdatedAt: match.resultUpdatedAt ?? "",
      resultLocked: Boolean(match.resultLocked) && isFilled(homeScore) && isFilled(awayScore),
      updatedAt: Number(match.updatedAt || match.resultUpdatedAt || pool.updatedAt || 0),
    };
  });
  const activeMatchIds = new Set(matches.map((match) => match.id));
  const picks = (pool.picks ?? initialState.picks).map((pick) => {
    const hasEitherScore = isFilled(pick.homeScore) || isFilled(pick.awayScore);
    return {
      ...pick,
      homeScore: normalizeScoreValue(pick.homeScore, hasEitherScore),
      awayScore: normalizeScoreValue(pick.awayScore, hasEitherScore),
      locked: Boolean(pick.locked),
      updatedAt: Number(pick.updatedAt || pool.updatedAt || 0),
    };
  }).filter((pick) => !deletedPlayerIds.includes(pick.playerId) && activeMatchIds.has(pick.matchId));

  return {
    ...initialState,
    ...pool,
    deletedPlayerIds,
    players,
    matches,
    picks,
    scheduleVersion: SCHEDULE_VERSION,
    updatedAt: legacyPoolUpdatedAt(pool),
    rules: {
      ...rules,
      ...initialState.rules,
    },
  };
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function matchOutcome(home, away) {
  const h = Number(home);
  const a = Number(away);
  if (!Number.isFinite(h) || !Number.isFinite(a)) return null;
  if (h > a) return "home";
  if (a > h) return "away";
  return "draw";
}

function isFilled(value) {
  return value !== "" && value !== null && value !== undefined;
}

function normalizedPlayerName(name) {
  return String(name || "").trim().toLowerCase();
}

function restoredPointsForPlayer(player) {
  return restoredPointTotals[normalizedPlayerName(player.name)] ?? 0;
}

function normalizeScoreValue(value, shouldTreatBlankAsZero = false) {
  if (value === 0 || value === "0") return "0";
  if (value === null || value === undefined) {
    return shouldTreatBlankAsZero ? "0" : "";
  }
  if (value === "") return "";
  return String(value);
}

function scorePick(match, pick, rules) {
  if (!pick || !isFilled(match.homeScore) || !isFilled(match.awayScore) || !isFilled(pick.homeScore) || !isFilled(pick.awayScore)) {
    return 0;
  }

  const exact = Number(match.homeScore) === Number(pick.homeScore) && Number(match.awayScore) === Number(pick.awayScore);
  if (exact) return Number(rules.exact);

  const correctWinner = matchOutcome(match.homeScore, match.awayScore) === matchOutcome(pick.homeScore, pick.awayScore);
  if (!correctWinner) return 0;

  const matchGoalDifference = Number(match.homeScore) - Number(match.awayScore);
  const pickGoalDifference = Number(pick.homeScore) - Number(pick.awayScore);
  if (matchGoalDifference === pickGoalDifference) return Number(rules.goalDifference);

  return Number(rules.result);
}

function getFinalWinner(matches) {
  const final = matches.find((match) => match.stage.toLowerCase() === "final");
  if (!final || !isFilled(final.homeScore) || !isFilled(final.awayScore)) return null;
  const outcome = matchOutcome(final.homeScore, final.awayScore);
  if (outcome === "home") return final.home;
  if (outcome === "away") return final.away;
  return null;
}

function buildProgressSeries(pool) {
  const completedMatches = pool.matches
    .filter((match) => isFilled(match.homeScore) && isFilled(match.awayScore))
    .sort((a, b) => `${a.date}-${a.id}`.localeCompare(`${b.date}-${b.id}`));
  const finalWinner = getFinalWinner(pool.matches);

  return pool.players.map((player, playerIndex) => {
    let total = restoredPointsForPlayer(player);
    const points = [{ label: "Restored points", value: total }];

    completedMatches.forEach((match) => {
      const pick = pool.picks.find((item) => item.playerId === player.id && item.matchId === match.id);
      total += scorePick(match, pick, pool.rules);

      if (match.stage.toLowerCase() === "final" && finalWinner && player.champion === finalWinner) {
        total += Number(pool.rules.champion);
      }

      points.push({
        label: `${match.home} vs ${match.away}`,
        value: total,
      });
    });

    return {
      id: player.id,
      name: player.name,
      color: chartColors[playerIndex % chartColors.length],
      points,
      total,
    };
  });
}

function App() {
  const [pool, setPool] = useState(getStoredState);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPlayerId, setSelectedPlayerId] = useState(pool.players[0]?.id ?? "");
  const [draftPlayer, setDraftPlayer] = useState({ name: "" });
  const [draftMatch, setDraftMatch] = useState({ date: "2026-06-11", stage: "Group", home: "TBD", away: "TBD" });
  const [championDrafts, setChampionDrafts] = useState(() =>
    Object.fromEntries(pool.players.map((player) => [player.id, player.champion || "United States"])),
  );
  const [localBackups, setLocalBackups] = useState(getLocalBackups);
  const [saveStatus, setSaveStatus] = useState(CLOUD_SYNC_ENABLED ? "Connecting to shared pool..." : "Saved locally");
  const cloudReadyRef = useRef(!CLOUD_SYNC_ENABLED);
  const saveTimerRef = useRef(null);
  const saveVersionRef = useRef(0);
  const lastCloudJsonRef = useRef("");

  useEffect(() => {
    if (!CLOUD_SYNC_ENABLED) return undefined;
    let cancelled = false;

    async function connectCloudPool() {
      try {
        const cloudPool = await loadCloudPool();
        if (cancelled) return;

        const localPool = normalizePool(getStoredState());
        if (cloudPool) {
          const mergedPool = await loadPoolWithVisibleTableEdits(mergePoolStates(cloudPool, localPool));
          await writeCloudPool(mergedPool);
          if (cancelled) return;
          const mergedJson = JSON.stringify(mergedPool);
          localStorage.setItem(STORAGE_KEY, mergedJson);
          setPool(mergedPool);
          setSelectedPlayerId(mergedPool.players[0]?.id ?? "");
          setChampionDrafts(Object.fromEntries(mergedPool.players.map((player) => [player.id, player.champion || "United States"])));
          lastCloudJsonRef.current = mergedJson;
          setSaveStatus("Shared pool connected");
        } else {
          await saveCloudPool(localPool);
          if (cancelled) return;
          lastCloudJsonRef.current = JSON.stringify(localPool);
          setPool(localPool);
          setSaveStatus("Shared pool created");
        }
      } catch {
        if (!cancelled) setSaveStatus("Shared pool offline, saved locally");
      } finally {
        cloudReadyRef.current = true;
      }
    }

    connectCloudPool();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setLocalBackups(saveLocalBackup(pool));
  }, [pool]);

  useEffect(() => {
    if (!CLOUD_SYNC_ENABLED || !cloudReadyRef.current) return undefined;
    const poolJson = JSON.stringify(pool);
    const saveVersion = saveVersionRef.current;
    localStorage.setItem(STORAGE_KEY, poolJson);
    if (poolJson === lastCloudJsonRef.current) return undefined;

    setSaveStatus("Saving shared pool...");
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      if (saveVersion !== saveVersionRef.current) return;
      try {
        const mergedPool = await saveCloudPool(pool);
        if (saveVersion !== saveVersionRef.current) return;
        const mergedJson = JSON.stringify(mergedPool);
        lastCloudJsonRef.current = mergedJson;
        if (mergedJson !== poolJson) {
          localStorage.setItem(STORAGE_KEY, mergedJson);
          setPool(mergedPool);
        }
        setSaveStatus("Shared pool saved");
      } catch {
        if (saveVersion === saveVersionRef.current) setSaveStatus("Shared pool offline, saved locally");
      }
    }, 450);

    return () => window.clearTimeout(saveTimerRef.current);
  }, [pool]);

  const selectedPlayer = pool.players.find((player) => player.id === selectedPlayerId) ?? pool.players[0];

  const standings = useMemo(() => {
    const finalWinner = getFinalWinner(pool.matches);
    return pool.players
      .map((player) => {
        const matchPoints = pool.matches.reduce((total, match) => {
          const pick = pool.picks.find((item) => item.playerId === player.id && item.matchId === match.id);
          return total + scorePick(match, pick, pool.rules);
        }, 0);
        const championPoints = finalWinner && player.champion === finalWinner ? Number(pool.rules.champion) : 0;
        const restoredPoints = restoredPointsForPlayer(player);
        return { ...player, points: restoredPoints + matchPoints + championPoints, restoredPoints, matchPoints, championPoints };
      })
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  }, [pool]);

  const completedMatches = pool.matches.filter((match) => isFilled(match.homeScore) && isFilled(match.awayScore)).length;
  const recentResults = useMemo(() => (
    pool.matches
      .filter((match) => isFilled(match.homeScore) && isFilled(match.awayScore))
      .sort((a, b) => {
        const aUpdated = Number(a.resultUpdatedAt || 0);
        const bUpdated = Number(b.resultUpdatedAt || 0);
        if (aUpdated !== bUpdated) return bUpdated - aUpdated;
        return `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`);
      })
      .slice(0, 5)
  ), [pool.matches]);
  const topScore = standings[0]?.points ?? 0;
  const progressSeries = useMemo(() => buildProgressSeries(pool), [pool]);

  function updatePool(recipe) {
    setPool((current) => {
      const recipeResult = typeof recipe === "function" ? recipe(current) : recipe;
      const next = recipeResult === current ? current : markPoolUpdated(recipeResult);
      if (next !== current) saveVersionRef.current += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaveStatus(CLOUD_SYNC_ENABLED ? "Saving shared pool..." : "Saved locally");
      return next;
    });
  }

  function addPlayer() {
    const name = draftPlayer.name.trim();
    if (!name) return;
    const player = { id: uid("p"), name, champion: "", championLocked: false, updatedAt: Date.now() };
    updatePool((current) => ({ ...current, players: [...current.players, player] }));
    setSelectedPlayerId(player.id);
    setChampionDrafts((current) => ({ ...current, [player.id]: "United States" }));
    setDraftPlayer({ name: "" });
  }

  function removePlayer(playerId) {
    updatePool((current) => ({
      ...current,
      deletedPlayerIds: [...new Set([...(current.deletedPlayerIds ?? []), playerId])],
      players: current.players.filter((player) => player.id !== playerId),
      picks: current.picks.filter((pick) => pick.playerId !== playerId),
    }));
    setChampionDrafts((current) => {
      const next = { ...current };
      delete next[playerId];
      return next;
    });
    if (selectedPlayerId === playerId) setSelectedPlayerId(pool.players.find((player) => player.id !== playerId)?.id ?? "");
  }

  function addMatch() {
    const match = { ...draftMatch, id: uid("m"), homeScore: "", awayScore: "", resultUpdatedAt: "", updatedAt: Date.now() };
    updatePool((current) => ({ ...current, matches: [...current.matches, match].sort((a, b) => a.date.localeCompare(b.date)) }));
    setDraftMatch({ date: draftMatch.date, stage: "Group", home: "TBD", away: "TBD" });
  }

  function updateMatch(matchId, field, value) {
    updatePool((current) => ({
      ...current,
      matches: current.matches.map((match) => {
        if (match.id !== matchId) return match;
        if (match.resultLocked && (field === "homeScore" || field === "awayScore")) return match;
        const next = { ...match, [field]: value, updatedAt: Date.now() };
        if (field === "homeScore" || field === "awayScore") {
          next.resultUpdatedAt = isFilled(next.homeScore) && isFilled(next.awayScore) ? Date.now() : "";
        }
        return next;
      }),
    }));
  }

  function lockResult(matchId) {
    updatePool((current) => ({
      ...current,
      matches: current.matches.map((match) => (
        match.id === matchId && isFilled(match.homeScore) && isFilled(match.awayScore)
          ? { ...match, resultLocked: true, updatedAt: Date.now() }
          : match
      )),
    }));
  }

  function removeMatch(matchId) {
    updatePool((current) => ({
      ...current,
      matches: current.matches.filter((match) => match.id !== matchId),
      picks: current.picks.filter((pick) => pick.matchId !== matchId),
    }));
  }

  function updatePick(playerId, matchId, field, value) {
    updatePool((current) => {
      const match = current.matches.find((item) => item.id === matchId);
      if (match && isFilled(match.homeScore) && isFilled(match.awayScore)) return current;

      const existing = current.picks.find((pick) => pick.playerId === playerId && pick.matchId === matchId);
      if (existing?.locked) return current;

      const picks = existing
        ? current.picks.map((pick) => (pick.id === existing.id ? { ...pick, [field]: value, updatedAt: Date.now() } : pick))
        : [...current.picks, { id: uid("pick"), playerId, matchId, homeScore: field === "homeScore" ? value : "", awayScore: field === "awayScore" ? value : "", locked: false, updatedAt: Date.now() }];
      return { ...current, picks };
    });
  }

  function lockPick(playerId, matchId) {
    updatePool((current) => ({
      ...current,
      picks: current.matches.some((match) => match.id === matchId && isFilled(match.homeScore) && isFilled(match.awayScore))
        ? current.picks
        : current.picks.some((pick) => pick.playerId === playerId && pick.matchId === matchId)
        ? current.picks.map((pick) => (
          pick.playerId === playerId && pick.matchId === matchId ? { ...pick, locked: true, updatedAt: Date.now() } : pick
        ))
        : [...current.picks, { id: uid("pick"), playerId, matchId, homeScore: "", awayScore: "", locked: true, updatedAt: Date.now() }],
    }));
  }

  function lockChampion(playerId) {
    const champion = championDrafts[playerId] ?? "United States";
    updatePool((current) => ({
      ...current,
      players: current.players.map((player) => (
        player.id === playerId && !player.championLocked
          ? { ...player, champion, championLocked: true, updatedAt: Date.now() }
          : player
      )),
    }));
  }

  function exportPool() {
    const blob = new Blob([JSON.stringify(pool, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "family-world-cup-pool.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function restorePoolBackup(data) {
    const next = markBackupRestored(normalizePool(data));
    const nextJson = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY, nextJson);
    setPool(next);
    setSelectedPlayerId(next.players?.[0]?.id ?? "");
    setChampionDrafts(Object.fromEntries((next.players ?? []).map((player) => [player.id, player.champion || "United States"])));
    setLocalBackups(saveLocalBackup(next, true));
    saveVersionRef.current += 1;
    if (CLOUD_SYNC_ENABLED) {
      setSaveStatus("Restoring backup...");
      await writeCloudPool(next);
      lastCloudJsonRef.current = nextJson;
      setSaveStatus("Backup restored");
    } else {
      setSaveStatus("Backup restored locally");
    }
  }

  function importPool(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await restorePoolBackup(JSON.parse(String(reader.result)));
      } catch {
        setSaveStatus("Import failed");
      }
    };
    reader.readAsText(file);
  }

  async function restoreLatestLocalBackup() {
    const latestBackup = localBackups[0];
    if (!latestBackup?.data) return;
    try {
      await restorePoolBackup(latestBackup.data);
    } catch {
      setSaveStatus("Local backup restore failed");
    }
  }

  function saveLocalBackupNow() {
    setLocalBackups(saveLocalBackup(pool, true));
    setSaveStatus("Local backup saved");
  }

  const tabs = [
    ["dashboard", HandDrawnWorldCupIcon, "Home"],
    ["picks", RealisticClipboardIcon, "Betting"],
    ["matches", RealisticCalendarIcon, "Calendar"],
    ["family", RealisticPlayerIcon, "Add Player"],
    ["settings", RealisticRulesIcon, "Rules"],
  ];

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16} /> 2026 World Cup</p>
        </div>
      </section>

      <nav className="tabs" aria-label="Main views">
        {tabs.map(([id, Icon, label]) => (
          <button key={id} className={`${activeTab === id ? "active" : ""} tab-${id}`} onClick={() => setActiveTab(id)}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>

      {activeTab === "dashboard" && (
        <section className="dashboard-stack">
          <div className="panel">
            <ProgressGraph series={progressSeries} leaders={standings.filter((player) => player.points === topScore)} />
          </div>

          <div className="panel">
            <div className="section-title">
              <h3>Recent Results</h3>
            </div>
            <div className="match-list compact">
              {recentResults.map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
              {recentResults.length === 0 && (
                <p className="empty-state">No results entered yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === "picks" && selectedPlayer && (
        <section className="panel">
          <div className="section-title">
            <div>
              <h3>Choose A Player</h3>
              <p>Click a family member to open their picks.</p>
            </div>
          </div>
          <div className="player-nodes">
            {standings.map((player, index) => {
              return (
                <button
                  className={`player-node ${selectedPlayer.id === player.id ? "active" : ""}`}
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                >
                  <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                  <strong>{player.name}</strong>
                  <em>{player.points ?? 0} pts</em>
                </button>
              );
            })}
          </div>
          <div className="picks-heading">
            <div>
              <h3>{selectedPlayer.name}'s Picks</h3>
            </div>
          </div>
          <div className="champion-row">
            <label>World Cup winner pick</label>
            {selectedPlayer.championLocked ? (
              <strong>{selectedPlayer.champion}</strong>
            ) : (
              <>
                <select
                  value={championDrafts[selectedPlayer.id] ?? "United States"}
                  onChange={(event) => setChampionDrafts((current) => ({ ...current, [selectedPlayer.id]: event.target.value }))}
                >
                  {pool.teams.map((team) => <option key={team}>{team}</option>)}
                </select>
                <button onClick={() => lockChampion(selectedPlayer.id)}><Check size={18} /> Lock pick</button>
              </>
            )}
          </div>
          {selectedPlayer.championLocked ? (
            <div className="pick-table">
              {pool.matches.map((match) => {
                const pick = pool.picks.find((item) => item.playerId === selectedPlayer.id && item.matchId === match.id);
                const isLocked = Boolean(pick?.locked);
                const isClosed = isFilled(match.homeScore) && isFilled(match.awayScore);
                const isInactive = isLocked || isClosed;
                return (
                  <article className={`pick-row ${isInactive ? "locked-pick-row" : ""}`} key={match.id}>
                    <div>
                      <span>{formatMatchDate(match)} · {match.stage}</span>
                      <h4>{match.home} vs {match.away}</h4>
                    </div>
                    <ScoreInputs
                      home={pick?.homeScore ?? ""}
                      away={pick?.awayScore ?? ""}
                      onHome={(value) => updatePick(selectedPlayer.id, match.id, "homeScore", value)}
                      onAway={(value) => updatePick(selectedPlayer.id, match.id, "awayScore", value)}
                      disabled={isInactive}
                    />
                    <strong>{scorePick(match, pick, pool.rules)} pts</strong>
                    {isLocked ? (
                      <span className="locked-badge">Locked</span>
                    ) : isClosed ? (
                      <span className="locked-badge closed-badge">Closed</span>
                    ) : (
                      <button className="pick-lock" onClick={() => lockPick(selectedPlayer.id, match.id)}><Check size={18} /> Lock in</button>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="empty-state champion-required">Lock in a World Cup winner before making game picks.</p>
          )}
        </section>
      )}

      {activeTab === "matches" && (
        <section className="panel">
          <div className="section-title">
            <div>
              <h3>World Cup Calendar</h3>
              <p>All match dates are shown in Montana time.</p>
            </div>
          </div>
          <div className="calendar-legend">
            <span><i></i> Match day</span>
            <span>Scores appear after results are entered</span>
            <span><strong>Montana time</strong></span>
          </div>
          <div className="calendar-grid">
            {worldCupCalendarMonths.map((month) => (
              <CalendarMonth key={month.label} month={month} matches={pool.matches} />
            ))}
          </div>
        </section>
      )}

      {activeTab === "family" && (
        <section className="panel">
          <div className="section-title">
            <div>
              <h3>Players</h3>
            </div>
          </div>
          <div className="add-row family-add">
            <input value={draftPlayer.name} onChange={(event) => setDraftPlayer({ ...draftPlayer, name: event.target.value })} placeholder="Name" />
            <button onClick={addPlayer}><Plus size={18} /> Add</button>
          </div>
          <div className="family-grid">
            {pool.players.map((player) => (
              <article className="family-card" key={player.id}>
                <div className="avatar">{player.name.slice(0, 1).toUpperCase()}</div>
                <div>
                  <h4>{player.name}</h4>
                  <p>{player.championLocked ? `World Cup winner pick: ${player.champion}` : "World Cup winner pick: not locked"}</p>
                </div>
                <button className="icon" onClick={() => removePlayer(player.id)} title="Remove player"><Trash2 size={18} /></button>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "settings" && (
        <section className="settings-stack">
          <div className="panel settings">
            <div className="section-title">
              <div>
                <h3>Scoring Rules</h3>
              </div>
            </div>
            <div className="rule-grid">
              <RuleValue label="Winner + score" value={pool.rules.exact} note="Scores double in Round of 32" />
              <RuleValue label="Winner + goal difference" value={pool.rules.goalDifference} note="Scores double in Round of 32" />
              <RuleValue label="Winner" value={pool.rules.result} note="Scores double in Round of 32" />
              <RuleValue label="World Cup winner" value={pool.rules.champion} />
            </div>
          </div>

          <div className="panel recovery-panel">
            <div className="section-title">
              <div>
                <h3>Disaster Box</h3>
              </div>
            </div>
            <div className="recovery-actions">
              <button onClick={exportPool}>Export current data</button>
              <label className="file-button">
                Import backup
                <input type="file" accept="application/json" onChange={importPool} />
              </label>
              <button onClick={saveLocalBackupNow}>Save local backup now</button>
              <button disabled={!localBackups.length} onClick={restoreLatestLocalBackup}>Restore latest local backup</button>
            </div>
            <p className="recovery-status">
              {localBackups.length
                ? `${localBackups.length} local backups saved. Latest: ${new Date(localBackups[0].createdAt).toLocaleString()} with ${localBackups[0].completedResults} results.`
                : "No local backups saved yet."}
            </p>
            <p className="recovery-status">{saveStatus}</p>
          </div>

          <div className="panel">
            <div className="section-title">
              <div>
                <h3>Game Results</h3>
                <p className="danger-note">DO NOT TOUCH</p>
              </div>
              <span>{completedMatches}/{pool.matches.length} scored</span>
            </div>
            <div className="results-list">
              {pool.matches.map((match) => (
                <article className="result-row" key={match.id}>
                  <div>
                    <span>{formatMatchDate(match)} · {match.stage}</span>
                    <h4>{match.home} vs {match.away}</h4>
                  </div>
                  <ScoreInputs
                    home={match.homeScore}
                    away={match.awayScore}
                    onHome={(value) => updateMatch(match.id, "homeScore", value)}
                    onAway={(value) => updateMatch(match.id, "awayScore", value)}
                    disabled={match.resultLocked}
                  />
                  {match.resultLocked ? (
                    <span className="locked-badge">Locked in</span>
                  ) : (
                    <button
                      className="pick-lock"
                      disabled={!isFilled(match.homeScore) || !isFilled(match.awayScore)}
                      onClick={() => lockResult(match.id)}
                    >
                      <Check size={18} /> Lock in
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function CalendarMonth({ month, matches }) {
  const firstDay = new Date(month.year, month.month, 1);
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const cells = [
    ...Array.from({ length: leadingBlanks }, (_, index) => ({ type: "blank", key: `blank-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateKey = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return {
        type: "day",
        key: dateKey,
        day,
        matches: matches.filter((match) => montanaDateKey(match.date) === dateKey),
      };
    }),
  ];

  return (
    <section className="calendar-month">
      <h4>{month.label}</h4>
      <div className="weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-days">
        {cells.map((cell) => (
          cell.type === "blank" ? (
            <div className="calendar-day blank" key={cell.key}></div>
          ) : (
            <article
              className={`calendar-day ${cell.matches.length ? "has-match" : ""} ${cell.matches.length && cell.matches.every((match) => isFilled(match.homeScore) && isFilled(match.awayScore)) ? "day-complete" : ""} ${month.year === 2026 && month.month === 5 && cell.day === 26 ? "group-deadline" : ""}`}
              data-deadline="All Group stage bets due!!!"
              key={cell.key}
            >
              <strong>{cell.day}</strong>
              {cell.matches.map((match) => {
                const hasScore = isFilled(match.homeScore) && isFilled(match.awayScore);
                return (
                  <span className={hasScore ? "calendar-game completed" : "calendar-game"} key={match.id}>
                    <b>{match.home} vs {match.away}</b>
                    {hasScore && <em>{match.homeScore} - {match.awayScore}</em>}
                  </span>
                );
              })}
            </article>
          )
        ))}
      </div>
    </section>
  );
}

function ProgressGraph({ series, leaders }) {
  const maxSteps = Math.max(1, ...series.map((player) => player.points.length - 1));
  const maxPoints = Math.max(1, ...series.flatMap((player) => player.points.map((point) => point.value)));
  const chartWidth = 720;
  const chartHeight = 260;
  const padding = { top: 24, right: 128, bottom: 42, left: 42 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  function xFor(index) {
    return padding.left + (index / maxSteps) * innerWidth;
  }

  return (
    <div className="progress-graph">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Cumulative points graph for every player">
        <line className="axis" x1={padding.left} y1={padding.top} x2={padding.left} y2={chartHeight - padding.bottom} />
        <line className="axis" x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} />
        {[0, 0.5, 1].map((tick) => {
          const y = padding.top + innerHeight - tick * innerHeight;
          const value = Math.round(maxPoints * tick);
          return (
            <g key={tick}>
              <line className="grid-line" x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} />
              <text className="axis-label" x={padding.left - 10} y={y + 4} textAnchor="end">{value}</text>
            </g>
          );
        })}
        {[0, maxSteps].map((step) => (
          <text key={step} className="axis-label" x={xFor(step)} y={chartHeight - 14} textAnchor={step === 0 ? "start" : "end"}>
            {step === 0 ? "Start" : `${step} result${step === 1 ? "" : "s"}`}
          </text>
        ))}
        {series.map((player) => {
          const path = player.points
            .map((point, pointIndex) => {
              const x = xFor(pointIndex);
              const y = padding.top + innerHeight - (point.value / maxPoints) * innerHeight;
              return `${pointIndex === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
          const lastPoint = player.points[player.points.length - 1];
          const lastX = xFor(player.points.length - 1);
          const lastY = padding.top + innerHeight - (lastPoint.value / maxPoints) * innerHeight;

          return (
            <g key={player.id}>
              <path className="progress-line" d={path} stroke={player.color} />
              <circle className="progress-dot" cx={lastX} cy={lastY} r="4.5" fill={player.color} />
              <text className="line-label" x={lastX + 9} y={lastY + 4} fill={player.color}>{player.name}</text>
            </g>
          );
        })}
      </svg>
      <div className="leader-callout">
        <strong>{leaders.map((player) => player.name).join(", ")}</strong>
        <em>{leaders[0]?.points ?? 0} pts</em>
      </div>
    </div>
  );
}

function MatchRow({ match }) {
  return (
    <article className="match-row">
      <div>
        <span>{formatMatchDate(match)} · {match.stage}</span>
        <strong>{match.home} vs {match.away}</strong>
      </div>
      <p>{isFilled(match.homeScore) && isFilled(match.awayScore) ? `${match.homeScore} - ${match.awayScore}` : "No result"}</p>
    </article>
  );
}

function ScoreInputs({ home, away, onHome, onAway, disabled = false }) {
  const handleScoreChange = (setter) => (event) => {
    setter(event.target.value.replace(/\D/g, ""));
  };

  return (
    <div className="score-inputs">
      <input type="text" inputMode="numeric" pattern="[0-9]*" value={home} onChange={handleScoreChange(onHome)} aria-label="Home score" disabled={disabled} />
      <span>-</span>
      <input type="text" inputMode="numeric" pattern="[0-9]*" value={away} onChange={handleScoreChange(onAway)} aria-label="Away score" disabled={disabled} />
    </div>
  );
}

function RuleValue({ label, value, note = "" }) {
  return (
    <article className="rule">
      <span>{label}</span>
      {note && <em>{note}</em>}
      <strong>{value}</strong>
      <Medal size={20} />
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);
