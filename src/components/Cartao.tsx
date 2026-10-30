import { StyleSheet, View, type ViewProps } from 'react-native';

import { espaco, raio, useCores } from '@/theme/colors';

export function Cartao({ style, ...props }: ViewProps) {
  const c = useCores();
  return <View {...props} style={[styles.cartao, { backgroundColor: c.superficie, borderColor: c.borda }, style]} />;
}

const styles = StyleSheet.create({
  cartao: { borderRadius: raio.grande, borderWidth: StyleSheet.hairlineWidth, padding: espaco.l, gap: espaco.s },
});
