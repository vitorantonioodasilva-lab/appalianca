/* eslint-disable @typescript-eslint/no-require-imports */
// Simulações dos módulos nativos usados pelo app.

const mockCofre = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1,
  getItemAsync: jest.fn(async (k: string) => mockCofre.get(k) ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => void mockCofre.set(k, v)),
  deleteItemAsync: jest.fn(async (k: string) => void mockCofre.delete(k)),
  __cofre: mockCofre,
}));

const mockArquivos = new Map<string, string>();
jest.mock('expo-file-system', () => {
  class File {
    uri: string;
    constructor(...partes: (string | { uri: string })[]) {
      this.uri = partes.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
    }
    get exists() {
      return mockArquivos.has(this.uri);
    }
    create() {
      mockArquivos.set(this.uri, '');
    }
    delete() {
      mockArquivos.delete(this.uri);
    }
    async write(conteudo: string) {
      mockArquivos.set(this.uri, String(conteudo));
    }
    async text() {
      return mockArquivos.get(this.uri) ?? '';
    }
    async preview() {}
  }
  return { File, Paths: { document: 'doc:', cache: 'cache:' }, __arquivos: mockArquivos };
});

jest.mock('expo-brightness', () => ({
  getBrightnessAsync: jest.fn(async () => 0.5),
  setBrightnessAsync: jest.fn(async () => undefined),
  restoreSystemBrightnessAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-device', () => ({ modelName: 'Aparelho de teste', deviceName: null }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(async () => ({ type: 'opened' })) }));
jest.mock('expo-splash-screen', () => ({ preventAutoHideAsync: jest.fn(async () => true), hideAsync: jest.fn(async () => true) }));
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: View };
});
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => false), shareAsync: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({ ImageManipulator: { manipulate: jest.fn() }, SaveFormat: { JPEG: 'jpeg' } }));
jest.mock('expo-image-picker', () => ({}));
jest.mock('expo-document-picker', () => ({}));
// Ícones viram um View vazio (o pacote só publica ESM .mjs).
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return new Proxy({ __esModule: true }, { get: (alvo, nome) => (nome in alvo ? (alvo as never)[nome] : View) });
});
