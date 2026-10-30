import { Camera, MessageCircle, Phone } from 'lucide-react-native';

import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Cartao } from '@/components/Cartao';
import { Carregando, ErroComTentar, Vazio } from '@/components/Estados';
import { Selo } from '@/components/Selo';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { abrirLink, abrirNoNavegador } from '@/lib/acoes';
import { useEventos } from '@/lib/consultas';
import { data, linkTelefone } from '@/lib/formato';

export default function Evento() {
  const consulta = useEventos();
  const abrir = consulta.data?.abrirEvento;
  const eventos = consulta.data?.eventos ?? [];

  return (
    <Tela titulo="Abrir evento" subtitulo="Central 24 h" voltar atualizar={() => void consulta.refetch()} atualizando={consulta.isRefetching}>
      {consulta.isPending ? (
        <Carregando />
      ) : consulta.isError ? (
        <ErroComTentar erro={consulta.error} tentar={() => void consulta.refetch()} />
      ) : (
        <>
          <Aviso tom="info" titulo="Aconteceu alguma coisa com o veículo?">
            Fale com a Central pelo WhatsApp. A mensagem já vai com o seu nome e a placa.
          </Aviso>
          {abrir?.whatsapp ? (
            <Botao titulo="Falar com a Central no WhatsApp" icone={MessageCircle} onPress={() => abrirLink(abrir.whatsapp!)} />
          ) : null}
          {abrir?.telefone0800 ? (
            <Botao
              titulo={`Ligar ${abrir.telefone0800}`}
              icone={Phone}
              variante="secundario"
              accessibilityLabel={`Ligar para a Central, ${abrir.telefone0800}`}
              onPress={() => abrirLink(linkTelefone(abrir.telefone0800!))}
            />
          ) : null}
          {abrir?.relato ? (
            <Botao titulo="Mandar fotos e vídeo" icone={Camera} variante="texto" onPress={() => abrirNoNavegador(abrir.relato!)} />
          ) : null}

          <Texto variante="subtitulo">Seus eventos</Texto>
          {eventos.length === 0 ? (
            <Vazio texto="Nenhum evento aberto." />
          ) : (
            eventos.map((e) => (
              <Cartao key={e.id}>
                <Texto variante="forte">{[e.numero, e.tipo].filter(Boolean).join(' · ')}</Texto>
                {e.situacaoTexto ?? e.situacao ? <Selo texto={(e.situacaoTexto ?? e.situacao)!} /> : null}
                <Texto secundario>
                  {[e.placa, e.ocorridoEm ? `ocorrido em ${data(e.ocorridoEm)}` : null].filter(Boolean).join(' · ')}
                </Texto>
                {e.orientacao ? <Texto>{e.orientacao}</Texto> : null}
              </Cartao>
            ))
          )}
        </>
      )}
    </Tela>
  );
}
