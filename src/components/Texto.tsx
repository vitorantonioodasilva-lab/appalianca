import { Text, type TextProps } from 'react-native';

import { useCores } from '@/theme/colors';

type Variante = 'titulo' | 'subtitulo' | 'corpo' | 'forte' | 'legenda' | 'valor';

const estilos: Record<Variante, { fontSize: number; fontWeight: '400' | '600' | '700'; lineHeight: number }> = {
  titulo: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  subtitulo: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  corpo: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  forte: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  legenda: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  valor: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
};

export function Texto({
  variante = 'corpo',
  secundario,
  cor,
  style,
  ...props
}: TextProps & { variante?: Variante; secundario?: boolean; cor?: string }) {
  const c = useCores();
  return (
    <Text
      maxFontSizeMultiplier={2}
      {...props}
      accessibilityRole={variante === 'titulo' ? 'header' : props.accessibilityRole}
      style={[estilos[variante], { color: cor ?? (secundario ? c.textoSecundario : c.texto) }, style]}
    />
  );
}
