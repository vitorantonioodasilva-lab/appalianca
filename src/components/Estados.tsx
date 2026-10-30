import { RefreshCw, WifiOff } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { mensagemDoErro, RedeError } from '@/api/errors';
import { espaco, useCores } from '@/theme/colors';
import { Botao } from './Botao';
import { Texto } from './Texto';

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  const c = useCores();
  return (
    <View style={styles.centro} accessibilityLabel={texto} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={c.principal} />
      <Texto secundario>{texto}</Texto>
    </View>
  );
}

export function ErroComTentar({ erro, tentar }: { erro: unknown; tentar: () => void }) {
  const c = useCores();
  return (
    <View style={styles.centro} accessibilityRole="alert">
      {erro instanceof RedeError ? <WifiOff size={36} color={c.textoSecundario} aria-hidden /> : null}
      <Texto style={styles.texto}>{mensagemDoErro(erro)}</Texto>
      <Botao titulo="Tentar de novo" icone={RefreshCw} variante="secundario" onPress={tentar} />
    </View>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return (
    <View style={styles.vazio}>
      <Texto secundario style={styles.texto}>
        {texto}
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', gap: espaco.l, padding: espaco.xl, minHeight: 240 },
  vazio: { padding: espaco.xl },
  texto: { textAlign: 'center' },
});
