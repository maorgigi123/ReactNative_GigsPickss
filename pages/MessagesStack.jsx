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

export default function MessagesStack() {
    const user = useSelector(selectCurrentUser)
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
  return (
    <FeedStack.Navigator>
        <FeedStack.Screen 
        name="Messages" 
        component={Messages} 
        options={({ navigation }) => ({
        headerTitle:user ?  user.username : '', // Custom title
        // headerRight: () => (
        //     // <View style={{ marginRight: 15 }}>
        //     // <FontAwesome name={'edit'} size={28} color={Color.TEXT} />
        //     // </View>
        // ),
        headerStyle: {
            backgroundColor: '#fff', // Header background color
        },
        headerTitleStyle: {
            fontWeight: 'bold', // Title text styling
        },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Color.BACKGROUND},
        headerTitleStyle: {
            color: Color.TEXT, // Change this to your desired title color
            fontWeight: 'bold', // Optional: Title text styling
        },

        })}
        />

    </FeedStack.Navigator>
  );
}
