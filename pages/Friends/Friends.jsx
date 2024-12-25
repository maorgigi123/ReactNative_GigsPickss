import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { selectCurrentTheme, selectCurrentUser } from '../../store/user/user.selector'
import ExpoImage from 'expo-image/build/ExpoImage'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { UserContext } from '../../store/userContext'
import { getTheme } from '../Colors/Color'
import { EXPO_PUBLIC_API_URL } from '@env';
export default function Friends() {
    const CurrentUser = useSelector(selectCurrentUser)
    const route = useRoute()
    const {Type,user} = route.params;

    const [load,setLoad] = useState(false)
    const [showLoadingBar, setLoadingBar] = useState(false);
    const [friends, setFriends] = useState([])

    const navigation = useNavigation()

    const { setPathUserMessage } = useContext(UserContext);
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode

    const handleClickFollow = async (_user) => {
        try {
            // Example of making an API call to follow/unfollow the user
            const response = await fetch(`${EXPO_PUBLIC_API_URL}/AddFollow`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    follower: CurrentUser._id,
                    following: _user._id, // Assuming _user has an _id field
                }),
            });
            const data = await response.json();
            if(data.message === 'Added follow'){
                setFriends((prev) => {
                    const updatedFriends = prev.map((friend) =>{
                        console.log('user id', _user._id)
                        const data = Type === 'following' ? friend?.following : friend?.follower;
                        console.log('freinds id' , data._id)

                        return data._id === _user._id ? { ...friend, isFriend: true } : friend
                    }
                    );
                    return updatedFriends;
                });
              }
              else if(data.message === 'Removed follow'){
                setFriends((prev) => {
                    console.log('Previous friends:', prev);
                    const updatedFriends = prev.map((friend) =>{
                        console.log('user id', _user._id)
                        const data = Type === 'following' ? friend?.following : friend?.follower;
                        console.log('freinds id' , data._id)

                        return data._id === _user._id ? { ...friend, isFriend: true } : friend
                    }
                    );
                    console.log('Updated friends:', updatedFriends);
                    return updatedFriends;
                });
              }
              else{
                console.log('was error while following')
              }
        } catch (error) {
            console.error("Error following/unfollowing user:", error);
        }
    };

    const navigateToMessage = (data) => {
        // navigation.push('ProfileMain', {
        //     username: data.username,
        //     back:true,
        // }); 
        setPathUserMessage({ username: data.username,profile_img:data.profile_img,_id:data._id, recipient: data });

        navigation.navigate('Messages');
    }
    const handleGetMoreFriends = async() =>{
        if (load) return;
        setLoad(true);
        setLoadingBar(true)
    
        const type = Type === 'following' ? 'getMoreFollowing' : 'getMoreFollowers';
        try {
            const response = await fetch(`${EXPO_PUBLIC_API_URL}/${type}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    CurrentUser : CurrentUser._id,
                    skip: friends.length
                })
            });
    
            const data = await response.json();
            if(data.error) return
            // console.log( data.length +  ' length')
            if(Array.isArray(data) && data.length >=15 ){
                setLoad(false); 
            }
            if (Array.isArray(data) && data.length > 0 ) {
                setFriends((prev) => [...prev, ...data]);
            } 
            // else {
            //     console.error("Unexpected data format:", data);
            // }
        } catch (error) {
            console.error("Error fetching friends:", error);
            setLoad(false); 
        }
        finally{
            setLoadingBar(false)
        }
    }
    useEffect(() => {
        handleGetMoreFriends()

    },[])
    const FriendsComponent = ({_user}) => {
        const data = Type === 'following' ? _user?.following : _user?.follower;
        if(!data) return  

        return (
            <View style={{width:'100%',height:60,backgroundColor:Color.BACKGROUND,display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                <View style={{display:'flex',flexDirection:'row',marginLeft:10,gap:10,alignItems:'center'}}>
                    <ExpoImage source={{uri:`${EXPO_PUBLIC_API_URL}/uploads/${data.profile_img}`}} style={{width:55,height:55,borderRadius:50}}/>
                    <View>
                    <Text style={{color:Color.TEXT,fontSize:18,fontWeight:'bold'}}>{data.username}</Text>
                    <Text style={{color:Color.TEXT,fontSize:16}}>{data.fullName}</Text>
                </View>
                </View>
                <View style={{display:'flex',flexDirection:'row',marginRight:10,justifyContent:'center',alignItems:'center'}}>
                    {data._id !== CurrentUser._id &&
                        <TouchableOpacity activeOpacity={.8} onPress={() => {!_user.isFriend ? handleClickFollow(data) :navigateToMessage(data)}}>
                            <View style={{width:120,height:40,backgroundColor:_user.isFriend ? Color.GrayBackground :Color.PRIMARY_BUTTON,borderRadius:8,display:'flex',justifyContent:'center',alignItems:'center'}}>
                                <Text style={{color:Color.WHITE,fontSize:14,fontWeight:'400'}}>{_user.isFriend ? 'Message' : 'Follow'}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                
                   
                </View>
            </View>
        )
    }
 return (
     <View style={{ flex: 1,backgroundColor:Color.BACKGROUND }}>
        {friends.length <= 0 && showLoadingBar === false ? 
        <View style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:18,fontWeight:'500'}}>No {Type} available</Text>
        </View>

        :
        <FlatList
             data={friends}
             keyExtractor={(item,index) => `${item._id}-${index}`} // Replace with a unique key like `item.id` if available
             renderItem={({ item }) => <FriendsComponent _user={item} />}
             ItemSeparatorComponent={() => <View style={{ height: 15 }} />} // Adjust the height as needed
             ListHeaderComponent={() => <View style={{ height: 20 }} />} // Adjust the height as needed
             ListFooterComponent={showLoadingBar ? (
                <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator size={50} color="#0000ff" />
                </View>
            ) : null} // Show loading indicator
             onEndReached={handleGetMoreFriends} // Load more friends when reaching the end
             onEndReachedThreshold={.5} // Adjust threshold as needed
        />       
        }
         
     </View>
 );
}