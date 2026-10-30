import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, FileText, ImageIcon, Paperclip, Send, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { mensagemDoErro } from '@/api/errors';
import type { TipoDocumento } from '@/api/types';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { Cartao } from '@/components/Cartao';
import { Carregando, ErroComTentar, Vazio } from '@/components/Estados';
import { Selo } from '@/components/Selo';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { chaves, useDocumentos, useResumo } from '@/lib/consultas';
import { enviarDocumento, LIMITE_BYTES, reduzirFoto, TIPOS, type ArquivoEscolhido } from '@/lib/envio';
import { dataHora } from '@/lib/formato';
import { tituloDoVeiculo, tomDoDocumento } from '@/lib/situacao';
import { espaco, raio, toqueMinimo, useCores } from '@/theme/colors';

export default function Documentos() {
  const c = useCores();
  const queryClient = useQueryClient();
  const consulta = useDocumentos();
  const resumo = useResumo();
  const veiculos = resumo.data?.veiculos ?? [];

  const [tipo, setTipo] = useState<TipoDocumento | null>(null);
  const [veiculoId, setVeiculoId] = useState<string | undefined>(undefined);
  const [arquivo, setArquivo] = useState<ArquivoEscolhido | null>(null);
  const [observacao, setObservacao] = useState('');
  const [preparando, setPreparando] = useState(false);
  const [recebido, setRecebido] = useState(false);

  const envio = useMutation({
    mutationFn: enviarDocumento,
    onSuccess: () => {
      setArquivo(null);
      setObservacao('');
      setTipo(null);
      setRecebido(true);
      void queryClient.invalidateQueries({ queryKey: chaves.documentos });
    },
  });

  async function usarFoto(origem: 'camera' | 'galeria') {
    setRecebido(false);
    envio.reset();
    const permissao =
      origem === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        origem === 'camera'
          ? 'Libere a câmera nos Ajustes do aparelho para fotografar o documento.'
          : 'Libere o acesso às fotos nos Ajustes do aparelho para escolher o documento.',
      );
      return;
    }
    const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, exif: false };
    const r = origem === 'camera' ? await ImagePicker.launchCameraAsync(opcoes) : await ImagePicker.launchImageLibraryAsync(opcoes);
    const foto = r.canceled ? undefined : r.assets[0];
    if (!foto) return;
    setPreparando(true);
    try {
      setArquivo(
        await reduzirFoto({
          uri: foto.uri,
          nome: foto.fileName ?? 'foto.jpg',
          tipo: foto.mimeType ?? 'image/jpeg',
        }),
      );
    } catch {
      Alert.alert('Foto', 'Não deu para preparar a foto. Tente outra.');
    } finally {
      setPreparando(false);
    }
  }

  async function usarArquivo() {
    setRecebido(false);
    envio.reset();
    const r = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    const doc = r.canceled ? undefined : r.assets[0];
    if (!doc) return;
    const tipoArquivo = doc.mimeType ?? 'application/pdf';
    if (tipoArquivo.startsWith('image/')) {
      setPreparando(true);
      try {
        setArquivo(await reduzirFoto({ uri: doc.uri, nome: doc.name, tipo: tipoArquivo }));
      } catch {
        Alert.alert('Arquivo', 'Não deu para preparar a imagem. Tente outra.');
      } finally {
        setPreparando(false);
      }
      return;
    }
    if (doc.size && doc.size > LIMITE_BYTES) {
      Alert.alert('Arquivo grande demais', 'O PDF pode ter até 4 MB. Tente um arquivo menor ou mande uma foto.');
      return;
    }
    setArquivo({ uri: doc.uri, nome: doc.name, tipo: tipoArquivo });
  }

  function enviar() {
    if (!tipo || !arquivo) return;
    envio.mutate({ tipo, arquivo, veiculoId, observacao });
  }

  return (
    <Tela titulo="Documentos" subtitulo="Mande foto ou arquivo" voltar atualizar={() => void consulta.refetch()} atualizando={consulta.isRefetching}>
      <Cartao>
        <Texto variante="forte">1. Qual documento?</Texto>
        <View style={styles.opcoes} accessibilityRole="radiogroup">
          {TIPOS.map((t) => (
            <Opcao key={t.valor} texto={t.texto} marcado={tipo === t.valor} onPress={() => setTipo(t.valor)} />
          ))}
        </View>

        {veiculos.length > 1 ? (
          <>
            <Texto variante="forte">Veículo (se for o caso)</Texto>
            <View style={styles.opcoes} accessibilityRole="radiogroup">
              {veiculos.map((v) => (
                <Opcao
                  key={v.id}
                  texto={tituloDoVeiculo(v)}
                  marcado={veiculoId === v.id}
                  onPress={() => setVeiculoId(veiculoId === v.id ? undefined : v.id)}
                />
              ))}
            </View>
          </>
        ) : null}

        <Texto variante="forte">2. Foto ou arquivo</Texto>
        {preparando ? <Carregando texto="Preparando a foto…" /> : null}
        {arquivo && !preparando ? (
          <View style={styles.previa}>
            {arquivo.tipo.startsWith('image/') ? (
              <Image source={{ uri: arquivo.uri }} style={styles.miniatura} contentFit="cover" accessibilityLabel="Foto escolhida" />
            ) : (
              <FileText size={40} color={c.textoSecundario} aria-hidden />
            )}
            <Texto style={styles.flex} numberOfLines={2}>
              {arquivo.nome}
            </Texto>
            <Pressable onPress={() => setArquivo(null)} accessibilityRole="button" accessibilityLabel="Tirar o arquivo escolhido" style={styles.remover}>
              <X size={24} color={c.textoSecundario} aria-hidden />
            </Pressable>
          </View>
        ) : null}
        {!arquivo && !preparando ? (
          <View style={styles.botoes}>
            <Botao titulo="Tirar foto" icone={Camera} variante="secundario" onPress={() => usarFoto('camera')} />
            <Botao titulo="Escolher da galeria" icone={ImageIcon} variante="secundario" onPress={() => usarFoto('galeria')} />
            <Botao titulo="Escolher arquivo (PDF)" icone={Paperclip} variante="secundario" onPress={usarArquivo} />
          </View>
        ) : null}

        <Campo
          rotulo="Observação (opcional)"
          value={observacao}
          onChangeText={setObservacao}
          maxLength={300}
          multiline
          style={styles.observacao}
        />

        {envio.isError ? <Aviso tom="erro">{mensagemDoErro(envio.error)}</Aviso> : null}
        {recebido ? (
          <Aviso tom="sucesso" titulo="Documento recebido">
            Vamos conferir e a situação aparece aqui embaixo.
          </Aviso>
        ) : null}
        <Botao
          titulo="Enviar"
          icone={Send}
          onPress={enviar}
          carregando={envio.isPending}
          desativado={!tipo || !arquivo || preparando}
          accessibilityHint={!tipo ? 'Escolha o tipo de documento primeiro' : !arquivo ? 'Escolha a foto ou o arquivo primeiro' : undefined}
          testID="botao-enviar-documento"
        />
      </Cartao>

      <Texto variante="subtitulo">Documentos enviados</Texto>
      {consulta.isPending ? (
        <Carregando />
      ) : consulta.isError ? (
        <ErroComTentar erro={consulta.error} tentar={() => void consulta.refetch()} />
      ) : (consulta.data.documentos ?? []).length === 0 ? (
        <Vazio texto="Você ainda não mandou documentos pelo app." />
      ) : (
        (consulta.data.documentos ?? []).map((d) => (
          <Cartao key={d.id}>
            <Texto variante="forte">{d.tipoTexto ?? d.tipo}</Texto>
            <Selo texto={d.situacaoTexto ?? d.situacao ?? 'Recebido'} tom={tomDoDocumento(d.situacao)} />
            <Texto variante="legenda" secundario>
              {[d.placa, d.enviadoEm ? `enviado em ${dataHora(d.enviadoEm)}` : null].filter(Boolean).join(' · ')}
            </Texto>
            {d.situacao === 'RECUSADO' && d.motivoRecusa ? (
              <Aviso tom="erro" titulo="Motivo da recusa">
                {`${d.motivoRecusa} Mande de novo acima.`}
              </Aviso>
            ) : null}
          </Cartao>
        ))
      )}
    </Tela>
  );
}

function Opcao({ texto, marcado, onPress }: { texto: string; marcado: boolean; onPress: () => void }) {
  const c = useCores();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: marcado }}
      accessibilityLabel={texto}
      style={[
        styles.opcao,
        { borderColor: marcado ? c.principal : c.borda, backgroundColor: marcado ? c.destaque : c.superficie },
      ]}
    >
      <Texto variante={marcado ? 'forte' : 'corpo'} cor={marcado ? c.escura : undefined}>
        {texto}
      </Texto>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.s },
  opcao: {
    minHeight: toqueMinimo,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: raio.pequeno,
    paddingHorizontal: espaco.m,
    paddingVertical: espaco.s,
  },
  botoes: { gap: espaco.m },
  previa: { flexDirection: 'row', alignItems: 'center', gap: espaco.m },
  miniatura: { width: 72, height: 72, borderRadius: raio.pequeno },
  remover: { width: toqueMinimo, height: toqueMinimo, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  observacao: { minHeight: 80, paddingTop: espaco.m, fontSize: 16, textAlignVertical: 'top' },
});
