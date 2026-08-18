export interface StepIcon {
  xmlns: string;
  fill: string;
  viewBox: string;
  stroke: string;
  strokeWidth: number;
  path: string;
  class: string;
}

export interface StepIconConfig {
  name: string;
  icon: StepIcon;
}

export const ICON_MAP: StepIconConfig[] = [
  {
    name: 'user',
    icon: {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      path: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
      class: 'w-6 h-6'
    }
  },

  {
    name: 'identification',
    icon: {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      path: 'M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z',
      class: 'w-6 h-6'
    }
  },

  {
    name: 'document',
    icon: {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      path: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5V5.25A2.25 2.25 0 0 0 12.375 3h-6.75A2.25 2.25 0 0 0 3.375 5.25v13.5A2.25 2.25 0 0 0 5.625 21h10.5a2.25 2.25 0 0 0 2.25-2.25v-1.125',
      class: 'w-6 h-6'
    }
  },

  {
    name: 'paperclip',
    icon: {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      path: 'm18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94a3 3 0 0 1 4.243 4.243l-10.94 10.94a1.5 1.5 0 0 1-2.121-2.121l9.879-9.879',
      class: 'w-6 h-6'
    }
  },

  {
    name: 'check',
    icon: {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      path: 'm4.5 12.75 6 6 9-13.5',
      class: 'w-6 h-6'
    }
  }
];