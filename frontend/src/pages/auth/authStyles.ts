// Estilos compartidos para pantallas de autenticación y páginas legales
export const gradientButtonSx = {
  py: 1.25,
  borderRadius: 3,
  textTransform: 'none' as const,
  fontWeight: 800,
  color: 'common.white',
  boxShadow: '0 12px 28px rgba(243,156,18,.35)',
  background: 'linear-gradient(180deg,#F5B041 0%, #F39C12 100%)',
  '&:hover': { background: 'linear-gradient(180deg,#F0A030 0%, #E08E0E 100%)' },
  '&:disabled': { opacity: 0.5, color: 'common.white' },
};
