import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import CreateFormScreen from './src/screens/CreateFormScreen';
import FillFormScreen from './src/screens/FillFormScreen';
import FormDetailScreen from './src/screens/FormDetailScreen';
import { initDB } from './src/db/database';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(()=>{
    initDB();
  },[]);

  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateForm" component={CreateFormScreen} />
        <Stack.Screen name='FillForm' component={FillFormScreen}/>
        <Stack.Screen name="FormDetail" component={FormDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}