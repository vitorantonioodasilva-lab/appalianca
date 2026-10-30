import { Tabs } from 'expo-router';
import { Home, IdCard, ReceiptText, UserRound } from 'lucide-react-native';

import { useCores } from '@/theme/colors';

export default function Abas() {
  const c = useCores();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.principal,
        tabBarInactiveTintColor: c.textoSecundario,
        tabBarStyle: { backgroundColor: c.superficie, borderTopColor: c.borda },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarAllowFontScaling: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="carteirinha"
        options={{ title: 'Carteirinha', tabBarIcon: ({ color, size }) => <IdCard color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="cobrancas"
        options={{ title: '2ª via', tabBarIcon: ({ color, size }) => <ReceiptText color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }}
      />
    </Tabs>
  );
}
