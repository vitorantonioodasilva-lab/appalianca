import type { Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { espaco, raio, toqueMinimo, useCores } from '@/theme/colors';
import { Texto } from './Texto';

type Props = TextInputProps & { rotulo: string; erro?: string | null; ref?: Ref<TextInputInstance> };

export function Campo({ rotulo, erro, style, ref, ...props }: Props) {
  const c = useCores();
  return (
    <View style={styles.bloco}>
      <Texto variante="forte">{rotulo}</Texto>
      <TextInput
        ref={ref}
        placeholderTextColor={c.textoSecundario}
        accessibilityLabel={rotulo}
        accessibilityHint={erro ?? undefined}
        maxFontSizeMultiplier={2}
        {...props}
        style={[
          styles.campo,
          { color: c.texto, backgroundColor: c.superficie, borderColor: erro ? c.erro : c.borda },
          style,
        ]}
      />
      {erro ? (
        <Texto variante="legenda" cor={c.erro} accessibilityLiveRegion="polite">
          {erro}
        </Texto>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: espaco.s },
  campo: {
    minHeight: toqueMinimo + 8,
    borderWidth: 1,
    borderRadius: raio.pequeno,
    paddingHorizontal: espaco.l,
    fontSize: 18,
  },
});
