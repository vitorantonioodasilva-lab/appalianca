import { Image } from 'expo-image';
import { Copy, CreditCard, FileText, MessageCircle, QrCode } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { mensagemDoErro } from '@/api/errors';
import type { Cobranca } from '@/api/types';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Cartao } from '@/components/Cartao';
import { Carregando, ErroComTentar, Vazio } from '@/components/Estados';
import { Linha } from '@/components/Linha';
import { Selo } from '@/components/Selo';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { abrirLink, abrirNoNavegador, useCopiar } from '@/lib/acoes';
import { useCobrancas, useResumo } from '@/lib/consultas';
import { whatsappDaAlianca } from '@/lib/contatos';
import { data, dataHora, dinheiro } from '@/lib/formato';
import { abrirPdf } from '@/lib/pdf';
import { espaco, raio } from '@/theme/colors';

export default function Cobrancas() {
  const consulta = useCobrancas();
  const resumo = useResumo();
  const d = consulta.data;
  const whatsapp = whatsappDaAlianca(resumo.data, 'Olá! Preciso da 2ª via da minha mensalidade.');

  return (
    <Tela titulo="2ª via" subtitulo="Pix, boleto ou cartão" atualizar={() => void consulta.refetch()} atualizando={consulta.isRefetching}>
      {consulta.isPending ? (
        <Carregando />
      ) : consulta.isError ? (
        <ErroComTentar erro={consulta.error} tentar={() => void consulta.refetch()} />
      ) : (
        <>
          {d?.origem === 'SIPROV' ? (
            <>
              {d.aviso ? <Aviso tom="info">{d.aviso}</Aviso> : null}
              {whatsapp ? (
                <Botao titulo="Falar com a Aliança no WhatsApp" icone={MessageCircle} variante="secundario" onPress={() => abrirLink(whatsapp)} />
              ) : null}
            </>
          ) : null}

          {(d?.emAberto ?? []).length === 0 ? (
            <Aviso tom="sucesso" titulo="Tudo em dia">
              Você não tem cobrança em aberto.
            </Aviso>
          ) : (
            (d?.emAberto ?? []).map((c) => <CartaoCobranca key={c.id} cobranca={c} linkPagamento={d?.linkPagamento ?? null} />)
          )}

          {d?.cartao ? (
            <Texto secundario>
              Cartão cadastrado: {d.cartao.bandeira} final {d.cartao.final}
            </Texto>
          ) : null}

          <Texto variante="subtitulo">Pagamentos recentes</Texto>
          {(d?.pagas ?? []).length === 0 ? (
            <Vazio texto="Nenhum pagamento recente." />
          ) : (
            (d?.pagas ?? []).map((p, i) => <LinhaPaga key={i} paga={p as Record<string, unknown>} />)
          )}
        </>
      )}
    </Tela>
  );
}

function CartaoCobranca({ cobranca: c, linkPagamento }: { cobranca: Cobranca; linkPagamento: string | null }) {
  const { copiado, copiar } = useCopiar();
  const [mostrarQr, setMostrarQr] = useState(false);
  const [abrindo, setAbrindo] = useState(false);
  const atraso = c.diasAtraso ?? 0;
  const pix = c.pix?.copiaECola;
  const linha = c.boleto?.linhaDigitavel;
  const pdf = c.boleto?.pdf;

  async function abrirBoleto() {
    if (!pdf) return;
    setAbrindo(true);
    try {
      await abrirPdf(pdf, `boleto-${c.numero ?? c.id}.pdf`);
    } catch (e) {
      Alert.alert('Boleto', mensagemDoErro(e));
    } finally {
      setAbrindo(false);
    }
  }

  return (
    <Cartao>
      <Texto variante="forte">{c.descricao ?? 'Mensalidade'}</Texto>
      {atraso > 0 ? <Selo tom="erro" texto={`${atraso} dia${atraso === 1 ? '' : 's'} em atraso`} /> : <Selo tom="alerta" texto="Em aberto" />}
      <Texto variante="legenda" secundario>
        Valor para pagar hoje
      </Texto>
      <Texto variante="valor" accessibilityLabel={`Valor para pagar hoje: ${dinheiro(c.valorHoje)}`}>
        {dinheiro(c.valorHoje)}
      </Texto>
      <Linha rotulo="Vencimento" valor={data(c.vencimento)} />
      {c.pix?.validoAte ? <Linha rotulo="Pix vale até" valor={dataHora(c.pix.validoAte)} /> : null}

      <View style={styles.botoes}>
        {pix ? (
          <Botao
            titulo={copiado === 'pix' ? 'Pix copiado!' : 'Copiar Pix'}
            icone={Copy}
            accessibilityHint="Copia o código Pix copia e cola"
            onPress={() => copiar('pix', pix)}
          />
        ) : null}
        {c.pix?.qrCode ? (
          <Botao
            titulo={mostrarQr ? 'Esconder QR Code' : 'Mostrar QR Code'}
            icone={QrCode}
            variante="secundario"
            onPress={() => setMostrarQr((m) => !m)}
          />
        ) : null}
        {mostrarQr && c.pix?.qrCode ? (
          <View style={styles.qr}>
            <Image source={{ uri: c.pix.qrCode }} style={styles.qrImagem} contentFit="contain" accessibilityLabel="QR Code do Pix" />
          </View>
        ) : null}
        {linha ? (
          <>
            <Texto variante="legenda" secundario selectable>
              {linha}
            </Texto>
            <Botao
              titulo={copiado === 'linha' ? 'Linha copiada!' : 'Copiar linha digitável'}
              icone={Copy}
              variante="secundario"
              onPress={() => copiar('linha', linha)}
            />
          </>
        ) : null}
        {pdf ? <Botao titulo="Abrir boleto (PDF)" icone={FileText} variante="secundario" carregando={abrindo} onPress={abrirBoleto} /> : null}
        {linkPagamento ? (
          <Botao
            titulo="Pagar com cartão"
            icone={CreditCard}
            variante="secundario"
            accessibilityHint="Abre a página de pagamento no navegador"
            onPress={() => abrirNoNavegador(linkPagamento)}
          />
        ) : null}
      </View>
    </Cartao>
  );
}

function LinhaPaga({ paga }: { paga: Record<string, unknown> }) {
  // O OpenAPI ainda não detalha "pagas": usamos os campos que vierem.
  const texto = (k: string) => (typeof paga[k] === 'string' ? (paga[k] as string) : null);
  const numero = (k: string) => (typeof paga[k] === 'number' ? (paga[k] as number) : null);
  const descricao = texto('descricao') ?? 'Mensalidade';
  const quando = texto('pagoEm') ?? texto('pagamento') ?? texto('dataPagamento');
  const valor = numero('valorPago') ?? numero('valor');
  return (
    <Cartao>
      <Linha rotulo={descricao} valor={dinheiro(valor)} />
      {quando ? (
        <Texto variante="legenda" secundario>
          Pago em {data(quando)}
        </Texto>
      ) : null}
    </Cartao>
  );
}

const styles = StyleSheet.create({
  botoes: { gap: espaco.m, marginTop: espaco.s },
  qr: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: raio.pequeno, padding: espaco.l },
  qrImagem: { width: 220, height: 220 },
});
