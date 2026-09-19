export interface ToolItem {
  id: string;
  name: string;
  nameEn: string;
  subtitle: string;
  url: string;
  isExternal: boolean;
  icon: string;
  badge: string;
  description: string;
  techStack: string[];
  protocol: string;
  alienCodename: string;
  status: 'ONLINE' | 'STANDBY' | 'READY';
  features: string[];
}

