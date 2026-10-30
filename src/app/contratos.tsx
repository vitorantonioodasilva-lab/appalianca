import { FileText } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { mensagemDoErro } from '@/api/errors';
import { Botao } from '@/components/Botao';
import { Cartao } from '@/components/Cartao';
import { Carregando, ErroComTentar, Vazio } from '@/components/Estados';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useContratos } from '@/lib/consultas';
import { data } from '@/lib/formato';
import { abrirPdf } from '@/lib/pdf';

export default function Contratos() {
  const consulta = useContratos();
  const [abrindo, setAbrindo] = useState<string | null>(null);
  const contratos = consulta.data?.contratos ?? [];

  async function abrir(chave: string, caminho: string, nome: string) {
    setAbrindo(chave);
    try {
      await abrirPdf(caminho, nome);
    } catch (e) {
      Alert.alert('Documento', mensagemDoErro(e));
    } finally {
      setAbrindo(null);
    }
  }

  return (
    <Tela titulo="Contratos" subtitulo="Termo, proposta e regulamento" voltar atualizar={() => void consulta.refetch()} atualizando={consulta.isRefetching}>
      {consulta.isPending ? (
        <Carregando />
      ) : consulta.isError ? (
        <ErroComTentar erro={consulta.error} tentar={() => void consulta.refetch()} />
      ) : (
        <>
          {contratos.length === 0 ? <Vazio texto="Nenhum contrato assinado ainda." /> : null}
          {contratos.map((c) => {
            const id = c.id ?? '';
            return (
              <Cartao key={id}>
                <Texto variante="forte">{[c.codigo ? `Contrato ${c.codigo}` : 'Contrato', c.placa].filter(Boolean).join(' · ')}</Texto>
                {c.assinadoEm ? <Texto secundario>Assinado em {data(c.assinadoEm)}</Texto> : null}
                <Botao
                  titulo="Termo de adesão (PDF)"
                  icone={FileText}
                  variante="secundario"
                  carregando={abrindo === `${id}-termo`}
                  onPress={() => abrir(`${id}-termo`, c.termo ?? `/contratos/${id}/termo`, `termo-${c.codigo ?? id}.pdf`)}
                />
                <Botao
                  titulo="Proposta de filiação (PDF)"
                  icone={FileText}
                  variante="secundario"
                  carregando={abrindo === `${id}-proposta`}
                  onPress={() => abrir(`${id}-proposta`, c.proposta ?? `/contratos/${id}/proposta`, `proposta-${c.codigo ?? id}.pdf`)}
                />
              </Cartao>
            );
          })}
          <Cartao>
            <Texto variante="forte">Regulamento</Texto>
            <Texto secundario>As regras da associação e dos benefícios.</Texto>
            <Botao
              titulo="Regulamento (PDF)"
              icone={FileText}
              carregando={abrindo === 'regulamento'}
              onPress={() => abrir('regulamento', consulta.data?.regulamento ?? '/regulamento', 'regulamento.pdf')}
            />
          </Cartao>
        </>
      )}
    </Tela>
  );
}
