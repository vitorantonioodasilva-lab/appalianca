import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { espaco, toqueMinimo, useCores } from '@/theme/colors';
import { Logo } from './Logo';
import { Texto } from './Texto';

type Props = {
  titulo: string;
  subtitulo?: string;
  voltar?: boolean;
  children: ReactNode;
  /** Puxar para atualizar. */
  atualizar?: () => void;
  atualizando?: boolean;
};

export function Cabecalho({ titulo, subtitulo, voltar }: Pick<Props, 'titulo' | 'subtitulo' | 'voltar'>) {
  const c = useCores();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[c.degradeInicio, c.degradeFim]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.cabecalho, { paddingTop: insets.top + espaco.m }]}
    >
      <View style={styles.linha}>
        {voltar ? (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={8}
            style={styles.voltar}
          >
            <ChevronLeft size={28} color="#FFFFFF" aria-hidden />
          </Pressable>
        ) : (
          <Logo tamanho={36} />
        )}
        <View style={styles.titulos}>
          <Texto variante="titulo" cor="#FFFFFF">
            {titulo}
          </Texto>
          {subtitulo ? <Texto cor="#E6F4F5">{subtitulo}</Texto> : null}
        </View>
      </View>
    </LinearGradient>
  );
}

export function Tela({ titulo, subtitulo, voltar, children, atualizar, atualizando = false }: Props) {
  const c = useCores();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tela, { backgroundColor: c.fundo }]}>
      <Cabecalho titulo={titulo} subtitulo={subtitulo} voltar={voltar} />
      <ScrollView
        contentContainerStyle={[styles.conteudo, { paddingBottom: insets.bottom + espaco.xxl }]}
        refreshControl={
          atualizar ? (
            <RefreshControl refreshing={atualizando} onRefresh={atualizar} tintColor={c.principal} colors={[c.principal]} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  cabecalho: { paddingHorizontal: espaco.l, paddingBottom: espaco.xl },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.m },
  voltar: { width: toqueMinimo, height: toqueMinimo, alignItems: 'center', justifyContent: 'center', marginLeft: -espaco.s },
  titulos: { flex: 1, gap: 2 },
  conteudo: { padding: espaco.l, gap: espaco.l },
});
