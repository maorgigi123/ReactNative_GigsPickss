import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ProfileLayout from './ProfileScreen';
import { useRoute } from '@react-navigation/native';
import FeedHeaderRight from './FeedScreen';
import FeedProfilePreview from './components/FeedProfilePreview';
import Icon from 'react-native-vector-icons/Ionicons'; // Import your preferred icon library
import Messages from './Messages/Messages';
import MessageUser from './Messages/MessageUser';
import PreivewFile from './components/PreivewFile';
import ProfileSetting from './components/ProfileSetting';
import LoginScreen from './Login';
import EditProfile from './components/EditProfile';
import Friends from './Friends/Friends';
import { getTheme } from './Colors/Color';
import { selectCurrentTheme } from '../store/user/user.selector';
import { useSelector } from 'react-redux';
import ColorTheme from './components/ColorTheme';
import EditUsername from './components/EditProfile/EditUsername';
import EditBio from './components/EditProfile/EditBio';

const FeedStack = createStackNavigator();

export default function ProfileStack() {
    const route = useRoute();
    const user = route.params;
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
    const CustomTransition = {
      cardStyleInterpolator: ({ current, layouts }) => {
        const { progress } = current;
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.height, 0],
        });
    
        return {
          cardStyle: {
            transform: [{ translateX }],
          },
        };
      },
    };


  return (
    <FeedStack.Navigator initialRouteName='ProfileMain'>
    <FeedStack.Screen 
      name="ProfileMain" 
      component={ProfileLayout} 
      options={{ headerShown: true,title:""}} // Customize as needed
      initialParams={{username: user.username }}
    />
     <FeedStack.Screen 
      name="FeedProfile" 
      component={FeedProfilePreview}
      options={({ navigation }) => ({ headerShown: false,
        headerStyle:{
          backgroundColor:Color.BACKGROUND,
          elevation:0,
          shadowOpacity: 0, // Remove shadow to avoid overlapping
        },
        headerTintColor: Color.TEXT,
        headerTitle: user.username,
        headerTitleStyle:{
          fontSize:24
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
               <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
          </TouchableOpacity>

      ),
      headerShadowVisible: false
      })
    } // Customize as needed
    />
  <FeedStack.Screen 
        name="ChatScreenProfile" 
        component={MessageUser} 
        options={{ headerShown: false }} // Customize as needed
        />

  <FeedStack.Screen 
        name="ShowFriends" 
        component={Friends} 
        options={({ navigation, route }) => ({ headerShown: true,
          headerStyle:{backgroundColor:Color.BACKGROUND},
          headerTintColor:Color.TEXT,
          headerTitle: route.params?.Type === 'followers' ? 'Followers' : 'Following', // Set title based on Type
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                 <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
            </TouchableOpacity>
  
        ),
          
        })
      } // Customize as needed
        
        />
  <FeedStack.Screen 
        name="ChangeColorTheme" 
        component={ColorTheme} 
        options={({ navigation }) => ({ headerShown: true,
          headerStyle:{backgroundColor:Color.BACKGROUND},
          headerTintColor:Color.TEXT,
          headerTitle:'Select Theme',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                 <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
            </TouchableOpacity>
  
        ),
          
        })
      } // Customize as needed
        
        />

<FeedStack.Screen 
      name="PreviewFile" 
      component={PreivewFile} 
      
      options={({ navigation }) => ({ headerShown: true,
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
      <FeedStack.Screen
                name="Setting"
                component={ProfileSetting}
                options={({ navigation }) => ({
                    headerShown: true,
                    title: 'Setting',
                    headerStyle: { backgroundColor: Color.BACKGROUND },
                    headerTintColor: Color.TEXT,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                              <Icon name={'close'} size={35} color={Color.TEXT} />
                        </TouchableOpacity>
                    ),
                    gestureEnabled: false,
                    headerShadowVisible: false,
                    ...CustomTransition,
                })}
            />

        <FeedStack.Screen
                name="EditProfile"
                component={EditProfile}
                options={({ navigation }) => ({
                    headerShown: true,
                    title: 'Edit Profile',
                    headerStyle: { backgroundColor: Color.BACKGROUND },
                    headerTintColor: Color.TEXT,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                              <Icon name={'close'} size={35} color={Color.TEXT} />
                        </TouchableOpacity>
                    ),
                    gestureEnabled: false,
                    headerShadowVisible: false,
                    ...CustomTransition,
                })}
            />

<FeedStack.Screen 
      name="Edit Username" 
      component={EditUsername} 
      
      options={({ navigation , route}) => ({ headerShown: true,
        headerStyle:{backgroundColor:Color.BACKGROUND},
        headerTintColor:Color.TEXT,
        headerTitle:'Edit Username',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
               <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
          </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => route.params.handleSave()} style={{ marginRight: 15 }}>
          <Text style={{ color: Color.PRIMARY_BUTTON,fontWeight:'bold', fontSize: 16 }}>Save</Text>
        </TouchableOpacity>
      ),
        
      })
    } // Customize as needed
    />

<FeedStack.Screen 
      name="Edit biography" 
      component={EditBio} 
      
      options={({ navigation, route }) => ({ headerShown: true,
        headerStyle:{backgroundColor:Color.BACKGROUND},
        headerTintColor:Color.TEXT,
        headerTitle:'Edit biography',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
               <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
          </TouchableOpacity>

      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => route.params.handleSave()} style={{ marginRight: 15 }}>
          <Text style={{ color: Color.PRIMARY_BUTTON,fontWeight:'bold', fontSize: 16 }}>Save</Text>
        </TouchableOpacity>
      ),
        
      })
    } // Customize as needed
    />

  </FeedStack.Navigator>
  )
}