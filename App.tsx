import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import CreateFormScreen from './src/screens/CreateFormScreen';
import { initDB } from './src/db/database';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(()=>{
    initDB();
  },[]);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateForm" component={CreateFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}