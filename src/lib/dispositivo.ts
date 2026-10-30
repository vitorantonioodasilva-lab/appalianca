import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const plataforma: 'ios' | 'android' = Platform.OS === 'ios' ? 'ios' : 'android';

export function nomeDoAparelho() {
  return Device.modelName ?? Device.deviceName ?? (plataforma === 'ios' ? 'iPhone' : 'Android');
}
