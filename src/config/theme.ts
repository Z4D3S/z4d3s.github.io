export const siteConfig = {
  title: 'NightOps',
  subtitle: 'Blue Team | SOC | Threat Intelligence',
  description: 'Documentación técnica de análisis forense digital, respuesta a incidentes, threat hunting y operaciones de seguridad defensiva.',
  url: 'https://nightops.blog',
  author: 'NightOps',
};

export const theme = {
  colors: {
    cyber: {
      black: '#050505',
      dark: '#0a0a0f',
      gray: '#12121a',
      border: '#1a1a2e',
      accent: '#00d4ff',
      accent_dim: '#00a8cc',
      blue: '#0066ff',
      blue_light: '#3399ff',
      red: '#ff3366',
      yellow: '#ffcc00',
      purple: '#9966ff',
      orange: '#ff6600',
      green: '#00ff66',
    },
    light: {
      background: '#f0f2f5',
      card: '#ffffff',
      text: '#1a1a2e',
      textMuted: '#666680',
      border: '#d0d0e0',
      accent: '#0066ff',
    },
  },
  fonts: {
    mono: 'JetBrains Mono, Fira Code, Consolas, monospace',
    sans: 'Inter, system-ui, sans-serif',
  },
};

export const categories = [
  { id: 'forensics', label: 'Digital Forensics', icon: 'search', desc: 'Análisis forense de artefactos digitales' },
  { id: 'incident-response', label: 'Incident Response', icon: 'alert-triangle', desc: 'Respuesta y contención de incidentes' },
  { id: 'threat-hunting', label: 'Threat Hunting', icon: 'crosshair', desc: 'Cazas de amenazas proactivas' },
  { id: 'malware-analysis', label: 'Malware Analysis', icon: 'bug', desc: 'Análisis de malware y código malicioso' },
  { id: 'log-analysis', label: 'Log Analysis', icon: 'file-text', desc: 'Análisis de logs y detección de anomalías' },
  { id: 'threat-intel', label: 'Threat Intel', icon: 'satellite', desc: 'Inteligencia de amenazas' },
  { id: 'tools', label: 'Tools', icon: 'wrench', desc: 'Herramientas y scripts' },
  { id: 'case-studies', label: 'Case Studies', icon: 'folder', desc: 'Casos de estudio reales' },
];

export const socSkills = [
  { name: 'SIEM', level: 90 },
  { name: 'Splunk', level: 85 },
  { name: 'Wazuh', level: 80 },
  { name: 'ELK', level: 75 },
  { name: 'Zeek', level: 70 },
  { name: 'Wireshark', level: 85 },
  { name: 'Volatility', level: 75 },
  { name: 'FTK Imager', level: 80 },
  { name: 'Autopsy', level: 70 },
  { name: 'YARA', level: 85 },
  { name: 'Sigma', level: 80 },
  { name: 'MITRE ATT&CK', level: 90 },
];

export const quickLinks = [
  { label: 'MITRE ATT&CK', url: 'https://attack.mitre.org', icon: 'shield' },
  { label: 'Virustotal', url: 'https://virustotal.com', icon: 'search' },
  { label: 'AlienVault OTX', url: 'https://otx.alienvault.com', icon: 'radio' },
  { label: 'AbuseIPDB', url: 'https://abuseipdb.com', icon: 'alert-octagon' },
  { label: 'URLScan', url: 'https://urlscan.io', icon: 'scan' },
];
