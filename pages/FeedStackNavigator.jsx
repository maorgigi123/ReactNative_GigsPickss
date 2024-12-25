// screens/FeedStackScreen.js
import { createStackNavigator } from '@react-navigation/stack';
import FeedHeaderRight from './FeedScreen';
import Messages from './Messages/Messages';
import Icon from 'react-native-vector-icons/Ionicons'; // Import your preferred icon library
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCurrentTheme, selectCurrentUser } from '../store/user/user.selector';
import MessageUser from './Messages/MessageUser';
import ProfileLayout from './ProfileScreen';
import FeedProfilePreview from './components/FeedProfilePreview';
import PreivewFile from './components/PreivewFile';
import Friends from './Friends/Friends';
import { getTheme } from './Colors/Color';
const FeedStack = createStackNavigator();

export default function FeedStackScreen() {
    const user = useSelector(selectCurrentUser)
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode

  return (
    <FeedStack.Navigator>
      <FeedStack.Screen 
        name="FeedMain" 
        component={FeedHeaderRight} 
        options={{ headerShown: false }} // Customize as needed
      />
        <FeedStack.Screen 
        name="ChatScreen" 
        component={MessageUser} 
        options={{ headerShown: false }} // Customize as needed
        />
         <FeedStack.Screen 
        name="Profile" 
        component={ProfileLayout} 
        options={{ headerShown: true }} // Customize as needed
        />

<FeedStack.Screen 
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

        <FeedStack.Screen 
              name="FeedProfile" 
              component={FeedProfilePreview} 
              
              options={({ navigation }) => ({ headerShown: false,
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


{/* <FeedStack.Screen 
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
      
    /> */}


    </FeedStack.Navigator>
  );
}
