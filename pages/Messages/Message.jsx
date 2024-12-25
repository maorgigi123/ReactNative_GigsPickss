import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentTheme, selectCurrentUnreadMessages, selectCurrentUser } from '../../store/user/user.selector';
import { formatTimestamp } from '../../utils/CalcData';
import {AntDesign,Entypo,FontAwesome} from 'react-native-vector-icons'
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { setAddMessage, setCurrentMessages, SetUnreadMessages, UPDATE_READ_BY_MESSAGE } from '../../store/user/user.action';
import { selectCurrentWs } from '../../store/webSocket/ws.selector';
import {Image} from 'expo-image'
import ExpoImage from 'expo-image/build/ExpoImage';
import { Swipeable } from 'react-native-gesture-handler';
import { getTheme } from '../Colors/Color';
import { EXPO_PUBLIC_API_URL } from '@env';
const Message = ({ message, profile_img, allList,index,chatId}) => {
  const user = useSelector(selectCurrentUser);
  const ws = useSelector(selectCurrentWs);

  const navigation = useNavigation()
  const currentTimestamp = new Date(message.timestamp);
  const previousMessage = index > 0 ? allList[index - 1] : null;
  const NextMessage = index >= 0 ? allList[index + 1] : null;

  const previousTimestamp = previousMessage ? new Date(previousMessage.timestamp) : null;
  const showTimestamp = !previousTimestamp || (currentTimestamp - previousTimestamp) >= 3600000; // 1 hour in milliseconds
  const showSpace = NextMessage && (NextMessage.sender.username !== message.sender.username); // 1 hour in milliseconds
  const isUser = user && (message.sender.username === user.username)
  const isRead = message.read

  const [read,setRead] = useState(isRead)

  const dispatch = useDispatch();
  const UnreadMessages = useSelector(selectCurrentUnreadMessages)

  const isDarkMode = useSelector(selectCurrentTheme)
  const Color = getTheme(isDarkMode); // Get the theme based on the mode
  const isValidId = /^[a-f\d]{24}$/i.test(message._id);

  const rightSwipe = () => {
    if(isUser) return
    return (
      <View style={{backgroundColor:Color.PRIMARY_BUTTON,height:40,width:60,display:'flex',alignItems:'center',justifyContent:'center'}}>
           <View style={{backgroundColor:Color.PRIMARY_BUTTON,width:30,height:30,borderRadius:50,display:'flex',justifyContent:'center',alignItems:'center',marginHorizontal:10}}>
                <FontAwesome name={'send'} color={Color.WHITE} size={18}/>
              </View> 
      </View>
    )
    
  }
  const leftSwipe = () => {
    if(!isUser) return 
    return (
      <View style={{backgroundColor:Color.PRIMARY_BUTTON,height:'90%',width:60,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {read  ? <View style={{backgroundColor:Color.PRIMARY_BUTTON,width:30,height:30,borderRadius:50,display:'flex',justifyContent:'center',alignItems:'center'}}>
                <AntDesign name={'eye'} color={Color.WHITE} size={18}/>
                  </View> :
                  <View style={{backgroundColor:Color.PRIMARY_BUTTON,width:30,height:30,borderRadius:50,display:'flex',justifyContent:'center',alignItems:'center'}}>
                  <Entypo name={'eye-with-line'} color={Color.WHITE} size={18}/>
                    </View>
                }
      </View>
    )
  }
  const handleRead = async() => {
    try {
      const fetchMessages = await fetch(`${EXPO_PUBLIC_API_URL}/readMessage`,{
        method:'POST',
        headers:{'Content-Type' :'application/json'},
        body:JSON.stringify({
          MessageId:message._id,
          userId: user._id
        })
       })
    
    const data = await fetchMessages.json();

    ws.currentWs.send(JSON.stringify({type:'updateRead', payload:{data} , username:message.sender.username,recipient:user.username}));
    setRead(true)
      
   } catch (e) {
     console.log('error while read message');
    }
  }
  const removeUnreadMessage = () => {
    const existingMessageIndex = UnreadMessages.findIndex(msg => msg.chatId === chatId);
    
    if (existingMessageIndex !== -1) {
        // אם יש אובייקט עם אותו chatId, תעדכן את הספירה של ההודעות שלא נקראו
        UnreadMessages[existingMessageIndex].Unread -= 1;
        console.log('read message')
        
        // אם מספר ההודעות שלא נקראו הוא 0, תסיר את האובייקט מהרשימה
        if (UnreadMessages[existingMessageIndex].Unread === 0) {
            UnreadMessages.splice(existingMessageIndex, 1);
            console.log('remove message')
        }
    }
    // עדכן את המצב עם הרשימה המעודכנת
    dispatch(SetUnreadMessages([...UnreadMessages]));
};
  useEffect(() => {
    setRead(message.read)
    if(!read && !message.read && message._id && message.sender.username !== user.username ){
      console.log('update read')
      // console.log(message.content , ' ',user.username)
      removeUnreadMessage()
        handleRead()
      // console.log('read This Message id,',message._id)
    }
  },[message])
  const handleReplay = () => {
    // This function will be triggered when the right swipe is completed
    if (!isUser) {
      console.log('hey')
    }
  };
  if (!user) return null;
  return (
        <View style={styles.messageContainer}>
              {showTimestamp && <Text style={[styles.timeSend,{color:Color.TEXT,}]}>{formatTimestamp(message.timestamp)}</Text> }
              {/* <Swipeable
                  renderRightActions={leftSwipe}
                  renderLeftActions={rightSwipe}
                  onSwipeableOpen={(direction) => {
                    if (direction === 'left') {
                      handleReplay();
                    }
                  }}
                > */}

              <View style={[
                [styles.messageContainerItem, { backgroundColor:Color.BACKGROUND} ],
                {
                  flexDirection: user && user.username === (message.sender.username ? message.sender.username : message.sender)
                    ? 'row-reverse'
                    : 'row',
                },
              ]}>
                  {/* {!read && (!isValidId || allList.length > parseInt(message._id, 16)) && console.log(message._id)} */}

                  {!read && (!isValidId || allList.length > parseInt(message._id, 16)) && (
                      <View style={{width:10,height:10,backgroundColor:Color.PRIMARY_BUTTON_HOVER,borderRadius:50}}>
                      </View>
                  )}
              <ExpoImage
                  style={styles.profileImg}
                  source={{
                    uri: message.sender.profile_img ? `${EXPO_PUBLIC_API_URL}/uploads/${message.sender.profile_img}` : `${EXPO_PUBLIC_API_URL}/uploads/${profile_img}`,
                  }}
                />
                
            
                {message.image.typeFile ?

                <TouchableOpacity onPress={() => {navigation.navigate('PreviewFile',{item:message.image})}}>
                  {message.image.data.startsWith('Messages') 
                  ? 
                  <ExpoImage 
                    source={{ uri:`${EXPO_PUBLIC_API_URL}/uploads/${message.image.data}`}} 
                    style={{width:200,height:200,borderRadius:12}}
                  /> 
                  :
                  <ExpoImage source={{uri:message.image.data}} style={{width:200,height:200,borderRadius:12}} />}
                  </TouchableOpacity> : 
                <View style={[styles.messageContent,{    backgroundColor: isUser ? '#830EF7' : '#1F1F1F'}]}>
                  <Text style={{color:Color.WHITE,fontSize:16,fontWeight:'450'}}>{message.content}</Text>
                  </View>
                  }
                 {!read && isValidId && allList.length <= parseInt(message._id, 16) && (
                      <Text style={{ color: Color.TEXT, fontSize: 16 }}>sent</Text>
                  )}


              </View>
              {/* </Swipeable> */}
              {showSpace && 
              <View style={{marginBottom:20}}></View>
              }
      </View>
    
    
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 4,
    backgroundColor:Color.BACKGROUND
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginLeft: 20,
    marginRight: 20,
  },
  timeSend: {
    marginTop: 10,
    width: '100%',
    textAlign:'center',
    marginBottom:10
  },
  messageContainerItem: {
    alignItems: 'center',
  },
  messageContent: {
    color:'white',
    fontWeight:'bold',
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    maxWidth:'70%'
  },
});

export default Message;
