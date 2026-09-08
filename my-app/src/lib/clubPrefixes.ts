export const CLUB_PREFIXES: Record<string, string> = {
  // Engineering Dept.
  "Code Forge": "COFO",
  "Intellifusion": "INTE",
  "Cipher AI - AI&DS": "CIAI",
  "Skynetics - AI&DS": "SKAI",
  "QuantumX AI": "QXAI",
  "Tensor Tribe": "TETR",
  "Threat Zero": "THZE",
  "Gencraft AI": "GCAI",
  "Biotechnology Outreach Leadership Team (BOLT)": "BOLT",
  "Civil Engineering Association (CEA)": "CEA",
  "Cognitive - CSE - 1": "COG1",
  "Megha": "MEGH",
  "RPA": "RPA",
  "The Blockchain Hub": "TBCH",
  "Aprameya": "APRA",
  "Expedite": "EXPD",
  "School of Competitive Coding": "SCC",
  "Broadband Networks": "BBNT",
  "Google Developer Groups": "GDG",
  "School of Data Science": "SDS",
  "Intel Innovation": "ININ",
  "Mayavi": "MAYA",
  "AWS": "AWS",
  "Whitehat Hackers": "WHH",
  "Rubix": "RUBX",
  "Forensixplorer": "FORE",
  "Always@VLSI": "AVLS",
  "Embedded & IoT Club": "EIOT",
  "Robotronics": "ROBO",
  "National Instruments / KLEF NI COE (NICDE Club)": "NICD",
  "Swecha Organization": "SWEC",
  "KLSAT": "KLSA",
  "Nanotronics": "NANO",
  "TEach A Machine (TEAM)": "TEAM",
  "Tesla Club": "TESL",
  "Cyber Security & Compliance Club": "CSCC",
  "CONNECT": "CONN",
  "KL Researchers Club": "KLRC",
  "IOTRIX": "IOTX",
  "KL CIIE": "KCII",
  "Automobile Club": "AUTO",
  "KL Forge (ELGE)": "KLFG",
  "DataScience_AI Dynamics": "DSAD",
  "E-FIT": "EFIT",
  "Food Technology + Innovations": "FTIN",
  "Cine Fusion": "CIFU",
  "Faraday Club": "FARA",

  // MHS Dept.
  "Smart Farming Club": "SMFC",
  "Rural Entrepreneurship Club": "RUEC",
  "Sustainable Agriculture Club": "SUAG",
  "BuiltTech Club": "BTEC",
  "City Makers Club": "CYMK",
  "Green Habitat Club": "GRHB",
  "Interior Design Club": "INDC",
  "AI Builders Club": "AIBC",
  "App Factory Club": "APFC",
  "Cyber Security Club": "CYSC",
  "ACCA Professional Club": "ACCA",
  "Tax & Audit Club": "TXAC",
  "Corporate Finance Club": "COFI",
  "Moot Court & Advocacy Club": "MCAC",
  "Legal Aid & Social Justice Club": "LASJ",
  "Legal Warriers Club": "LWAR",
  "Startup Founders Club": "STFC",
  "Marketing Mavericks Club": "MAMC",
  "Investment & Wealth Club": "INWC",
  "Business Analytics Club": "BACT",
  "HR & Leadership Club": "HRLC",
  "Healthcare Innovation Club": "HCIC",
  "Clinical Pharmacy Club": "CLPC",
  "Health Medicine and Wellness Club": "HMWC",
  "Pharma Research Club": "PHRC",
  "Public Health and Community Care Club": "PHCC",
};

export function getClubPrefix(clubName: string, domain: string): string {
  if (!clubName) return "";
  
  let prefix = CLUB_PREFIXES[clubName];
  if (!prefix) {
    // Auto-generate fallback: first 4 alphabetical chars, uppercase
    prefix = clubName.replace(/[^A-Za-z]/g, "").substring(0, 4).toUpperCase();
  }

  // The format should be DEPT-[PREFIX]- or MHS-[PREFIX]-
  if (domain === "DEPT. CLUBS") {
    return `DEPT-${prefix}-`;
  } else if (domain === "MHS. CLUBS") {
    return `MHS-${prefix}-`;
  }
  
  return `${prefix}-`;
}
