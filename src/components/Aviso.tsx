import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { espaco, raio, useCores } from '@/theme/colors';
import { Texto } from './Texto';

type Tom = 'info' | 'alerta' | 'erro' | 'sucesso';

export function Aviso({ tom = 'info', titulo, children }: { tom?: Tom; titulo?: string; children?: ReactNode }) {
  const c = useCores();
  const mapa = {
    info: { fundo: c.destaque, cor: c.escura, Icone: Info },
    alerta: { fundo: c.alertaFundo, cor: c.alerta, Icone: AlertTriangle },
    erro: { fundo: c.erroFundo, cor: c.erro, Icone: XCircle },
    sucesso: { fundo: c.sucessoFundo, cor: c.sucesso, Icone: CheckCircle2 },
  }[tom];
  const { Icone } = mapa;
  return (
    <View style={[styles.caixa, { backgroundColor: mapa.fundo }]} accessibilityRole={tom === 'erro' ? 'alert' : undefined}>
      <Icone size={20} color={mapa.cor} aria-hidden />
      <View style={styles.conteudo}>
        {titulo ? (
          <Texto variante="forte" cor={mapa.cor}>
            {titulo}
          </Texto>
        ) : null}
        {typeof children === 'string' ? <Texto cor={mapa.cor}>{children}</Texto> : children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { flexDirection: 'row', gap: espaco.m, padding: espaco.l, borderRadius: raio.medio, alignItems: 'flex-start' },
  conteudo: { flex: 1, gap: espaco.xs },
});
