import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { espaco, raio, toqueMinimo, useCores } from '@/theme/colors';
import { Texto } from './Texto';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'principal' | 'secundario' | 'texto';
  icone?: LucideIcon;
  carregando?: boolean;
  desativado?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export function Botao({
  titulo,
  onPress,
  variante = 'principal',
  icone: Icone,
  carregando,
  desativado,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: Props) {
  const c = useCores();
  const inativo = desativado || carregando;
  const corTexto = variante === 'principal' ? c.principalTexto : c.principal;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inativo, busy: !!carregando }}
      style={({ pressed }) => [
        styles.base,
        variante === 'principal' && { backgroundColor: c.principal },
        variante === 'secundario' && { backgroundColor: c.destaque, borderColor: c.principal, borderWidth: 1 },
        variante === 'texto' && styles.texto,
        (pressed || inativo) && { opacity: inativo ? 0.55 : 0.8 },
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <View style={styles.linha}>
          {Icone ? <Icone size={20} color={corTexto} aria-hidden /> : null}
          <Texto variante="forte" cor={corTexto} style={styles.rotulo}>
            {titulo}
          </Texto>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: toqueMinimo + 4,
    borderRadius: raio.pequeno,
    paddingHorizontal: espaco.l,
    paddingVertical: espaco.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { minHeight: toqueMinimo, paddingVertical: espaco.s },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.s },
  rotulo: { textAlign: 'center', flexShrink: 1 },
});
