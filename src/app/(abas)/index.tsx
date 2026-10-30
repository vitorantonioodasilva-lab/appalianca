import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, FileSignature, FileUp, IdCard, ReceiptText, Siren } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import type { Veiculo } from '@/api/types';
import { Atalho } from '@/components/Atalho';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Cartao } from '@/components/Cartao';
import { Carregando, ErroComTentar } from '@/components/Estados';
import { Selo } from '@/components/Selo';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useCobrancas, useResumo } from '@/lib/consultas';
import { dinheiro } from '@/lib/formato';
import { rotuloDoVeiculo, tituloDoVeiculo, tomDoVeiculo } from '@/lib/situacao';
import { espaco, useCores } from '@/theme/colors';

export default function Inicio() {
  const router = useRouter();
  const resumo = useResumo();
  const cobrancas = useCobrancas();
  const a = resumo.data?.associado;

  const atualizar = () => {
    void resumo.refetch();
    void cobrancas.refetch();
  };

  const titulo = a?.primeiroNome ? `Olá, ${a.primeiroNome}` : 'Olá';
  const subtitulo = a?.matricula ? `Matrícula ${a.matricula}` : undefined;
  const emAberto = cobrancas.data?.emAberto ?? [];
  const totalAberto = emAberto.reduce((t, c) => t + (c.valorHoje ?? 0), 0);

  return (
    <Tela titulo={titulo} subtitulo={subtitulo} atualizar={atualizar} atualizando={resumo.isRefetching}>
      {emAberto.length > 0 ? (
        <Aviso tom="alerta" titulo={emAberto.length === 1 ? 'Você tem uma cobrança em aberto' : `Você tem ${emAberto.length} cobranças em aberto`}>
          <Texto>Total hoje: {dinheiro(totalAberto)}</Texto>
          <Botao titulo="Ver 2ª via" variante="secundario" onPress={() => router.navigate('/cobrancas')} />
        </Aviso>
      ) : null}

      <View style={styles.atalhos}>
        <Atalho titulo="2ª via" icone={ReceiptText} onPress={() => router.navigate('/cobrancas')} />
        <Atalho titulo="Carteirinha" icone={IdCard} onPress={() => router.navigate('/carteirinha')} />
        <Atalho titulo="Abrir evento" icone={Siren} onPress={() => router.push('/evento')} />
        <Atalho titulo="Documentos" icone={FileUp} onPress={() => router.push('/documentos')} />
        <Atalho titulo="Contratos" icone={FileSignature} onPress={() => router.push('/contratos')} />
      </View>

      <Texto variante="subtitulo">Seus veículos</Texto>
      {resumo.isPending ? (
        <Carregando />
      ) : resumo.isError ? (
        <ErroComTentar erro={resumo.error} tentar={atualizar} />
      ) : (resumo.data.veiculos ?? []).length === 0 ? (
        <Texto secundario>Nenhum veículo no seu cadastro.</Texto>
      ) : (
        (resumo.data.veiculos ?? []).map((v) => (
          <CartaoVeiculo key={v.id} veiculo={v} onDetalhes={() => router.push({ pathname: '/beneficio', params: { id: v.id ?? '' } })} />
        ))
      )}
    </Tela>
  );
}

function CartaoVeiculo({ veiculo: v, onDetalhes }: { veiculo: Veiculo; onDetalhes: () => void }) {
  const c = useCores();
  const router = useRouter();
  return (
    <Cartao>
      <Texto variante="forte">{tituloDoVeiculo(v)}</Texto>
      {v.plano ? <Texto secundario>{v.plano}</Texto> : null}
      <Selo texto={rotuloDoVeiculo(v)} tom={tomDoVeiculo(v.situacao)} />
      {v.situacaoTexto ? <Texto>{v.situacaoTexto}</Texto> : null}

      {v.situacao === 'AGUARDANDO_ATIVACAO' && (v.ativacao ?? []).length > 0 ? (
        <View style={styles.etapas} accessibilityLabel="Etapas da ativação">
          {(v.ativacao ?? []).map((e) => (
            <View key={e.etapa} style={styles.etapa} accessible accessibilityLabel={`${e.etapa}: ${e.feita ? 'feita' : 'falta'}`}>
              {e.feita ? (
                <CheckCircle2 size={20} color={c.sucesso} aria-hidden />
              ) : (
                <Circle size={20} color={c.textoSecundario} aria-hidden />
              )}
              <Texto style={styles.flex} secundario={!e.feita}>
                {e.etapa}
              </Texto>
            </View>
          ))}
        </View>
      ) : null}

      {v.situacao === 'SUSPENSO' ? (
        <Aviso tom="alerta" titulo="O que fazer">
          {v.novaVistoria
            ? 'Depois do pagamento, o veículo precisa de uma nova vistoria para voltar. Mande as fotos em Documentos ou fale com a Aliança.'
            : 'Pague a cobrança em aberto na 2ª via. O benefício volta quando o pagamento for confirmado.'}
        </Aviso>
      ) : null}
      {v.situacao === 'SUSPENSO' ? (
        <Botao
          titulo={v.novaVistoria ? 'Mandar fotos do veículo' : 'Ver 2ª via'}
          variante="secundario"
          onPress={() => (v.novaVistoria ? router.push('/documentos') : router.navigate('/cobrancas'))}
        />
      ) : null}
      <Botao titulo="Ver situação do benefício" variante="texto" onPress={onDetalhes} />
    </Cartao>
  );
}

const styles = StyleSheet.create({
  atalhos: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.m },
  etapas: { gap: espaco.s, marginTop: espaco.xs },
  etapa: { flexDirection: 'row', gap: espaco.s, alignItems: 'center' },
  flex: { flex: 1 },
});
