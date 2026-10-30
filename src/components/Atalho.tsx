import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { espaco, raio, useCores } from '@/theme/colors';
import { Texto } from './Texto';

export function Atalho({ titulo, icone: Icone, onPress }: { titulo: string; icone: LucideIcon; onPress: () => void }) {
  const c = useCores();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      style={({ pressed }) => [
        styles.atalho,
        { backgroundColor: c.superficie, borderColor: c.borda, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Icone size={28} color={c.principal} aria-hidden />
      <Texto variante="forte" style={styles.texto}>
        {titulo}
      </Texto>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  atalho: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 96,
    borderRadius: raio.grande,
    borderWidth: StyleSheet.hairlineWidth,
    padding: espaco.l,
    gap: espaco.s,
    justifyContent: 'center',
  },
  texto: {},
});
