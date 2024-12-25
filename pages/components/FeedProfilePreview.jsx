import React, { useRef, useEffect, useState } from 'react';
import { View, FlatList, Text, Dimensions, Pressable, SafeAreaView, TouchableOpacity } from 'react-native';
import PostComponents from './PostComponents';
import { useSelector } from 'react-redux';
import { selectCurrentTheme, selectCurrentUser } from '../../store/user/user.selector';
import { useNavigationState, useRoute } from '@react-navigation/native';
import { getTheme } from '../Colors/Color';
import Icon from 'react-native-vector-icons/Ionicons'; // Import your preferred icon library

export default function FeedProfilePreview({navigation}) {
  const route = useRoute();
  const { posts, index,setPosts } = route.params; // Extract posts and index from route parameters
  const user = useSelector(selectCurrentUser);

  const firstRouteName = useNavigationState(state => state.routes[0]?.name);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [post, setPosts] = useState(posts)
  const isDarkMode = useSelector(selectCurrentTheme)

  const Color = getTheme(isDarkMode); // Get the theme based on the mode
  const renderItem = ({ item }) => {
    // console.log(firstRouteName , ' first route')
    return <PostComponents
      post={item}
      like={item.likes.some(like =>  like._id ? like._id === user._id  : like === user._id)}
      setPosts={setPosts}
      CommentNavigate={(firstRouteName === 'FeedMain' ? 'Profile' :'ProfileMain')}
      ChatNavigate={(firstRouteName === 'FeedMain' ? 'ChatScreen' :'ChatScreenProfile')}
      setIsModalOpen = {setIsModalOpen}
      isModalOpen = {isModalOpen}
    />
  };

  return (
    <View style={{ flex: 1, backgroundColor: Color.BACKGROUND }}>
   <SafeAreaView style={{
        backgroundColor:Color.BACKGROUND,
        paddingHorizontal: 10,
        height:60,
        marginTop: 40,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        position:'relative',
        zIndex:10}}
        >        
        <Text style={{ color: Color.TEXT,
        fontSize: 24,
        fontWeight: 'bold',marginTop:2}}>{user.username}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15,position:'absolute',top:27,left:-10 }}>
                 <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
            </TouchableOpacity>
      </SafeAreaView>
         {isModalOpen && (
        <Pressable style={{
          backgroundColor: 'rgba(0, 0, 0, .5)', // Semi-transparent background
        zIndex: 2000, // Ensure overlay is above other components
        elevation: 10, // Add elevation for Android
        // Ensure the overlay is not scrollable
        position:'absolute',
        top:0,
        left:0,
        bottom:0,
        height: Dimensions.get('screen').height,
        width: Dimensions.get('window').width
        }} onPress={() => {setIsModalOpen(false)}} />
      )}
      <FlatList
         scrollEnabled={!isModalOpen}
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />
    </View>
  );
}
