import { StyleSheet, View } from 'react-native';

import { espaco, useCores } from '@/theme/colors';
import { Texto } from './Texto';

export type TomSelo = 'sucesso' | 'alerta' | 'erro' | 'neutro';

export function Selo({ texto, tom = 'neutro' }: { texto: string; tom?: TomSelo }) {
  const c = useCores();
  const cores = {
    sucesso: [c.sucessoFundo, c.sucesso],
    alerta: [c.alertaFundo, c.alerta],
    erro: [c.erroFundo, c.erro],
    neutro: [c.destaque, c.escura],
  }[tom];
  return (
    <View style={[styles.selo, { backgroundColor: cores[0] }]}>
      <Texto variante="legenda" cor={cores[1]} style={styles.texto}>
        {texto}
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  selo: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: espaco.m, paddingVertical: espaco.xs },
  texto: { fontWeight: '600' },
});
