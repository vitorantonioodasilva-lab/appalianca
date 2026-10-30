import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, RotateCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { api, pedir } from '@/api/client';
import { ApiError, mensagemDoErro } from '@/api/errors';
import { useSessao } from '@/auth/session';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { Cabecalho } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { nomeDoAparelho, plataforma } from '@/lib/dispositivo';
import { ESPERA_REENVIO, MAXIMO_ERROS, pedirCodigo } from '@/lib/entrada';
import { digitos } from '@/lib/formato';
import { espaco, useCores } from '@/theme/colors';

export default function Codigo() {
  const c = useCores();
  const router = useRouter();
  const { entrar } = useSessao();
  const params = useLocalSearchParams<{ cpf: string; desafio: string; mensagem?: string }>();
  const [desafio, setDesafio] = useState(params.desafio);
  const [mensagem, setMensagem] = useState(params.mensagem ?? '');
  const [codigo, setCodigo] = useState('');
  const [erros, setErros] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(ESPERA_REENVIO);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function confirmar(valor = codigo) {
    if (valor.length !== 6 || enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      const sessao = await pedir(
        api.POST('/entrar/confirmar', {
          body: { desafio, codigo: valor, plataforma, dispositivo: nomeDoAparelho() },
        }),
      );
      if (!sessao.token) throw new ApiError(500, 'Não deu para entrar. Tente de novo.');
      await entrar(sessao.token);
    } catch (e) {
      setCodigo('');
      if (e instanceof ApiError && e.status === 401) {
        const total = erros + 1;
        setErros(total);
        if (total >= MAXIMO_ERROS) {
          // O servidor invalida o desafio depois de 5 erros: recomeça pelo CPF.
          router.dismissTo({ pathname: '/whatsapp', params: { cpf: params.cpf } });
          return;
        }
        setErro(`${e.message} Restam ${MAXIMO_ERROS - total} tentativa${MAXIMO_ERROS - total === 1 ? '' : 's'}.`);
      } else {
        setErro(mensagemDoErro(e));
      }
    } finally {
      setEnviando(false);
    }
  }

  async function reenviar() {
    setErro(null);
    try {
      const r = await pedirCodigo(params.cpf);
      setDesafio(r.desafio ?? '');
      setMensagem(r.mensagem ?? '');
      setErros(0);
      setCodigo('');
      setEspera(ESPERA_REENVIO);
    } catch (e) {
      setErro(mensagemDoErro(e));
    }
  }

  function aoDigitar(texto: string) {
    // Aceita colar a mensagem inteira do WhatsApp: fica só com os 6 números.
    const d = digitos(texto).slice(0, 6);
    setCodigo(d);
    if (d.length === 6) void confirmar(d);
  }

  return (
    <KeyboardAvoidingView style={[styles.tela, { backgroundColor: c.fundo }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Cabecalho titulo="Código" subtitulo="Confira o seu WhatsApp" voltar />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        {mensagem ? <Aviso tom="info">{mensagem}</Aviso> : null}
        <Campo
          testID="campo-codigo"
          rotulo="Código de 6 números"
          value={codigo}
          onChangeText={aoDigitar}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          placeholder="000000"
          autoFocus
          style={styles.codigo}
        />
        {erro ? <Aviso tom="erro">{erro}</Aviso> : null}
        <Botao
          titulo="Confirmar"
          icone={CheckCircle2}
          onPress={() => confirmar()}
          carregando={enviando}
          desativado={codigo.length !== 6}
          testID="botao-confirmar"
        />
        {espera > 0 ? (
          <Texto secundario style={styles.centro} accessibilityLiveRegion="polite">
            Pode pedir outro código em {espera} s
          </Texto>
        ) : (
          <Botao variante="texto" icone={RotateCw} titulo="Reenviar código" onPress={reenviar} testID="botao-reenviar" />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: espaco.l, gap: espaco.l },
  codigo: { fontSize: 28, letterSpacing: 8, textAlign: 'center' },
  centro: { textAlign: 'center' },
});
