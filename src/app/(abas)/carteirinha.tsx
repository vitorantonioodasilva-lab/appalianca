import * as Brightness from 'expo-brightness';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { MessageCircle, Phone, WifiOff } from 'lucide-react-native';
import { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import type { Carteirinha as TCarteirinha } from '@/api/types';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Cartao } from '@/components/Cartao';
import { Carregando, ErroComTentar, Vazio } from '@/components/Estados';
import { Logo } from '@/components/Logo';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { abrirLink } from '@/lib/acoes';
import { useCarteirinha } from '@/lib/consultas';
import { dataHora, linkTelefone, linkWhatsapp } from '@/lib/formato';
import { espaco, raio, useCores } from '@/theme/colors';

/** Brilho no máximo enquanto a carteirinha está na tela; volta ao sair. */
function useBrilhoMaximo() {
  useFocusEffect(
    useCallback(() => {
      let anterior: number | null = null;
      let ativo = true;
      (async () => {
        try {
          anterior = await Brightness.getBrightnessAsync();
          if (ativo) await Brightness.setBrightnessAsync(1);
        } catch {
          // aparelho sem controle de brilho
        }
      })();
      return () => {
        ativo = false;
        const restaurar =
          Platform.OS === 'android'
            ? Brightness.restoreSystemBrightnessAsync()
            : anterior !== null
              ? Brightness.setBrightnessAsync(anterior)
              : Promise.resolve();
        restaurar.catch(() => undefined);
      };
    }, []),
  );
}

export default function Carteirinha() {
  useBrilhoMaximo();
  const consulta = useCarteirinha();
  const r = consulta.data?.resposta;
  const assistencia = r?.assistencia24h;

  return (
    <Tela
      titulo="Carteirinha"
      subtitulo="Mostre quando pedirem"
      atualizar={() => void consulta.refetch()}
      atualizando={consulta.isRefetching}
    >
      {consulta.isPending ? (
        <Carregando />
      ) : consulta.isError ? (
        <ErroComTentar erro={consulta.error} tentar={() => void consulta.refetch()} />
      ) : (
        <>
          {consulta.data.offline ? (
            <Aviso tom="alerta" titulo="Sem internet">
              {`Mostrando a última carteirinha guardada, conferida em ${dataHora(consulta.data.conferidaEm)}.`}
            </Aviso>
          ) : null}

          {(r?.carteirinhas ?? []).length === 0 ? (
            <Vazio texto="A carteirinha aparece aqui quando a proteção de um veículo estiver ativa." />
          ) : (
            (r?.carteirinhas ?? []).map((c, i) => <CartaoCarteirinha key={`${c.placa ?? i}`} carteirinha={c} />)
          )}

          {assistencia?.telefone0800 || assistencia?.whatsapp ? (
            <Cartao>
              <Texto variante="forte">Assistência 24 h</Texto>
              {assistencia.telefone0800 ? (
                <Botao
                  titulo={`Ligar ${assistencia.telefone0800}`}
                  icone={Phone}
                  accessibilityLabel={`Ligar para a assistência 24 horas, ${assistencia.telefone0800}`}
                  onPress={() => abrirLink(linkTelefone(assistencia.telefone0800!))}
                />
              ) : null}
              {assistencia.whatsapp ? (
                <Botao
                  titulo="WhatsApp da assistência"
                  icone={MessageCircle}
                  variante="secundario"
                  onPress={() =>
                    abrirLink(
                      assistencia.whatsapp!.startsWith('http') ? assistencia.whatsapp! : linkWhatsapp(assistencia.whatsapp!),
                    )
                  }
                />
              ) : null}
            </Cartao>
          ) : null}

          {!consulta.data.offline ? (
            <Texto variante="legenda" secundario style={styles.centro}>
              Conferida em {dataHora(consulta.data.conferidaEm)}. Funciona sem internet.
            </Texto>
          ) : (
            <Botao titulo="Tentar atualizar" icone={WifiOff} variante="texto" onPress={() => void consulta.refetch()} />
          )}
        </>
      )}
    </Tela>
  );
}

function CartaoCarteirinha({ carteirinha: k }: { carteirinha: TCarteirinha }) {
  const c = useCores();
  const descricao = [
    k.nome,
    k.matricula ? `matrícula ${k.matricula}` : null,
    k.placa ? `placa ${k.placa}` : null,
    k.veiculo,
    k.plano,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <LinearGradient
      colors={[c.degradeInicio, c.degradeFim]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cartao}
      accessible
      accessibilityLabel={`Carteirinha: ${descricao}`}
    >
      <View style={styles.topo}>
        <Logo tamanho={40} />
        <View style={styles.flex}>
          <Texto variante="forte" cor="#FFFFFF">
            Aliança Brasil
          </Texto>
          <Texto variante="legenda" cor="#E6F4F5">
            Proteção veicular
          </Texto>
        </View>
        <View style={[styles.selo, { backgroundColor: '#FFFFFF' }]}>
          <Texto variante="legenda" cor="#0C646D" style={styles.negrito}>
            Ativo
          </Texto>
        </View>
      </View>
      <Texto variante="subtitulo" cor="#FFFFFF">
        {k.nome}
      </Texto>
      <View style={styles.grade}>
        <Campo rotulo="Matrícula" valor={k.matricula != null ? String(k.matricula) : '—'} />
        <Campo rotulo="CPF" valor={k.documento ?? '—'} />
        <Campo rotulo="Placa" valor={k.placa ?? '—'} />
        <Campo rotulo="Plano" valor={k.plano ?? '—'} />
      </View>
      <Campo rotulo="Veículo" valor={k.veiculo ?? '—'} />
      {k.emitidaEm ? (
        <Texto variante="legenda" cor="#E6F4F5">
          Situação conferida em {dataHora(k.emitidaEm)}
        </Texto>
      ) : null}
    </LinearGradient>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.campo}>
      <Texto variante="legenda" cor="#CDEBEE">
        {rotulo}
      </Texto>
      <Texto variante="forte" cor="#FFFFFF">
        {valor}
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { borderRadius: raio.grande, padding: espaco.xl, gap: espaco.m },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.m },
  flex: { flex: 1 },
  selo: { borderRadius: 999, paddingHorizontal: espaco.m, paddingVertical: espaco.xs },
  negrito: { fontWeight: '700' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', rowGap: espaco.m },
  campo: { flexBasis: '50%', flexGrow: 1, gap: 2 },
  centro: { textAlign: 'center' },
});
