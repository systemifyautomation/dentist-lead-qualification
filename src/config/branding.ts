export const clinicBrand = {
  name: import.meta.env.VITE_CLINIC_NAME?.trim() || 'Votre clinique',
  logoUrl: import.meta.env.VITE_CLINIC_LOGO_URL?.trim() || '',
} as const;
