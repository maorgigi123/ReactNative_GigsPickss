import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Image, SafeAreaView, AppState, StatusBar } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';


import LoginScreen from './pages/Login'
import RegisterScreen from './pages/Register'
import HomeScreen from './pages/Home';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentTheme, selectCurrentUser } from './store/user/user.selector';
import { SET_NEW_LOCATIONS, SET_PLAYERS_LOCATION, setAddMessage, setCurrentMessages, setCurrentUser, setUpdateMessage } from './store/user/user.action';
import { setCurrentWs } from "./store/webSocket/ws.action";
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons'; // Import your preferred icon library
import {getTheme} from './pages/Colors/Color';
import CameraScreen from './pages/camera/camera';
import MessageUser from './pages/Messages/MessageUser';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PreivewFile from './pages/components/PreivewFile';
import ProfileLayout from './pages/ProfileScreen';
import Friends from './pages/Friends/Friends';
import FeedProfilePreview from './pages/components/FeedProfilePreview';
export default function AppStack({ navigation }) {

    const Stack = createStackNavigator();
    const user = useSelector(selectCurrentUser)
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'}/>
<NavigationContainer>
    <BottomSheetModalProvider>
    <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
        <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
                title: 'Login',
                headerShown: false, // Hide the header for this screen
            }}
        />
    <Stack.Screen 
        name="ChatScreen" 
        component={MessageUser} 
        options={{ headerShown: false }} // Customize as needed
        />
        <Stack.Screen
                name="Camera"
                component={CameraScreen}
                options={({ navigation }) => ({
                    headerShown: false,
                })}
            />
            
        <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={({ navigation }) => ({
                headerShown: false, // Hide the header for this screen
            //     title: 'Create Account',
            //     headerStyle: { backgroundColor: Color.BLACK},
            //     headerTintColor: Color.WHITE,
            //     headerShown: true, // Show the header for this screen
            //     headerLeft: () => (
            //       <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
            //             <Icon name={'chevron-back-sharp'} size={28} color={Color.WHITE} />
            //       </TouchableOpacity>
            //   ),
            //   headerShadowVisible: false,
            })}
        />
           <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ headerShown: false }}
          />

<Stack.Screen 
      name="PreviewFile" 
      component={PreivewFile} 
      
      options={({ navigation }) => ({ headerShown: false,
        headerStyle:{backgroundColor:Color.BACKGROUND},
        headerTintColor:Color.TEXT,
        headerTitle:'',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
               <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
          </TouchableOpacity>

      ),
        
      })
    } // Customize as needed
      
    />
              
              <Stack.Screen 
        name="Profile" 
        component={ProfileLayout} 
        options={{ headerShown: true }} // Customize as needed
        />
          <Stack.Screen 
        name="ProfileMain" 
        component={ProfileLayout} 
        options={{ headerShown: true }} // Customize as needed
        />
<Stack.Screen 
        name="ShowFriends" 
        component={Friends} 
        options={({ navigation }) => ({ headerShown: true,
          headerStyle:{backgroundColor:Color.BACKGROUND},
          headerTintColor:Color.TEXT,
          headerTitle:user.username,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                 <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
            </TouchableOpacity>
  
        ),
          
        })
      } // Customize as needed
        
        />


        <Stack.Screen 
              name="FeedProfile" 
              component={FeedProfilePreview} 
              
              options={({ navigation }) => ({ headerShown: true,
                headerStyle:{backgroundColor:Color.BACKGROUND},
                headerTintColor:Color.TEXT,
                headerTitle:user.username,
                headerLeft: () => (
                  <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                      <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
                  </TouchableOpacity>

              ),
                
              })
            } // Customize as needed
              
            />
    </Stack.Navigator>
    </BottomSheetModalProvider>
</NavigationContainer> 
</GestureHandlerRootView>
  )
}