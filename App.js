import React from 'react'
import { Provider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { theme } from './src/core/theme'
import {
  StartScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  Dashboard,
  AddProduct,
  ManageProducts,
  EditProduct,
  SeeOrders,
  EditAccount,
} from './src/screens'
import 'react-native-gesture-handler'
import { StatusBar } from 'react-native'

const Stack = createStackNavigator()

export default function App() {
  StatusBar.setBackgroundColor(theme.colors.primary)
  return (
    <Provider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="StartScreen"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="AddProduct" component={AddProduct} />
          <Stack.Screen name="ManageProducts" component={ManageProducts} />
          <Stack.Screen name="EditProduct" component={EditProduct}/>
          <Stack.Screen name="SeeOrders" component={SeeOrders}/>
          <Stack.Screen name="EditAccount" component={EditAccount}/>
          <Stack.Screen
            name="ResetPasswordScreen"
            component={ResetPasswordScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  )
}
