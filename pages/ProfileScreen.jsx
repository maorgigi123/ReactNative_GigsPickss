import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentTheme, selectCurrentUser } from "../store/user/user.selector";
import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native";
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, SafeAreaView, RefreshControl, StyleSheet } from "react-native";
import styled from "styled-components/native";
import ProfilePosts from "./ProfilePosts";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getTheme } from "./Colors/Color";
import { UserContext } from "../store/userContext";
import { addFollow, setCurrentUser } from "../store/user/user.action";
import { Axios } from "axios";
import { EXPO_PUBLIC_API_URL } from '@env';

const ProfileContainer = styled.View`
  width: 100%;
`;

const TopLayoutContainer = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  margin-bottom: 20px;
  justify-content: center;
  align-items: center;
`;

const TopLayoutLeft = styled.View`
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
   /* margin-left: 15px; */
`;

const TopLayoutProfileImg = styled.Image`
  width: 120px;
  height: 120px;
  border-radius: 150px; /* Using half of the width/height for a circular image */
`;

const TopLayoutRight = styled.View`
  display: flex;
  flex-direction: row;
  gap: 40px;
`;

const LineBreakContainer = styled.View`
  position: relative;
`;

const Line = styled.View`
  height: 1px;
  background-color: #737373;
`;

const BioContainer = styled.View`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 10px;
`;

const BioInfo = styled.Text`
  font-weight: 400;
  font-size: 16px;
  text-align: center;
`;

const LoaderContainer = styled.View`
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-top:30px;
`;

const NoPostsYetContainer = styled.View`
  width: 100%;
  align-items: center;
  margin-top: 30px;
`;

const NoPostsYetText = styled.Text`
  font-size: 30px;
  font-weight: bold;
`;

const PostsContainer = styled.View`
  width: 100vw;
  overflow-x: hidden;
  overflow-y: auto; /* Changed to auto */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1px;
`;


const ProfileLayout = () => {
  const _user = useSelector(selectCurrentUser);
  const navigation = useNavigation();
  const dispath = useDispatch()
  const route = useRoute();
  const { username} = route.params;
  const {back} = route.params
  const {ChatNavigate ='ChatScreen',CommentNavigate ='Profile'} = route.params;
  const [SelectPosts, SetSelectPost] = useState(true);
  const [allPosts, setPosts] = useState([]);
  const [load, setLoad] = useState(true);
  const [loadPosts, setLoadPosts] = useState(false);
  const [user, setUser] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [seeAll,setSeeAll] = useState(false)
  // const isFollowTest = _user && _user.following.some(follow => follow.following.username === username)
  const [isFollow,setIsFollow] = useState(false)
  let postsID = useRef([]);
  let post = useRef(null);
  const isDarkMode = useSelector(selectCurrentTheme)
  const Color = getTheme(isDarkMode); // Get the theme based on the mode
  const { setPathUserMessage } = useContext(UserContext);

  const [showPreview, setShowPreview] = useState(false);


  const OnClickSelectHandler = (ClickOnPosts) => {
    SetSelectPost(ClickOnPosts);
  };

  const fetchData = async (username) => {
    try {
      const fetchUser = await fetch(`${EXPO_PUBLIC_API_URL}/getUserByUsername`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username,
           seen: postsID.current.length,
            CurrentUsername : _user.username,
            CurrentId : _user._id
          })
      });

      const data = await fetchUser.json();
      if (data === 'dont have user') {
        console.log('User not found');
        setLoad(false);
      } else {
        const user = data[0];
        const posts = data[1];
        const isFreind = data[2]
        setIsFollow(isFreind)
        if(posts.length <=0) setSeeAll(true); 
        if(posts.length < 12) setSeeAll(true)
        const unseenPosts = posts.filter(post => !postsID.current.includes(post._id));
        setPosts((prev) => [...prev, ...unseenPosts]);
        postsID.current.push(...unseenPosts.map(post => post._id));
        if(isAdmin){
          dispath(setCurrentUser(user))
        }
        setUser(user);
        setPosts(posts);
        setTimeout(()=>{
          setLoad(false);
        },100)
        
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoad(false);
    }
  };

  const fetchMorePosts = async () => {
    if(seeAll) return
    if (showPreview) return;
    if(loadPosts) return
    if (postsID.current.length <= 0) return;
    setLoadPosts(true);
    try {
      const fetchUser = await fetch(`${EXPO_PUBLIC_API_URL}/getUserPosts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          seenPosts: postsID.current
        })
      });

      const data = await fetchUser.json();
      if(data.length <=0) setSeeAll(true)
      if(data.length < 8) setSeeAll(true)
      if (data.length > 0) {
        const unseenPosts = data.filter(post => !postsID.current.includes(post._id));
        setPosts((prev) => [...prev, ...unseenPosts]);
        postsID.current.push(...unseenPosts.map(post => post._id));
      }
      setLoadPosts(false);
      
    } catch (error) {
      console.log('Error fetching user posts:', error);
      setLoadPosts(false);
    }
  };

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleRefresh = async() => {
    setLoadPosts(true);
    setPosts([])
    setLoad(true)
    setSeeAll(false)
    postsID.current = []
    if (_user && username === _user.username) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    try {
      await fetchData(username); // Execute the passed-in refresh function
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setLoadPosts(false);
    }
  }; 

  useEffect(() => {
    handleRefresh()
  }, [post.current, showPreview]);

  const renderFooter = () => {
    if (!loadPosts) return null;
    return (
      <LoaderContainer>
<ActivityIndicator size={50} color="#0000ff" />
</LoaderContainer>
    );
  };
const chunkData = (data, size) => {
  const result = [];
  for (let i = 0; i < data.length; i += size) {
    result.push(data.slice(i, i + size));
  }
  return result;
};

const handleAddFollowFunction = async() => {
  const FollowRes = await fetch(`${EXPO_PUBLIC_API_URL}/AddFollow`,{
    method:'post',
    headers:{'content-Type':'application/json'},
      body: JSON.stringify({
        follower:_user._id,
        following:user._id
      })
  })

  const data = await FollowRes.json()
  if(data.message === 'Added follow'){
    setIsFollow(true)
    // dispath(setCurrentUser(data.followerUser))
    // dispath(addF ollow())
  }
  else if(data.message === 'Removed follow'){
    setIsFollow(false)
    // dispath(setCurrentUser(data.followerUser))
    // dispath(removeFollow())
  }
  else{
    setIsFollow(false)
    console.log('was error while following')
  }
}

    // Use layout effect to set header options
    useLayoutEffect(() => {
      navigation.setOptions({
        title:isAdmin & _user ? _user.username  :  username,
        headerStyle: {
          backgroundColor: Color.BACKGROUND, // Example: Dynamic background color
          elevation: 0, // Removes the Android shadow
          shadowOpacity: 0, // Removes the iOS shadow
          borderBottomWidth: 0, // Removes the bottom border line
        },
        headerTitleStyle: {
          fontSize: 24, // Change this value to your desired font size
          color: Color.TEXT, // Customize the text color if needed
        },
        headerLeft: () => (
          back ? (
            <TouchableOpacity
              style={{ position: 'absolute', marginTop: 37, marginLeft: 10, zIndex: 10 }}
              onPress={() => { navigation.goBack(); }}
            >
              <Icon name={'chevron-back-sharp'} size={30} color={Color.TEXT} />
            </TouchableOpacity>
          ) : null
        ),
          headerRight: () => (
            <View style={styles.IconsContainer}>
            {isAdmin ? [
                  ,
              <TouchableOpacity key={'menu-outline'}
                      style={styles.iconContainerRight}
                      onPress={() => {navigation.navigate('Setting')}}
                  >
                       <Icon name="menu-outline" size={35} color={Color.TEXT}/>
                  </TouchableOpacity>]
                  :
                  <TouchableOpacity
                  style={styles.iconContainerRight}
                  onPress={() => {}}
              >
                   <MaterialCommunityIcons name="dots-horizontal" size={28} color={Color.TEXT}/>
              </TouchableOpacity>
                  }
                
                 
          </View>
          ),
      });
      }, [navigation,username,back,isAdmin,isDarkMode,_user]);
  const gridData = chunkData(SelectPosts ? allPosts : [], allPosts.length);
  return (
    <View style={{ flex: 1, backgroundColor: Color.BACKGROUND }}>
      {load && (
        <SafeAreaView>
        <LoaderContainer>
        <ActivityIndicator size={50} color="#0000ff" />
        </LoaderContainer>
        </SafeAreaView>
       
      )}
      {!load && !user && (
        <SafeAreaView style={{ flex:1,justifyContent:'center',alignItems:'center',backgroundColor:Color.BACKGROUND}}>
          <Text style={{color:Color.TEXT}}>Sorry, this page isn't available.</Text>
          <Text style={{ fontSize: 16, margin: 20 }}>
            The link you followed may be broken, or the page may have been removed.{" "}
            <Text style={{ color: 'blue' }} onPress={() => navigation.navigate('Login')}>Go back to Gigs.</Text>
          </Text>
        </SafeAreaView>
      )}
      {!load && user && (  
        <FlatList
          data={gridData}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PostsContainer>
              {item.map((post,index) => (
                <ProfilePosts key={post._id} post={allPosts[index]} posts={allPosts} index={index} setPosts={setPosts}/>
              ))}
            </PostsContainer>
          )}
          keyExtractor={(item, index) => `row-${index}`}
          onEndReached={fetchMorePosts}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={loadPosts}
              onRefresh={handleRefresh}
              tintColor="#0000ff" // Spinner color (iOS)
              colors={['#ff0000', '#00ff00', '#0000ff']} // Spinner colors (Android)
              progressBackgroundColor="#ffff00" // Background color of spinner (Android)
            />
          }
          ListEmptyComponent={() => (
            <NoPostsYetContainer>
              <Text style={{ color: Color.TEXT, fontSize: 60, marginBottom: 20, fontWeight: 'bold' }}>Gigs Picks</Text>
              <NoPostsYetText style={{color:Color.TEXT}}>No posts yet.</NoPostsYetText>
            </NoPostsYetContainer>
          )}
          ListHeaderComponent={() => (

            <ProfileContainer style={{backgroundColor:Color.BACKGROUND}}>
               {/* <SafeAreaView style={styles.safeAreaView}> */}
               {/* {back && 
                  <TouchableOpacity style={{position:'absolute',marginTop:37,marginLeft:10,zIndex:10}} onPress={() => {navigation.goBack()}}>
                         <Icon name={'chevron-back-sharp'} size={30} color={Color.TEXT} />
                  </TouchableOpacity>
                  
                  } */}
                {/* <Text style={[styles.title,{color: Color.TEXT}]}>{username}</Text> */}
            
           
            {/* </SafeAreaView> */}

              <TopLayoutLeft>
                  <TouchableOpacity onPress={() => {navigation.navigate('PreviewFile',{item:{data:_user && isAdmin ? _user.profile_img : user.profile_img, typeFile: "image/png"}})}}>
                      <TopLayoutProfileImg source={{ uri:_user && isAdmin ? `${EXPO_PUBLIC_API_URL}/uploads/${_user.profile_img}` : user ? `${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}` : ''}} />
                  </TouchableOpacity>
                </TopLayoutLeft>
                <View style={{width:'100%',display:'flex',justifyContent:'center',alignItems:'center',marginTop:15}}>
                   <Text style={{fontSize:18,fontWeight:'bold',color:Color.TEXT}}>@{user.fullName}</Text>
                </View>
              {/* Profile Information */}
              <TopLayoutContainer>
                
                <TopLayoutRight>
                  <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={{ color:Color.TEXT,fontWeight:'bold',fontSize:16 }}>{user.posts}</Text>
                    <Text style={{ color:Color.TEXT }}>posts</Text>
                  </View>
                  <TouchableOpacity activeOpacity={.8} onPress={() => {navigation.push('ShowFriends',{
                    Type:'followers',
                    user : isAdmin && _user ? _user : user
                  })}}>
                      <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Text style={{ color:Color.TEXT,fontWeight:'bold',fontSize:16 }}>{isAdmin && _user ? _user.followers_count : user.followers_count}</Text>
                        <Text style={{ color:Color.TEXT }}>followers</Text>
                      </View>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.8} onPress={() => {navigation.push('ShowFriends',{
                    Type:'following',
                    user : isAdmin && _user ? _user : user
                  })}}>
                    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Text style={{ color:Color.TEXT ,fontWeight:'bold',fontSize:16}}>{isAdmin && _user ? _user.following_count : user.following_count}</Text>
                      <Text style={{ color:Color.TEXT }}>following</Text>
                    </View>
              </TouchableOpacity>
                 
                </TopLayoutRight>
              </TopLayoutContainer>
              {!isAdmin ? (
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 15,alignItems:'center',justifyContent:'center'}}>
               {isFollow ?    
                  <TouchableOpacity onPress={() => {handleAddFollowFunction()}} activeOpacity={.7} style={{ backgroundColor: Color.GrayBackground, padding: 12, borderRadius: 8, width: 120, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white' }}>Unfollow</Text>
                  </TouchableOpacity> :    
                  <TouchableOpacity onPress={() => {handleAddFollowFunction()}} activeOpacity={.7} style={{ backgroundColor: Color.PRIMARY_BUTTON_HOVER, padding: 12, borderRadius: 8, width: 120, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white' }}>Follow</Text>
                  </TouchableOpacity>
                  }
                  <TouchableOpacity activeOpacity={.7} style={{ backgroundColor: Color.GrayBackground, padding: 12, borderRadius: 8, width: 120, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                       setPathUserMessage({ username: user.username,profile_img:user.profile_img,_id:user._id, recipient: user });

                       navigation.navigate('Messages');

                  }}>
                    <Text style={{ color: 'white' }}>Message</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 15,alignItems:'center',justifyContent:'center'}}>
                  <TouchableOpacity onPress={() => {navigation.navigate('EditProfile')}} activeOpacity={.7} style={{ backgroundColor: Color.GrayBackground, padding: 12, borderRadius: 8, width: 120, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white' }}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {}} activeOpacity={.7} style={{ backgroundColor: Color.GrayBackground, padding: 12, borderRadius: 8, width: 120, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white' }}>Share Profile</Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity activeOpacity={.7} style={{ backgroundColor: 'rgb(0,149,246)', padding: 12, borderRadius: 8, width: 120, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white' }}> View Archive</Text>
                  </TouchableOpacity> */}
                </View>
              )}
              <BioContainer>
                <BioInfo style={{color:Color.TEXT,fontWeight:'500'}}>{isAdmin && _user ? _user.biography : user.biography}</BioInfo>
              </BioContainer>
             
              {/* Posts and Saved Selector */}
              <LineBreakContainer>
                <Line />
              </LineBreakContainer>

            </ProfileContainer>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor:Color.BACKGROUND,
    paddingHorizontal: 20,
    marginTop: 40,
    position:'relative',
    height:80
},
IconsContainer:{
    marginRight:10,
    marginLeft:15,
    display:"flex",
    flexDirection:"row",
    gap:10,
    position:'absolute',
    right:0,
    marginTop:27
},
title: {
    fontSize: 24,
    fontWeight: 'bold',
    width:'100%',
    textAlign:'center',
    position:'absolute',
    marginTop:37,
    userSelect:'none'
},
iconContainerLeft: {
    padding: 10,
    borderRadius: 20,
},
iconContainerRight: {
    padding: 10,
    borderRadius: 20,
},
})
export default ProfileLayout;

