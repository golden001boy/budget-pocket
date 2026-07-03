import { Tabs } from 'expo-router';
import { LayoutDashboard, CreditCard, TrendingUp, Brain, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor:  '#1E293B',
        },
        headerStyle:         { backgroundColor: '#0F172A' },
        headerTintColor:     '#F8FAFC',
        headerTitleStyle:    { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:          'Tableau de bord',
          tabBarIcon:     ({ color, size }) => <LayoutDashboard size={size} color={color} />,
          tabBarLabel:    'Accueil',
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title:          'Dépenses',
          tabBarIcon:     ({ color, size }) => <CreditCard size={size} color={color} />,
          tabBarLabel:    'Dépenses',
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          title:          'Investissements',
          tabBarIcon:     ({ color, size }) => <TrendingUp size={size} color={color} />,
          tabBarLabel:    'Portefeuille',
        }}
      />
      <Tabs.Screen
        name="advisor"
        options={{
          title:          'Conseiller IA',
          tabBarIcon:     ({ color, size }) => <Brain size={size} color={color} />,
          tabBarLabel:    'Conseiller',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title:          'Paramètres',
          tabBarIcon:     ({ color, size }) => <Settings size={size} color={color} />,
          tabBarLabel:    'Paramètres',
        }}
      />
    </Tabs>
  );
}
