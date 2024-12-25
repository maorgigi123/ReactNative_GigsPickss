import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,AppState,SafeAreaView, Alert, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Import your preferred icon library
import {AntDesign,FontAwesome} from 'react-native-vector-icons'; // Import your preferred icon library
import {Image} from 'expo-image'
import FeedScreen from './FeedScreen';
import ExploreScreen from './ExploreScreen';
import ProfileScreen from './ProfileScreen';
import Videos from './Videos';
import FeedStackScreen from './FeedStackNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentMessages, selectCurrentRoute, selectCurrentTheme, selectCurrentUnreadMessages, selectCurrentUser } from '../store/user/user.selector';
import { useNavigation, useNavigationState, useRoute } from '@react-navigation/native';
import ProfileStack from './ProfileStack';
import { getTheme } from './Colors/Color';
import { AddPostStack } from './AddPostStack';
import MessageUser from './Messages/MessageUser';
import Messages from './Messages/Messages';
import MessagesStack from './MessagesStack';
import ExplorePageStack from './ExploreStack';
import { setCurrentWs } from '../store/webSocket/ws.action';
import { EditCurrentMessage, SET_CURRENTPLAYERS, SET_PLAYERS_LOCATION, SET_ROUTE, setAddMessage, setCurrentUser, setLoadPost, SetUnreadMessages, setUpdateMessage } from '../store/user/user.action';
import { UserContext } from '../store/userContext';
import ExpoImage from 'expo-image/build/ExpoImage';
import { rotate } from 'react-native-redash';
import { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_API_URL_WS } from '@env';
import * as Notifications from 'expo-notifications';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();
const HomeScreen = () => {
    const user = useSelector(selectCurrentUser)
    const navigation = useNavigation()
    const dispatch = useDispatch();
    const [load,setLoad] = useState(false);
    const [error,setError] = useState('')
    const ws = useRef(null);
    let timeOut = useRef(null);
    const [newMessage,setNewMessage] = useState()
    const { setPathUserMessage } = useContext(UserContext);
    const currentRoute = useSelector(selectCurrentRoute)
    const UnreadMessages = useSelector(selectCurrentUnreadMessages)
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Listener for notification responses (when a notification is clicked)
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        // Navigate to a specific screen or perform an action based on the notification data
     console.log('cliock on notification ', data)
      });

      return () => {
        // Clean up the listener on unmount
        subscription.remove();
      };

    },[])
    // פונקציה לבקש הרשאות
    const registerForPushNotificationsAsync = async () => {
        // Request notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        console.log(finalStatus)

        // If permission is granted, get the token
        if (finalStatus === 'granted') {
          const token = await Notifications.getExpoPushTokenAsync();
          console.log('Expo Push Token:', token);
          ws.current.send(JSON.stringify({type:'GetUserToken', payload:{token:token,username:user.username}}));
          // Send this token to your server to save it for sending notifications later
        } else {
          console.warn('Notification permission not granted');
        }
    };

    useEffect(() => {
        if(!user) return
    
        setLoad(true)
        // Initialize WebSocket connection
        // const encodedUsername = encodeURIComponent(user.username);
        // const wsUrl = `ws://${process.env.EXPO_PUBLIC_API_URL_WS}?username=${encodedUsername}`;

        // ws.current = new WebSocket(wsUrl);
        dispatch(setLoadPost({ cover: '', status: false }));
        ws.current = new WebSocket(encodeURI(`ws://${EXPO_PUBLIC_API_URL_WS}?username=${user.username}`));
    
        // WebSocket connection opened
        ws.current.onopen = async() => {
          dispatch(setCurrentWs(ws.current))
          setLoad(false)
          const token = await registerForPushNotificationsAsync();
        };
        // WebSocket message received
        ws.current.onmessage = (event) => {
           const mesage = JSON.parse(event.data);
           if(mesage.newMessage){
            
            // dispatch(setAddMessage(mesage.newMessage))
            if(mesage.newMessage.sender.username !== user.username){
              dispatch(setAddMessage(mesage.newMessage))
              setNewMessage(mesage.newMessage)

              const existingMessageIndex = UnreadMessages.findIndex(msg => msg.chatId === mesage.chatId);
              const unread = UnreadMessages ;
              if (existingMessageIndex !== -1) {
                // אם יש אובייקט עם אותו chatId, תעדכן את הספירה של ההודעות שלא נקראו
                unread[existingMessageIndex].Unread += 1;
                } else {
                    // אם אין אובייקט עם אותו chatId, תוסיף הודעה חדשה לרשימה
                    unread.push({ Unread: 1, chatId: mesage.chatId });
                }
                  dispatch(SetUnreadMessages(unread))      
              }
              else{
                console.log('edit message : ',mesage.id)

                  dispatch(EditCurrentMessage(mesage.newMessage,mesage.id))
              }
           }
           if(mesage.updateRead){
            dispatch(setUpdateMessage(mesage.updateRead.data))
           }
           if(mesage.newLocationUpdate){
            dispatch(SET_PLAYERS_LOCATION({location:mesage.newLocationUpdate,username:mesage.username}))
          }
          if(mesage.uploadPost){
            if(mesage.uploadPost === 'error'){
              dispatch(setLoadPost({ cover: '', status: false }));
              return Alert.alert('Error While Upload Post')
            }
            dispatch(setLoadPost({ cover: '', status: false }));
          }
          if(mesage.allPlayersLocation){
            // console.log('new locations ',mesage.newLocationUpdate)
            // dispatch(SET_CURRENTPLAYERS(mesage.allPlayersLocation))
            dispatch(SET_CURRENTPLAYERS([]))
            mesage.allPlayersLocation.map((message) => {
              if(message.username && message.username !== user.username){
                console.log(`add to :${user.username} mark of ${message.username}`)
                dispatch(SET_PLAYERS_LOCATION({location:message.location,username:message.user}))
              }
            })
            
          }
        };
    
        // WebSocket connection closed
        ws.current.onclose = () => {
          console.log('WebSocket connection closed');
        };
    
        // WebSocket error occurred
        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setLoad(false)
          setError('something went wrong with the connection, please try again')
           dispatch(setCurrentUser(null))
        };
         // Clean up function
         return () => {
          // Close the WebSocket connection when the component unmounts
          ws.current.close();
        };
    
      }, []);

      useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
          if (nextAppState === 'background') {
            if(ws.current && user && user.username)
              ws.current.send(JSON.stringify({ type: 'disconnect', username: `${user.username}` }));
            }
          else if (nextAppState === 'active') {
            if(ws.current && user && user.username){
              ws.current = new WebSocket(encodeURI(`ws://${EXPO_PUBLIC_API_URL_WS}?username=${user.username}`));
                 // WebSocket connection opened
                ws.current.onopen = () => {
                  dispatch(setCurrentWs(ws.current))
                };
                 // WebSocket message received
                ws.current.onmessage = (event) => {
                  const mesage = JSON.parse(event.data);

                  if(mesage.newMessage){
                    // console.log('new message ')
                    dispatch(setAddMessage(mesage.newMessage))
                    if(mesage.newMessage.sender.username !== user.username){
                      setNewMessage(mesage.newMessage)
        
                      const existingMessageIndex = UnreadMessages.findIndex(msg => msg.chatId === mesage.chatId);
                      const unread = UnreadMessages;
                      if (existingMessageIndex !== -1) {
                        // אם יש אובייקט עם אותו chatId, תעדכן את הספירה של ההודעות שלא נקראו
                        unread[existingMessageIndex].Unread += 1;
                    } else {
                        // אם אין אובייקט עם אותו chatId, תוסיף הודעה חדשה לרשימה
                        unread.push({ Unread: 1, chatId: mesage.chatId });
                    }
                      dispatch(SetUnreadMessages(unread))      
                    }
                  }
                  if(mesage.updateRead){
                    console.log('update message for:',user.username)
                    dispatch(setUpdateMessage(mesage.updateRead.data))
                   }
                  if(mesage.newLocationUpdate){
                    console.log('new locations ',mesage.newLocationUpdate)
                    dispatch(SET_PLAYERS_LOCATION({location:mesage.newLocationUpdate,username:mesage.username}))
                  }
                  if(mesage.uploadPost){
                    if(mesage.uploadPost === 'error'){
                      dispatch(setLoadPost({ cover: '', status: false }));
                      return Alert.alert('Error While Upload Post')
                    }
                    dispatch(setLoadPost({ cover: '', status: false }));
                  }
                  if(mesage.allPlayersLocation){
                    // console.log('new locations ',mesage.newLocationUpdate)
                    // dispatch(SET_CURRENTPLAYERS(mesage.allPlayersLocation))
                    dispatch(SET_CURRENTPLAYERS([]))
                    mesage.allPlayersLocation.map((message) => {
                      if(message.username && message.username !== user.username){
                        console.log('add : ',message.username)
                        dispatch(SET_PLAYERS_LOCATION({location:message.location,username:message.user}))
                      }
                    })
                    
                  }
              };
               // WebSocket error occurred
                ws.current.onerror = (error) => {
                  console.error('WebSocket error:', error);
                  setError('something went wrong with the connection, please try again')
                  dispatch(setCurrentUser(null))
                };
    
            }
          }
        }
        const subscription = AppState.addEventListener('change', handleAppStateChange);
    
        return () => {
          subscription.remove();
        };
      }, []);
    useEffect(() => {
        if(!newMessage) return
        if (timeOut.current) {
          clearTimeout(timeOut.current);
        }
        timeOut.current = setTimeout(()=>{
         
          setNewMessage()
        },3000) //4000
        
      },[newMessage])

      useEffect(() => {
        if (UnreadMessages.length > 0) {
            // Start the animation when there are unread messages
            Animated.sequence([
              Animated.timing(rotation, {
                  toValue: -20, // Rotate to the left
                  duration: 300,
                  useNativeDriver: true,
              }),
              Animated.timing(rotation, {
                  toValue: 20, // Rotate to the right
                  duration: 300,
                  useNativeDriver: true,
              }),
              Animated.timing(rotation, { 
                  toValue: 0, // Rotate back to original position
                  duration: 300,
                  useNativeDriver: true,
              }),
          ]).start();
        }
    }, [UnreadMessages]);

    // Interpolating the rotation value to use in degrees
    const rotateInterpolate = rotation.interpolate({
        inputRange: [-20, 20],
        outputRange: ['-20deg', '20deg'], // Adjust the degree of rotation
    });

    return (
        <View style={{flex:1}}>
            {load ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          </View> : 

        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Feed') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Messages') {
                        return <View  style={{position:'relative'}}>
                          {UnreadMessages.length > 0 &&   
                             <View style={{
                              position: 'absolute',
                              marginLeft: 20,
                              top: -15,
                              width: 22,
                              height: 22,
                              display: 'flex',
                              justifyContent: 'center',
                              backgroundColor:'red',
                              borderRadius:50,
                              alignItems: 'center',
                          }}>
                              <Animated.Text
                                  style={{
                                      color: 'white',
                                      fontWeight: 'bold',
                                      fontSize: 16,
                                      transform: [{ rotate: rotateInterpolate }] // Apply rotation to the text
                                  }}
                              >
                                  {UnreadMessages.length}
                              </Animated.Text>
                          </View>
                          }
                        
                          <AntDesign name="message1" size={25} color={focused ? Color.PRIMARY_COLOR : Color.TEXT} />
                          </View>
                        // iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Videos') {
                        iconName = focused ? 'location-sharp' : 'location-outline';
                    } else if (route.name === 'Profile') {
                        return <View style={{width:34,height:34,borderRadius:999,backgroundColor:focused ? Color.PRIMARY_COLOR : Color.TEXT,justifyContent:'center',alignItems:'center'}}>
                            <ExpoImage source={{uri:user ? `${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}` : ''}} style={{width:30,height:30,borderRadius:50}}/>
                        </View>
                        // return <Image source={{uri:user.profile_img}} style={{width:40,height:40,borderRadius:50}}/>
                        // iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Add') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    }

                    // Adjust icon size as needed
                    size = 28;

                    // Return the icon component
                    return <Icon name={iconName} size={size} color={focused ?  color : Color.TEXT} />;
                },
                tabBarActiveTintColor: Color.PRIMARY_COLOR, // Color of tab when pressed
                tabBarInactiveTintColor: '#fff', // Color of tab when not pressed
                tabBarShowLabel: false, // Hide label of tabs
                tabBarStyle: {
                    backgroundColor: Color.BACKGROUND, // Background color of tab bar
                    borderTopWidth: 0,
                    borderTopColor: '#171616', // Top border color of tab bar
                },
                
            })}
            screenListeners={({ route }) => ({
              tabPress: (e) => {
                console.log(currentRoute , ' ',route.name)
                if(currentRoute == route.name){
                  if( currentRoute === 'Feed'){
                    return dispatch(SET_ROUTE('loadFeed'));
                  }
                }
                if(currentRoute === 'loadFeed'){
                  return dispatch(SET_ROUTE('FeedLoad'));
                }
                if(currentRoute === 'FeedLoad'){
                  return dispatch(SET_ROUTE('loadFeed'));
                }
                dispatch(SET_ROUTE(route.name));
              },
            })}
        >
            <Tab.Screen name="Feed" component={FeedStackScreen} options={{ headerShown: false}}/>
            <Tab.Screen name="Messages" component={MessagesStack} options={{headerShown: false }} 
            />
            <Tab.Screen name="Add" component={AddPostStack} options={{ headerShown: false }} />
            <Tab.Screen name="Videos" component={ExplorePageStack} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false  }}  initialParams={{username: user ? user.username : '' }}  />
        </Tab.Navigator>
    } 
    {newMessage && currentRoute !== 'Messages' && 
         <SafeAreaView style={styles.newMessageContainer}>
          <TouchableOpacity style={[styles.newMessage , {backgroundColor: Color.PRIMARY_BUTTON_HOVER}]} onPress={() => {
            setNewMessage();
            setPathUserMessage(newMessage.sender)
            navigation.navigate('Messages')}
          }>
          <ExpoImage
              source={{ uri: `${EXPO_PUBLIC_API_URL}/uploads/${newMessage.sender.username === user.username ? newMessage.recipient.profile_img : newMessage.sender.profile_img}` }} // Replace with actual image source
              style={styles.profileImg}s
          />
          <View style={styles.newMessageProfileInfoContainer}>
              <Text style={styles.profileName}>{newMessage.sender.username}</Text>
              <Text style={[styles.profileMessage, {color: Color.GrayBackground,}]}>{newMessage.content}</Text>
          </View>
          </TouchableOpacity>
     </SafeAreaView>
    }
    </View>
    );
};

export default HomeScreen;


const styles = StyleSheet.create({
    newMessageContainer: {
      height: 100,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      zIndex: 100,
    },
    newMessage: {
      height: 70,
      width: '80%',
      borderRadius: 12,
      marginTop: 20,
      flexDirection: 'row', // Align items in a row
      alignItems: 'center',
      padding: 12,
      overflow: 'hidden',
    },
    profileImg: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    newMessageProfileInfoContainer: {
      marginLeft: 10, // Adjust margin as needed
    },
    profileName: {
      fontWeight: 'bold', // Adjust font weight
      fontSize: 18, // Adjust font size
      color:'white'
    },
    profileMessage: {
      width: '100%',
      fontWeight:'bold',
      fontSize:12
    },
  });