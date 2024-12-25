import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, SafeAreaView, Alert,FlatList,ActivityIndicator,RefreshControl, Dimensions, Image, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PanGestureHandler, State } from 'react-native-gesture-handler';

import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getTheme } from './Colors/Color';
import { useDispatch, useSelector } from 'react-redux';
import {selectCurrentMessages, selectCurrentRoute, selectCurrentTheme, selectCurrentUser, selectLoadPost } from '../store/user/user.selector';
import PostComponents from './components/PostComponents';
import LoadNewPost from './components/LoadNewPost';
import { SET_ROUTE, setAddMessage, setCurrentMessages, SetUnreadMessages } from '../store/user/user.action';
import { EXPO_PUBLIC_API_URL } from '@env';


const FeedHeaderRight = ({route,navigation}) => {
    const user = useSelector(selectCurrentUser)
    const [posts, setPosts] = useState([]);
    const [viewedPosts, setViewedPosts] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [openSeeAllPosts , setOpenSeeAllPosts] = useState(false)
    const [viewableItems, setViewableItems] = useState([]);
    const LoadForPostSelector = useSelector(selectLoadPost)
    const [LoadForPost , setLoadForPost] = useState(LoadForPostSelector)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch()
    const messages = useSelector(selectCurrentMessages);

    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
    const currentRoute = useSelector(selectCurrentRoute)
    const AllPostsListRef = useRef()
    useEffect(() => {
      dispatch(SET_ROUTE('Feed'))
    },[])
    useEffect(() => {
        setLoadForPost(LoadForPostSelector)
    },[LoadForPostSelector])
    useEffect(() => {
      if(currentRoute === 'loadFeed' || currentRoute === 'FeedLoad'){
        if (AllPostsListRef.current) {
          AllPostsListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
      }
      console.log('current route: ',currentRoute)
    },[currentRoute])
    useEffect(() => {
      const fetchMessages = async () => {
          if (!user) return;
          try {
              const fetchMessages = await fetch(`${EXPO_PUBLIC_API_URL}/getAllMessages`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user._id , skip:0})
                });

              const data = await fetchMessages.json();
              if (data.error) return
              if(Array.isArray(data) && data.length <= 0){
                return
              }
              let UnreadCount = []
              data.map(message => {
                  if(message.unreadMessagesCount > 0)
                      UnreadCount.push({Unread : message.unreadMessagesCount, chatId : message.chatId })
              })
              // dispatch(setAddMessage([...messages,...data])); // add for test 
              dispatch(SetUnreadMessages(UnreadCount))
          } catch (e) {
              console.error('error fetch messages: ',e);
          }
      };

      if (user) {
          fetchMessages();
      }
  }, []);
   // Fetch posts from the server
   const fetchPosts = async () => {
    console.log('load more');
    try {
      // console.log(user)
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/findPosts`, {
        method: "post",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          seenPosts: Object.entries(viewedPosts).map(([id, viewLong]) => ({ id, viewLong }))
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // Filter out posts that are not in the viewedPosts
      const uniquePosts = data.filter(post => !viewedPosts[post._id]);
      setPosts(prevPosts => [...prevPosts, ...uniquePosts]);
      if (Object.keys(viewedPosts).length > 0 && data.length <= 0) setOpenSeeAllPosts(true);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

 // Update viewedPosts with new posts and default viewLong to false
 useEffect(() => {
  if (!posts) return;
  const newViewedPosts = posts.reduce((acc, post) => {
    if (!viewedPosts[post._id]) {
      acc[post._id] = false; // Default viewLong to false
    }
    return acc;
  }, {});

  setViewedPosts(prev => ({
    ...prev,
    ...newViewedPosts
  }));
}, [posts]);

  useEffect(() => {
    if (posts.length === 0 && !isLoading) {
      setIsLoading(true)
      fetchPosts();
    }
  }, [posts]);


  const renderItem = ({ item }) => (
    <>
     <PostComponents
      setViewedPosts = {setViewedPosts}
        setPosts={setPosts} 
        post={item} 
        posts={posts}
        isLike={item.likes.some(like => like._id === user._id)}
        isViewable={viewableItems.some(viewableItem => viewableItem.key === item._id)}
        setIsModalOpen = {setIsModalOpen}
        isModalOpen = {isModalOpen}
      />

    </>
     
   
  );

  const renderFooter = () => {
    return isLoading ? <ActivityIndicator size={50} color="#0000ff" />    : null;
  };
  const loadMorePosts = () => {
    if(openSeeAllPosts) return
    if (!isLoading) {
      setIsLoading(true)
      fetchPosts();
    }
  };
  const handleRefresh = useCallback(async () => {
    console.log('load')
    setIsLoading(true);
    setPosts([])
    setOpenSeeAllPosts(false)
    try {
      await fetchPosts(); // Execute the passed-in refresh function
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleViewableItemsChanged = ({ viewableItems }) => {
    setViewableItems(viewableItems);
};
  const handleGestureStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX < -70) { // Swipe left threshold
        navigation.navigate('Messages');
      }
    }
  };
  const handleLoadAgainPosts  = () => {
    setPosts([])
    setViewedPosts([])
    setIsLoading(false)
    setOpenSeeAllPosts(false)
    setViewableItems([])
  }
if(!user) return
    return(

      // <PanGestureHandler
      // onHandlerStateChange={handleGestureStateChange} >
        <View style={[styles.container,{backgroundColor:Color.BACKGROUND,}]}>
                      {isModalOpen && (
        <Pressable style={styles.overlay} onPress={() => {setIsModalOpen(false)}} />
      )}
        <SafeAreaView style={[styles.safeAreaView,{backgroundColor:Color.BACKGROUND,}]}>
            <Text style={[styles.title,{ color: Color.TEXT,}]}>GigsPicks</Text>
            <View style={styles.IconsContainer}>
            <TouchableOpacity
                        style={styles.iconContainerLeft}
                        onPress={() => Alert.alert('message')}
                    >
                        <Icon name="notifications-outline" size={28} color={Color.TEXT}/>
                    </TouchableOpacity>
                    
                    {/* <TouchableOpacity
                        style={styles.iconContainerRight}
                        onPress={() => navigation.navigate('Messages')}
                    >
                        <AntDesign name="message1" size={25} color={Color.WHITE} />
                    </TouchableOpacity> */}
            </View>
           
            </SafeAreaView>
            
                

            <View style={{flex:1}}>
            {isLoading && posts.length <=0? (
              <ActivityIndicator size={50} color="#0000ff" />
            ) :
            <View style={{flex:1}}>
            {LoadForPost && LoadForPost.status && 
              <LoadNewPost cover={LoadForPost.cover}/>
            }
                <FlatList
                scrollEnabled={!isModalOpen}
                data={posts}
                renderItem={renderItem}
                ref={AllPostsListRef}
                keyExtractor={(item) => item._id.toString()}
                // contentContainerStyle={{ columnGap: 150}}
                // showsVerticalScrollIndicator='false' in andorid do problems
                onEndReached={loadMorePosts}
                onEndReachedThreshold={1.5}
                ListFooterComponent={renderFooter}
                removeClippedSubviews={true}
                viewabilityConfig={{itemVisiblePercentThreshold:50}}
                onViewableItemsChanged={handleViewableItemsChanged}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoading}
                    onRefresh={handleRefresh}
                    tintColor="#0000ff" // Spinner color (iOS)
                    colors={['#ff0000', '#00ff00', '#0000ff']} // Spinner colors (Android)
                    progressBackgroundColor="#ffff00" // Background color of spinner (Android)
                  />
                }
                // debug={true}
                initialNumToRender={5}
                windowSize={3}
                />
                 {openSeeAllPosts  &&
                  <View style={{width:'100%',height:100,backgroundColor:Color.PRIMARY_BUTTON,display:'flex',alignItems:'center',gap:5}}>
                    <Text style={{fontSize:17,color:Color.WHITE,textAlign:'center',marginTop:10}}>you see all the post here :O</Text>
                    <TouchableOpacity onPress={handleLoadAgainPosts}>
                      <View style={{width:100,height:50,borderRadius:12,backgroundColor:Color.PRIMARY_BUTTON_HOVER,display:'flex',justifyContent:'center',alignItems:'center'}}>
                        <Text style={{color:Color.WHITE}}>See Again</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                }
            </View>
            }
            </View>
            </View>
            
         )
 
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        position:'relative'
    },
    safeAreaView: {
        flexDirection: 'row', // Arrange items horizontally
        justifyContent: 'space-between', // Distribute items evenly along the main axis
        alignItems: 'center', // Center items vertically
        paddingHorizontal: 20,
        marginTop: 40,
        zIndex:10
    },
    IconsContainer:{
        marginRight:10,
        display:'flex',
        flexDirection:'row',
        gap:10
    },
    title: {
        marginLeft:10,
        fontSize: 24,
        fontWeight: 'bold',
    },
    iconContainerLeft: {
        padding: 10,
        borderRadius: 20,
    },
    iconContainerRight: {
        padding: 10,
        borderRadius: 20,
    },
    hr:{
        width:'100%',
        height:1,
    },        // backgroundColor:Color.LINE_BREAK
   
      loader: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
      },
      postContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
      },
      ImageSlide:{
        position:'relative',
        height:10,
        width:10,
        zIndex:1,
        backgroundColor:'lightgray',
        borderRadius:50,
      },
      overlay:{
        backgroundColor: 'rgba(0, 0, 0, .5)', // Semi-transparent background
        zIndex: 1000, // Ensure overlay is above other components
        // Ensure the overlay is not scrollable
        position:'absolute',
        top:0,
        left:0,
        bottom:0,
        height: Dimensions.get('screen').height,
        width: Dimensions.get('window').width
  
      }

})



export default FeedHeaderRight;
