import { useRouter } from 'expo-router';
import { KeyRound, LogIn, MessageCircle } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { TextInputInstance } from 'react-native';

import { api, pedir } from '@/api/client';
import { ApiError, mensagemDoErro } from '@/api/errors';
import { useSessao } from '@/auth/session';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { Cabecalho } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { abrirNoNavegador } from '@/lib/acoes';
import { LINKS } from '@/lib/config';
import { nomeDoAparelho, plataforma } from '@/lib/dispositivo';
import { digitos, documentoValido, mascararDocumento } from '@/lib/formato';
import { espaco, useCores } from '@/theme/colors';

export default function Entrar() {
  const c = useCores();
  const router = useRouter();
  const { entrar } = useSessao();
  const senhaRef = useRef<TextInputInstance>(null);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erroCpf, setErroCpf] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setErro(null);
    if (!documentoValido(cpf)) {
      setErroCpf('Confira o CPF ou CNPJ.');
      return;
    }
    setErroCpf(null);
    if (!senha) {
      setErro('Digite a sua senha.');
      return;
    }
    setEnviando(true);
    try {
      const sessao = await pedir(
        api.POST('/entrar/senha', {
          body: { cpf: digitos(cpf), senha, plataforma, dispositivo: nomeDoAparelho() },
        }),
      );
      if (!sessao.token) throw new ApiError(500, 'Não deu para entrar. Tente de novo.');
      setSenha('');
      await entrar(sessao.token);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setErro('CPF ou senha não conferem.');
      else if (e instanceof ApiError && e.status === 422 && e.campos.cpf) setErroCpf(e.campos.cpf);
      else setErro(mensagemDoErro(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.tela, { backgroundColor: c.fundo }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Cabecalho titulo="Entrar" subtitulo="Área do associado Aliança Brasil" />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Texto secundario>Use o mesmo CPF e senha da área do associado no site.</Texto>
        <Campo
          testID="campo-cpf"
          rotulo="CPF ou CNPJ"
          value={cpf}
          onChangeText={(t) => setCpf(mascararDocumento(t))}
          keyboardType="number-pad"
          autoComplete="off"
          textContentType="none"
          placeholder="000.000.000-00"
          returnKeyType="next"
          onSubmitEditing={() => senhaRef.current?.focus()}
          erro={erroCpf}
        />
        <Campo
          testID="campo-senha"
          ref={senhaRef}
          rotulo="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={enviar}
        />
        {erro ? <Aviso tom="erro">{erro}</Aviso> : null}
        <Botao titulo="Entrar" icone={LogIn} onPress={enviar} carregando={enviando} testID="botao-entrar" />
        <View style={styles.links}>
          <Botao
            variante="texto"
            icone={KeyRound}
            titulo="Primeiro acesso ou esqueci a senha"
            accessibilityHint="Abre o site da Aliança para criar ou trocar a senha"
            onPress={() => abrirNoNavegador(LINKS.acesso)}
          />
          <Botao
            variante="texto"
            icone={MessageCircle}
            titulo="Entrar com código do WhatsApp"
            onPress={() => router.push(cpf ? { pathname: '/whatsapp', params: { cpf } } : '/whatsapp')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: espaco.l, gap: espaco.l },
  links: { gap: espaco.xs },
});
