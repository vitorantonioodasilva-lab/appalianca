import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { Veiculo } from '@/api/types';
import { Aviso } from '@/components/Aviso';
import { Cartao } from '@/components/Cartao';
import { Carregando, ErroComTentar, Vazio } from '@/components/Estados';
import { Linha } from '@/components/Linha';
import { Selo } from '@/components/Selo';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useCobrancas, useResumo } from '@/lib/consultas';
import { data, dinheiro, percentual } from '@/lib/formato';
import { rotuloDoVeiculo, tituloDoVeiculo, tomDoVeiculo } from '@/lib/situacao';
import { espaco } from '@/theme/colors';

export default function Beneficio() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const resumo = useResumo();
  const cobrancas = useCobrancas();
  const atrasado = (cobrancas.data?.emAberto ?? []).some((c) => (c.diasAtraso ?? 0) > 0);

  const atualizar = () => {
    void resumo.refetch();
    void cobrancas.refetch();
  };

  const todos = resumo.data?.veiculos ?? [];
  const veiculos = id ? todos.filter((v) => v.id === id) : todos;

  return (
    <Tela titulo="Situação do benefício" voltar atualizar={atualizar} atualizando={resumo.isRefetching}>
      {resumo.isPending ? (
        <Carregando />
      ) : resumo.isError ? (
        <ErroComTentar erro={resumo.error} tentar={atualizar} />
      ) : veiculos.length === 0 ? (
        <Vazio texto="Nenhum veículo encontrado." />
      ) : (
        veiculos.map((v) => <DetalheVeiculo key={v.id} veiculo={v} atrasado={atrasado} />)
      )}
    </Tela>
  );
}

function DetalheVeiculo({ veiculo: v, atrasado }: { veiculo: Veiculo; atrasado: boolean }) {
  const p = v.participacao;
  return (
    <>
      <Cartao>
        <Texto variante="subtitulo">{tituloDoVeiculo(v)}</Texto>
        <Selo texto={rotuloDoVeiculo(v)} tom={tomDoVeiculo(v.situacao)} />
        {v.situacaoTexto ? <Texto>{v.situacaoTexto}</Texto> : null}
      </Cartao>

      {atrasado || v.situacao === 'SUSPENSO' ? (
        <Aviso tom="alerta" titulo="Pagamento em atraso">
          O benefício volta quando o pagamento for confirmado. Use a 2ª via para pagar com Pix, boleto ou cartão.
        </Aviso>
      ) : null}

      <Cartao>
        <Texto variante="forte">Plano</Texto>
        <Linha rotulo="Plano" valor={v.plano ?? '—'} />
        <Linha rotulo="Mensalidade" valor={dinheiro(v.mensalidade)} />
        <Linha rotulo="Vencimento" valor={v.diaVencimento ? `Todo dia ${v.diaVencimento}` : '—'} />
        <Linha rotulo="Proteção desde" valor={data(v.protecaoDesde?.socorroMutuo)} />
        <Linha rotulo="Assistência 24 h desde" valor={data(v.protecaoDesde?.assistencia24h)} />
        <Linha rotulo="Reboque" valor={typeof v.guinchoKm === 'number' ? `Até ${v.guinchoKm} km` : '—'} />
      </Cartao>

      {p && (p.percentual != null || p.minimo != null || p.valor != null) ? (
        <Cartao>
          <Texto variante="forte">Cota de participação</Texto>
          {p.percentual != null ? <Linha rotulo="Percentual" valor={percentual(p.percentual)} /> : null}
          {p.minimo != null ? <Linha rotulo="Mínimo" valor={dinheiro(p.minimo)} /> : null}
          {p.valor != null ? <Linha rotulo="Valor" valor={dinheiro(p.valor)} /> : null}
        </Cartao>
      ) : null}

      {(v.beneficios ?? []).length > 0 ? (
        <Cartao>
          <Texto variante="forte">Benefícios do plano</Texto>
          {(v.beneficios ?? []).map((b, i) => (
            <View key={`${b.title}-${i}`} style={styles.grupo}>
              {b.title ? <Texto variante="forte">{b.title}</Texto> : null}
              {(b.items ?? []).map((item) => (
                <Texto key={item}>• {item}</Texto>
              ))}
            </View>
          ))}
        </Cartao>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espaco.xs, marginTop: espaco.s },
});
