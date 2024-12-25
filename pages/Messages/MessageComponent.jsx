import React, { useContext, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux'; // Assuming you use Redux for state management
import { useNavigation } from '@react-navigation/native'; // React Navigation hook
import styled from 'styled-components/native'; // styled-components for React Native
import {  selectCurrentMessages, selectCurrentTheme, selectCurrentUnreadMessages, selectCurrentUser } from '../../store/user/user.selector'; // Redux selector
import { CalcData, ShortCalcData } from '../../utils/CalcData';
import {Entypo,Ionicons,AntDesign} from 'react-native-vector-icons'
import { UserContext } from '../../store/userContext';
import {Image} from 'expo-image'
import ExpoImage from 'expo-image/build/ExpoImage';
import { Swipeable } from 'react-native-gesture-handler';
import { getTheme } from '../Colors/Color';
import { EXPO_PUBLIC_API_URL } from '@env';
// Styled-components for React Native
const MessageContainer = styled.TouchableOpacity`
  margin-top: 12px;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  cursor: pointer;
`;

const ProfileImage = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
`;

const ProfileUserInfoContainer = styled.View`
  padding-left: 12px;
`;

const ProfileName = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: #c4bbbb;
`;

const ProfileLastMessageContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
  max-width: 85%;
  max-height: 40px;
`;

const ProfileLastMessage = styled.Text`
  color: #898181;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProfileLastTimeMessage = styled.Text`
  color: #898181;
  font-size: 14px;
  margin-left: 5px;
`;

const MessageComponent = ({ data,userPath}) => {
  const navigation = useNavigation();
  const user = useSelector(selectCurrentUser); // Example: Fetching current user from Redux state
  const messages = useSelector(selectCurrentMessages)
  const recipient = user && data.participants.find(_user => _user.username !== user.username);
  const sender = user && data.participants.find(_user => _user.username === user.username);
  const { setPathUserMessage } = useContext(UserContext);
  const UnreadMessages = useSelector(selectCurrentUnreadMessages)
  const isDarkMode = useSelector(selectCurrentTheme)
  const Color = getTheme(isDarkMode); // Get the theme based on the mode
  const leftSwipe = () => {
    return (
      <View style={{backgroundColor:'#fff',height:80,marginTop:12}}>
        <TouchableOpacity style={{width:80,height:80,backgroundColor:'red',display:'flex',justifyContent:'center',alignItems:'center'}}>
            <Ionicons name={'trash'} color={'white'} size={30}/>
        </TouchableOpacity>
      </View>
    )
  }
  const rightSwipe = () => {
    return (
      <View style={{backgroundColor:'#fff',height:80,marginTop:12}}>
      <TouchableOpacity style={{width:80,height:80,backgroundColor:Color.PRIMARY_BUTTON,display:'flex',justifyContent:'center',alignItems:'center'}}>
          <AntDesign style={{marginBottom:10}} name={'pushpin'} color={'white'} size={30}/>
      </TouchableOpacity>
    </View>
    )
  }
  const handleNavigateToChat = () => {
    navigation.navigate('ChatScreen', {
        username: recipient.username,
        recipient : recipient,
        profile_img: recipient.profile_img,
        _id: recipient._id,
        messages: data.messages,
        CommentNavigate:'Profile',
    });
  };
  const isSender = user && data.messages[data.messages.length - 1].sender.username === user.username;
  const read = data.messages[data.messages.length - 1].read;
  useEffect(() => {
    if(!user) return
    if (userPath && userPath.username === recipient?.username) {
      handleNavigateToChat();
      setPathUserMessage({ username: '' });
    }
  }, [userPath, recipient, setPathUserMessage,user]);

  if (!user) return null;

  function getUnreadCountByChatId(chatId) {
    const chat = UnreadMessages.find(msg => msg.chatId === chatId);
    return chat ? chat.Unread : 0;
}
  return (
    <Swipeable renderLeftActions={leftSwipe} renderRightActions={rightSwipe}>
      <MessageContainer onPress={handleNavigateToChat} activeOpacity={1} style={{backgroundColor:Color.BACKGROUND}}>
        <ExpoImage source={{uri:`${EXPO_PUBLIC_API_URL}/uploads/${recipient.profile_img}`}} style={{width:55,height:55,borderRadius:60}}/>
        {/* <ProfileImage source={{ uri:recipient && `${process.env.EXPO_PUBLIC_API_URL}/uploads/${recipient.profile_img}` }} /> */}
        <ProfileUserInfoContainer>
          <ProfileName>{recipient && recipient.username}</ProfileName>
          <ProfileLastMessageContainer>
            <ProfileLastMessage numberOfLines={2}>{data.messages && data.messages.length > 0 && data.messages[data.messages.length - 1].sender.username === user.username && 'You: '}{(data.messages[data.messages.length - 1].image.data.length > 0) ? 'Send A File' : data.messages[data.messages.length - 1].content}</ProfileLastMessage>
            <ProfileLastTimeMessage>{data.messages && data.messages.length > 0 && `.${ShortCalcData(data.messages[data.messages.length - 1].timestamp)}`}</ProfileLastTimeMessage>
          </ProfileLastMessageContainer>
        </ProfileUserInfoContainer>
        {!isSender && getUnreadCountByChatId(data.chatId) > 0 && <View style={{position:'absolute',right:10, marginHorizontal:10,width:23,height:23,backgroundColor:Color.PRIMARY_BUTTON,borderRadius:50,display:'flex',justifyContent:'center',alignItems:'center'}}><Text style={{color:Color.WHITE,fontWeight:'bold',fontSize:12}}>{getUnreadCountByChatId(data.chatId)}</Text></View> }
      </MessageContainer>
    </Swipeable>
  );
};

export default MessageComponent;
