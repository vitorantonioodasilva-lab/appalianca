import { StyleSheet, View } from 'react-native';

import { espaco } from '@/theme/colors';
import { Texto } from './Texto';

/** "Rótulo ........ valor", que quebra em duas linhas com fonte grande. */
export function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.linha} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Texto secundario style={styles.rotulo}>
        {rotulo}
      </Texto>
      <Texto variante="forte" style={styles.valor}>
        {valor}
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: espaco.s },
  rotulo: { flexShrink: 1 },
  valor: { flexShrink: 1, textAlign: 'right' },
});
