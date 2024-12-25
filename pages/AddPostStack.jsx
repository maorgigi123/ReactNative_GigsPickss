import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Videos from './Videos';
import EditPots from './EditPots';
import {AntDesign,MaterialIcons} from 'react-native-vector-icons'; // Import your preferred icon library

import { TouchableOpacity } from 'react-native';
import EditImage from './components/EditImage';
import AddPots from './AddPots';
import { useSelector } from 'react-redux';
import { selectCurrentTheme } from '../store/user/user.selector';
import { getTheme } from './Colors/Color';
export const AddPostStack = () => {
    const AddPostStack = createStackNavigator();
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
    const CustomTransition = {
      cardStyleInterpolator: ({ current, layouts }) => {
        const { progress } = current;
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.height, 0],
        });
    
        return {
          cardStyle: {
            transform: [{ translateY }],
          },
        };
      },
    };
  return (
    <AddPostStack.Navigator 
    initialRouteName='AddPost'>
        <AddPostStack.Screen 
            name="AddPost" 
            component={Videos} 
            options={{ headerShown: false}} // Customize as needed
        />

    <AddPostStack.Screen 
      name="EditPost" 
      component={EditPots} 
      
      options={({ navigation }) => ({ headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.popToTop()} style={{ marginLeft: 15 }}>
             <AntDesign name={'close'} size={28} color={Color.TEXT} />
          </TouchableOpacity>
      ),
        headerStyle:{backgroundColor:Color.BACKGROUND},
        headerTintColor:Color.TEXT,
      gestureEnabled: false, // Disable swipe gestures
      headerShadowVisible: false,
      })
    } // Customize as needed
    />

<AddPostStack.Screen
                name="EditImage"
                component={EditImage}
                options={({ navigation }) => ({
                    headerShown: true,
                    title: '',
                    headerStyle: { backgroundColor: Color.BACKGROUND },
                    headerTintColor: Color.TEXT,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <AntDesign name={'close'} size={28} color={Color.TEXT} />
                        </TouchableOpacity>
                    ),
                    gestureEnabled: false,
                    headerShadowVisible: false,
                    ...CustomTransition,
                })}
            />
        <AddPostStack.Screen
                name="Post"
                component={AddPots}
                options={({ navigation }) => ({
                    headerShown: true,
                    title: 'New Post',
                    headerStyle: { backgroundColor: Color.BACKGROUND },
                    headerTintColor: Color.TEXT,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <AntDesign name={'close'} size={28} color={Color.TEXT} />
                        </TouchableOpacity>
                    ),
                    gestureEnabled: false,
                    headerShadowVisible: false,
                })}
            />


    </AddPostStack.Navigator>
  )
}
