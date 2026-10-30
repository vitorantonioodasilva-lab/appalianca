import { useLocalSearchParams, useRouter } from 'expo-router';
import { Globe, KeyRound, Send } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { ApiError, mensagemDoErro } from '@/api/errors';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { Cabecalho } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { abrirNoNavegador } from '@/lib/acoes';
import { LINKS } from '@/lib/config';
import { pedirCodigo } from '@/lib/entrada';
import { documentoValido, mascararDocumento } from '@/lib/formato';
import { espaco, useCores } from '@/theme/colors';

export default function EntrarWhatsapp() {
  const c = useCores();
  const router = useRouter();
  const params = useLocalSearchParams<{ cpf?: string }>();
  const [cpf, setCpf] = useState(params.cpf ? mascararDocumento(params.cpf) : '');
  const [erroCpf, setErroCpf] = useState<string | null>(null);
  const [erro, setErro] = useState<{ texto: string; desligado?: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setErro(null);
    if (!documentoValido(cpf)) {
      setErroCpf('Confira o CPF ou CNPJ.');
      return;
    }
    setErroCpf(null);
    setEnviando(true);
    try {
      const r = await pedirCodigo(cpf);
      router.push({
        pathname: '/codigo',
        params: { cpf, desafio: r.desafio ?? '', mensagem: r.mensagem ?? '' },
      });
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) setErroCpf(e.campos.cpf ?? e.message);
      else if (e instanceof ApiError && e.status === 503) setErro({ texto: e.message, desligado: true });
      else setErro({ texto: mensagemDoErro(e) });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.tela, { backgroundColor: c.fundo }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Cabecalho titulo="Código pelo WhatsApp" subtitulo="Entrar sem senha" voltar />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Texto secundario>Digite o seu CPF ou CNPJ. Mandamos um código de 6 números para o WhatsApp do seu cadastro.</Texto>
        <Campo
          testID="campo-cpf"
          rotulo="CPF ou CNPJ"
          value={cpf}
          onChangeText={(t) => setCpf(mascararDocumento(t))}
          keyboardType="number-pad"
          autoComplete="off"
          placeholder="000.000.000-00"
          returnKeyType="send"
          onSubmitEditing={enviar}
          erro={erroCpf}
        />
        {erro ? <Aviso tom={erro.desligado ? 'alerta' : 'erro'}>{erro.texto}</Aviso> : null}
        <Botao titulo="Receber código" icone={Send} onPress={enviar} carregando={enviando} testID="botao-receber" />
        {erro?.desligado ? (
          <>
            <Botao variante="secundario" icone={KeyRound} titulo="Entrar com CPF e senha" onPress={() => router.back()} />
            <Botao variante="texto" icone={Globe} titulo="Abrir a área do associado no site" onPress={() => abrirNoNavegador(LINKS.acesso)} />
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: espaco.l, gap: espaco.l },
});
