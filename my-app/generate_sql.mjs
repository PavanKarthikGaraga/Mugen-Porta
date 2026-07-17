import fs from 'fs';
import { ACTIVITIES } from './src/app/Data/activities-mock.js';

const PACK_EMOJI_MAP = {
  "Artificial Intelligence": "🧠",
  "Blockchain & Web3": "⛓️",
  "Cloud Computing & DevOps": "☁️",
  "Cybersecurity & Digital Trust": "🛡️",
  "Data Science & Analytics": "📊",
  "Internet of Things (IoT)": "🔌",
  "AgriTech": "🌾",
  "Biotechnology": "🧬",
  "SpaceTech": "🚀",
  "Robotics & Automation": "🤖",
  "FinTech": "💰",
  "Smart Cities": "🏙️",
  "EdTech": "📚",
  "Technology Policy": "⚖️"
};

const LEVEL_RARITY_MAP = {
  "explorer": "Common",
  "foundation": "Common",
  "practitioner": "Rare",
  "leader": "Epic",
  "fellow": "Legendary"
};

let sql = `
-- Clear existing activity badges
DELETE FROM badge_definitions WHERE type = 'activity';
UPDATE activity_catalogue SET badge_id = NULL;

`;

// Note: since activities-mock.ts is typescript, I will just read it as text and parse it if I have to. 
// Actually, it's easier to just run ts-node, or I can use the API route.
