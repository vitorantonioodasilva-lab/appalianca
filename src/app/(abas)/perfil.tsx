import Constants from 'expo-constants';
import { LogOut, MessageCircle, Settings, UserX } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useSessao } from '@/auth/session';
import { Botao } from '@/components/Botao';
import { Cartao } from '@/components/Cartao';
import { Linha } from '@/components/Linha';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { abrirLink, abrirNoNavegador } from '@/lib/acoes';
import { LINKS } from '@/lib/config';
import { useResumo } from '@/lib/consultas';
import { whatsappDaAlianca } from '@/lib/contatos';
import { data } from '@/lib/formato';

export default function Perfil() {
  const { sair } = useSessao();
  const resumo = useResumo();
  const [saindo, setSaindo] = useState(false);
  const a = resumo.data?.associado;
  const falar = whatsappDaAlianca(resumo.data);
  const matricula = a?.matricula ? ` Matrícula ${a.matricula}.` : '';
  const excluir = whatsappDaAlianca(
    resumo.data,
    `Olá! Quero excluir a minha conta do aplicativo e os meus dados de acesso.${matricula}`,
  );

  function confirmarSair() {
    Alert.alert('Sair do aplicativo?', 'Para voltar, entre de novo com CPF e senha ou código.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setSaindo(true);
          await sair();
        },
      },
    ]);
  }

  function pedirExclusao() {
    if (excluir) {
      Alert.alert(
        'Excluir conta',
        'Vamos abrir o WhatsApp da Aliança com o pedido pronto. A exclusão do app não cancela o seu contrato com a associação.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir WhatsApp', onPress: () => abrirLink(excluir) },
        ],
      );
    } else {
      Alert.alert('Excluir conta', 'Peça a exclusão na área do associado no site.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir o site', onPress: () => abrirNoNavegador(LINKS.meusDados) },
      ]);
    }
  }

  return (
    <Tela titulo="Perfil" atualizar={() => void resumo.refetch()} atualizando={resumo.isRefetching}>
      <Cartao>
        <Texto variante="subtitulo">{a?.nome ?? '—'}</Texto>
        <Linha rotulo="Matrícula" valor={a?.matricula != null ? String(a.matricula) : '—'} />
        {a?.documento ? <Linha rotulo="CPF" valor={a.documento} /> : null}
        {a?.desde ? <Linha rotulo="Associado desde" valor={data(a.desde)} /> : null}
        {a?.associacao ? <Linha rotulo="Associação" valor={a.associacao} /> : null}
      </Cartao>

      <Botao
        titulo="Meus dados e avisos"
        icone={Settings}
        variante="secundario"
        accessibilityHint="Abre o site para trocar e-mail, WhatsApp, senha e onde receber os avisos"
        onPress={() => abrirNoNavegador(LINKS.meusDados)}
      />
      {falar ? (
        <>
          <Botao titulo="Falar com a Aliança" icone={MessageCircle} variante="secundario" onPress={() => abrirLink(falar)} />
          <Texto variante="legenda" secundario>
            Quem atende é a assistente da Aliança. Se preferir, peça para falar com uma pessoa.
          </Texto>
        </>
      ) : null}

      <Botao titulo="Sair" icone={LogOut} onPress={confirmarSair} carregando={saindo} testID="botao-sair" />
      <Botao titulo="Excluir minha conta" icone={UserX} variante="texto" onPress={pedirExclusao} />

      <Texto variante="legenda" secundario>
        Aliança Brasil Proteção Veicular · versão {Constants.expoConfig?.version ?? '—'}
      </Texto>
    </Tela>
  );
}
