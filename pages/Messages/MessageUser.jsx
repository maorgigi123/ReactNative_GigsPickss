import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, FlatList, Alert, Keyboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import styled from 'styled-components/native';
import Message from './Message';
import { selectCurrentMessages, selectCurrentTheme, selectCurrentUser } from '../../store/user/user.selector';
import { selectCurrentWs } from '../../store/webSocket/ws.selector';
import { setAddMessage } from '../../store/user/user.action';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {BottomSheetFlatList, BottomSheetFooter, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import ExpoImage from 'expo-image/build/ExpoImage';
import { formatTimestamp } from '../../utils/CalcData';
import { getTheme } from '../Colors/Color';
import { EXPO_PUBLIC_API_URL } from '@env';

const Container = styled.SafeAreaView`
  flex: 1;
`;

const MessageUserContainer = styled.View`
  flex: 1;
`;

const MessageUserInfoTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  border-bottom-width: 1px;
`;

const MessageUserInfoTopContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
`;

const MessageUserInfoTopImg = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
`;

const MessageUserInfoTopName = styled.Text`
  font-weight: bold;
  font-size: 18px;
  margin-left: 6px;
`;

const MessageTopRightIconsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  margin-right: 12px;
  gap: 15px;
`;

const IconsInputMessage = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const IconsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  gap: 10px;
`;

const LabelSend = styled.Text`
  font-weight: bold;
  color: #007bff;
`;

const MessagesContainer = styled.ScrollView`
  flex: 1;
`;

const NoMessagesYet = styled.Text`
  font-size: 24px;
  text-align: center;
  color: white;
`;

const InputContainer = styled.View`
  padding: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-width: 1px;
  border-radius: 22px;
  margin: 12px;
`;

const Input = styled.TextInput`
  flex: 1;
  height: 40px;
  padding: 8px;
  font-size: 16px;
`;

const SmileComments = styled.TouchableOpacity`
  width: 25px;
  height: 25px;
  justify-content: center;
  align-items: center;
`;

const MessageUser = () => {
  const [inputMessage, setInputMessage] = useState('');
  const sendRef = useRef(null);
  const iconsRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params;
  const bottomSheetModelRef = useRef()
  const snapPoints = ['60%']

  const currentUser = useSelector(selectCurrentUser);
  const ws = useSelector(selectCurrentWs);
  const dispatch = useDispatch();
  const messages = useSelector(selectCurrentMessages);
  const scrollToBottomRef = useRef(null);
  const [focusInput,setfocusInput] = useState(false)
  const [photos, setPhotos] = useState([]);
  const [selectedMulti,setSelectedMulti] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedMultiMode, setSelectedMultiMode] = useState(true)
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);
  const [sendMessage , setSendMessage] = useState(false)
  // const iFollowHim = currentUser && currentUser.following.find(follow => follow.following?.username && follow.following.username === user.recipient.username)
  // const heFollowME = currentUser && user.recipient.following.find(follow => follow.following?.username && follow.following.username === currentUser.username)
  // console.log(user.recipient)
  const [iFollowHim,setiFollowHim] = useState(false)
  const [heFollowME,setheFollowME] = useState(false)
  const [load,setLoad] = useState(false)
  const [loadAll,setLoadAll] = useState(false)
  // currentUser.following.some(follow => console.log('you follow on : ',follow.following.username))

  const [loadMoreMessages, setLoadMoreMessages] = useState(false)
  const pageMessages = useRef(0)
  const [LoadMessages, setLoadMessages] = useState(messages)
  const ChatIdx = useRef(0)


  const isDarkMode = useSelector(selectCurrentTheme)
  const Color = getTheme(isDarkMode); // Get the theme based on the mode


  useEffect(() => {
    setLoadMessages(messages)
    // setTimeout(() => {
    //     scrollToBottom();
    //     if(LoadMessages[ChatIdx.current] && LoadMessages[ChatIdx.current].messages.length < 15 && !loadMoreMessages){
    //       setLoadMoreMessages(true)
    //       handleAddMoreMessages()
    //     }
    // },100)
    scrollToBottom();
    if(LoadMessages[ChatIdx.current] && LoadMessages[ChatIdx.current].messages.length < 15 && !loadMoreMessages){
      setLoadMoreMessages(true)
      handleAddMoreMessages()
    }
   
  }, [messages]); //(focusInput === true)

  const handleFetch = async() =>{
    if(load) return
    if(LoadMessages[ChatIdx.current] && LoadMessages[ChatIdx.current].messages.length < 15 ) {
     setLoadAll(true)
    }
    if(!LoadMessages[ChatIdx.current]){
      setLoadAll(true)
    }
    if(LoadMessages[ChatIdx.current] && !loadAll) return
    console.log('3')
    setLoad(true)
    try{
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/check-mutual-following`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAId: currentUser._id,
          playerBId: user._id, // Assuming _user has an _id field
        }),
       });
       const data = await response.json();

      //  console.log(data)
       if(data.error) return

       setiFollowHim(data.playerA_follows_playerB)
       setheFollowME(data.playerB_follows_playerA)
    }
    catch (e) {
      console.log('was error in check-mutual-following ', e)
    }
    finally{
      setLoad(false)
    }
  
  }

  useEffect(() => {
    if(!load){
      console.log('load here')
      handleFetch()
    }
  },[loadAll])

    // Function to get MIME type based on file extension
const getMimeType = (extension) => {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    // Add other extensions as needed
  };
  return mimeTypes[extension.toLowerCase()] || 'image/png'; // Default MIME type
};

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status === 'granted') {
        fetchPhotos();
      }
    })();
  }, []);

  const scrollToBottom = () => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const handleOnChangeInput = (text) => {
    setInputMessage(text); // Update inputMessage state with current text
    if (text.length > 0) {
      sendRef.current.setNativeProps({ style: { display: 'flex' } });
      iconsRef.current.setNativeProps({ style: { display: 'none' } });
    } else {
      sendRef.current.setNativeProps({ style: { display: 'none' } });
      iconsRef.current.setNativeProps({ style: { display: 'flex' } });
    }
  };
  function handlePresentModal(){
    bottomSheetModelRef.current?.present()
    fetchPhotos();
  }
  function handleCloseModal(){
    bottomSheetModelRef.current?.close()
  }

  const generateThumbnail = async (imageUri) => {
    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      return { typeFile: 'image/jpeg', data: `data:image/jpeg;base64,${base64Image}` }; // Adjust type as needed
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return { typeFile: '', data: '' };
    }
  };

  const handleSendMessage = async (sendPhoto = false, photo = '') => {
    if (inputMessage.trim().length === 0 && sendPhoto === false) return; // Ensure message is not empty
    if(photo.length<=0 && inputMessage.replace(/\s+/g, '').length <= 0) return

    if(inputMessage.replace(/\s+/g, '').length > 180) {
      return alert('Oops!\nYour message exceeds the character limit!');
    }
    if(sendMessage) return
    setSendMessage(true)
    // console.log('load send message')
    if (ws.currentWs && ws.currentWs.readyState === WebSocket.OPEN) {

      const date = Date.now();
      const id = photo.length > 0 ? photo : LoadMessages[ChatIdx.current].messages.length
      dispatch(
        setAddMessage({
          sender: currentUser,
          recipient: user,
          profileImg: currentUser.profile_img,
          timestamp: date,
          content: photo.length > 0 ? 'Send A File' : inputMessage,
          image: photo.length>0 ? await generateThumbnail(photo) : {typeFile:'',data:''},
          recipientName : user.username,
          senderName : currentUser.username,
          readBy: [],
          _id:id
        })
      );
      const sendMessage = {
        message: {
          send: currentUser._id,
          recipient: user._id,
          content: inputMessage,
          image: photo.length > 0 ? await generateThumbnail(photo) : {typeFile:'',data:''},
          recipientName: user.username,
          senderName : currentUser.username,
          _id:id,
          imageUrl : `${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}`,
          newMessage: {
            sender: currentUser,
            recipient: user,
            profileImg: currentUser.profile_img,
            content: photo.length > 0 ? 'Send A File' : inputMessage,
            timestamp: date,
            image: photo.length > 0 ?await generateThumbnail(photo) : {typeFile:'',data:''},
          },
        },
      };
      try {
        ws.currentWs.send(JSON.stringify(sendMessage));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.log('WebSocket connection is not open');
    }

    setInputMessage(''); // Clear input message after sending
    sendRef.current.setNativeProps({ style: { display: 'none' } });
    iconsRef.current.setNativeProps({ style: { display: 'flex' } });
    setSendMessage(false)
  };

  const fetchPhotos = async (pageNumber = 1) => {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: ['photo'], // Fetch both photos and videos
      sortBy: [[MediaLibrary.SortBy.creationTime,false]],
      first: 30, // Fetch 50 items at a time
      after: pageNumber > 1 ? photos[photos.length - 1].id : undefined,
    });
  
    const mediaAssets = media.assets;
    const mediaUris = await Promise.all(mediaAssets.map(async (asset) => {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
      const extension = asset.filename.split('.').pop();
      return {
        id: asset.id,
        uri: assetInfo.localUri || assetInfo.uri,
        mediaType: asset.mediaType, // Add mediaType to identify if it's a photo or video
        duration: asset.mediaType === 'video' ? assetInfo.duration  : null ,// Placeholder for duration
        name: asset.filename,
        type: asset.mediaType === 'photo' 
        ? getMimeType(extension) 
        : `video/${extension}` 
      };
    }));
  
    setPhotos((prevPhotos) => [...prevPhotos, ...mediaUris]);
    

    setHasNextPage(media.hasNextPage);
  };

  const loadMorePhotos = () => {
    if (hasNextPage) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchPhotos(nextPage);
        return nextPage;
      });
    }
  };
  const handleAddMulti = (item) => {
    setSelectedMulti((prev) => {
      const isAlreadySelected = prev.find(selected => selected.uri === item.uri);
      if (isAlreadySelected) {
        if(prev.filter(selected => selected.uri !== item.uri).length <= 0){
        }
        return prev.filter(selected => selected.uri !== item.uri);
      } else {
        const newPosition = prev.length + 1;
        if(newPosition > 3){
         Alert.alert('Maximum 3 image every send')
          return [...prev]
        }
        return [...prev, { ...item, position: newPosition }];
      }
    });
  };

  const handleAddMoreMessages = async() => {
    if(loadMoreMessages) return
    if(loadAll) return
    if(LoadMessages[ChatIdx.current].messages.length < 15) {
      setLoadAll(true)
      return
    }

    console.log('handleAddMoreMessages')
    AllId = LoadMessages[ChatIdx.current].messages.map((msg) =>  msg._id)
    
    try{
      const FetchData = await fetch(`${EXPO_PUBLIC_API_URL}/getMoreMessages`,{
        method:'post',
        headers:{'Content-Type' :'application/json'},
        body:JSON.stringify({
          chatId : messages[ChatIdx.current].chatId,
          skipCount : LoadMessages[ChatIdx.current].messages.length,
          AllId : AllId
        })
      })
      const data = await FetchData.json();
      if(data.error){
        setLoadAll(true)
        return
      }
      if (!Array.isArray(data.messages)) {
        return setLoadAll(true);
      }
      if(data.messages.length < 15)
      {
        setLoadAll(true);
      }

       // Append new messages to the existing messages
    setLoadMessages((prev) => {
      const updatedMessages = [...prev];
      if (Array.isArray(data.messages) && updatedMessages.length > 0) {
        updatedMessages[ChatIdx.current].messages = [
          ...data.messages.reverse(),
          ...updatedMessages[ChatIdx.current].messages,
        ];
      }
      return updatedMessages;
    });

      pageMessages.current++;
      setLoadMoreMessages(false);
    }
    catch(e) {
      console.error('handle add more Messages ' ,e)
    }
  }
  
  const handleScrool =(event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
  
  // Check if the list is scrolled to the "top" (which is the end due to inversion)
  const isAtTop = contentOffset.y + layoutMeasurement.height >= contentSize.height - 300;

    if(isAtTop && !loadMoreMessages && !loadAll){
      console.log('top')
      setLoadMoreMessages(true)
      handleAddMoreMessages()
    }
  }

  const renderItem = ({ item, index }) => {
    const isSelected = selectedMulti.some(selected => selected.uri === item.uri);
    const itemPosition = selectedMulti.find(selected => selected.uri === item.uri)?.position;

    return (
      <TouchableOpacity
        onPress={() => [
          setSelectedPhoto(item),
          selectedMultiMode && handleAddMulti(item, index)
        ]}
        style={{ flex: 1 }}
      >
        {item.mediaType === 'photo' ? (
                <View
                style={[
                  styles.videoContainer,
                  // selectedPhoto === item && { backgroundColor: 'white' } // Apply white background if selected
                ]}
                >           
                
                <View style={styles.imageContainer}>
                    <ExpoImage
                      source={{ uri: item.uri }}
                      style={[styles.photo, selectedPhoto === item && { borderColor: 'white', borderWidth: 2 }]} // Highlight border if selected
                    />
                    {isSelected && (
                      <View style={styles.grayOverlay} />
                    )}
                  </View>
            {selectedMultiMode && (
              <View
                style={[
                  styles.SelectMultiCircle,
                  { backgroundColor: isSelected ? 'white' : 'rgba(0, 0, 0, 0.5)' ,borderColor: isSelected?Color.GrayBackground:'white',borderWidth: isSelected ? 2 : 1 } // Change color based on selection
                ]}
              >
       
              </View>
            )}
          </View>
        ) : (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: item.uri }}
              style={[styles.video, selectedPhoto === item && { borderColor: 'white', borderWidth: 2 }]} // Highlight border if selected
              resizeMode="cover"
              useNativeControls
              isMuted={false} // Ensure audio is not muted
              
            />
            {selectedMultiMode && (
              <View
                style={[
                  styles.SelectMultiCircle,
                  { backgroundColor: isSelected ? 'white' : 'rgba(0, 0, 0, 0.5)',borderColor: isSelected?Color.GrayBackground:'white',borderWidth: isSelected ? 2 : 1 } // Change color based on selection
                ]}
              >
            
              </View>
            )}
            <Text style={styles.videoDuration}>
            {item.duration ? `${Math.floor(item.duration / 60)}:${Math.floor(item.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
 
  const flatMessages = useMemo(() => {
    return LoadMessages.reduce((acc, allMessages,allMessagesIdx) => {
      if (
        (allMessages.participants[0].username === user.username &&
          allMessages.participants[1].username === currentUser.username) ||
        (allMessages.participants[1].username === user.username &&
          allMessages.participants[0].username === currentUser.username)
      ) 
      {
        ChatIdx.current = allMessagesIdx;
        return [
          ...acc,
          ...allMessages.messages.map((_message, _idx, allList) => ({
            _message,
            _idx,
            allList,
            chatId: allMessages.chatId,
          })),
        ];
      }
      return acc;
    }, []);
  }, [LoadMessages, user.username, currentUser.username]);
    
  if(!currentUser) return null
  const reversedMessages = useMemo(() => [...flatMessages].reverse(), [flatMessages]);

  return (
    <Container style={{backgroundColor:Color.BACKGROUND}}>
        <MessageUserContainer>
          <MessageUserInfoTop style={{borderBottomColor:Color.TEXT}}>
            <MessageUserInfoTopContainer>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name={'chevron-back-sharp'} size={28} color={Color.TEXT} />
              </TouchableOpacity>
              <TouchableOpacity style={{display:'flex',flexDirection:'row',alignItems:'center'}} onPress={() => {
                navigation.push(user.CommentNavigate, {
                  username: user.username,
                  back:true,
                  ChatNavigate:user.ChatNavigate,
                  CommentNavigate:user.CommentNavigate
                });
              }}>
            <ExpoImage source={{uri:`${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}`}} style={{width:50,height:50,borderRadius:50}}/>
            {/* <ExpoImage source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}`}} /> */}
            <MessageUserInfoTopName style={{color:Color.TEXT}}>{user.username}</MessageUserInfoTopName>
              </TouchableOpacity>
            
            </MessageUserInfoTopContainer>
            <MessageTopRightIconsContainer>
              {/* <TouchableOpacity onPress={() => {}}>
                <FontAwesome name={'info'} size={20} color={Color.TEXT} />
              </TouchableOpacity> */}
            </MessageTopRightIconsContainer>
          </MessageUserInfoTop>

          {/* <ScrollView
          style={{flex:1}}
          // onScroll={handleScrool}
          // scrollEventThrottle={400} // Throttle the scroll events for performance
           ref={scrollToBottomRef}>
            {loadAll &&
                    <View style={{width:'100%',display:'flex',alignItems:'center',marginTop:20,marginBottom:40}}>
                        <ExpoImage source={{uri:`${process.env.EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}`}} style={{width:100,height:100,borderRadius:50}}/>
                        <Text style={{color:Color.TEXT,fontSize:20,fontWeight:500,marginTop:10}}>{user.username}</Text>
                        <Text style={{color:Color.TEXT,fontSize:12,fontWeight:500,marginTop:10}}>{iFollowHim && heFollowME ? 'You both Follow each other': iFollowHim ? 'You Follow This user' : heFollowME ? 'follow you'  : 'you both dont follow each others' }</Text>
                    </View>
            } 
            {(
              LoadMessages.map((allMessages,_idx) => {
                if (
                  (allMessages.participants[0].username === user.username &&
                    allMessages.participants[1].username === currentUser.username) ||
                  (allMessages.participants[1].username === user.username &&
                    allMessages.participants[0].username === currentUser.username)
                ) {
                  ChatIdx.current = _idx;
                  // .slice(allMessages.messages.length > (pageLimit * pageMessages) ? allMessages.messages.length-(pageLimit * pageMessages) : 0,allMessages.messages.length)
                  return allMessages.messages.map((_message, _idx,allList) => (
                    <Message
                      key={_idx}
                      message={_message}
                      profile_img={_message.sender.profile_img ? _message.sender.profile_img : _message.profileImg}
                      allList={allList}
                      index ={_idx}
                      chatId = {allMessages.chatId}
                    />
                  ));
                } else {
                  return null;
                }
              })
            )}
          </ScrollView> */}

 <FlatList
      inverted
      data={reversedMessages}
      onScroll={handleScrool}
      scrollEventThrottle={400} // Throttle the scroll events for performance
      ref={scrollToBottomRef}
      keyExtractor={(item, index) => item._message._id} // Ensure a unique key
      ListFooterComponent={memo(() =>
         (loadAll) && (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
            <ExpoImage
              key={`${user.profile_img}_profileImg`} // Ensure unique key
              source={{ uri: `${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}` }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <Text style={{ color: Color.TEXT, fontSize: 20, fontWeight: '500', marginTop: 10 }}>
              {user.username}
            </Text>
            <Text style={{ color: Color.TEXT, fontSize: 12, fontWeight: '500', marginTop: 10 }}>
              {iFollowHim && heFollowME
                ? 'You both Follow each other'
                : iFollowHim
                ? 'You Follow This user'
                : heFollowME
                ? 'Follows you'
                : 'You both don’t follow each other'}
            </Text>
          </View>
        ))
      }
      renderItem={({ item }) => (
        <Message
          key={item._message._id}
          message={item._message}
          profile_img={item._message.sender.profile_img ? item._message.sender.profile_img : item.profileImg}
          allList={item.allList}
          index={item._idx}
          chatId={item.chatId}
        />
      )}
    />

          <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 40}>
          <InputContainer style={{ borderColor:Color.TEXT,backgroundColor:Color.SECONDARY_BACKGROUND}}>
            <SmileComments>
              <ExpoImage style={{width:40,height:40,borderRadius:500}} source={{ uri: `${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}` }}/>
            </SmileComments>
            <Input
              style={{marginLeft:10,color:Color.TEXT}}
              onPress={() => setfocusInput((prev) => !prev)}
              value={inputMessage}
              onChangeText={handleOnChangeInput}
              placeholder={`send message to ${user.username}`}
              multiline
              placeholderTextColor={Color.TEXT}
              keyboardAppearance={isDarkMode ? 'dark' : 'default'} // Set keyboard appearance to dark
            />
            <IconsInputMessage>
              <TouchableOpacity  onPress={handleSendMessage}>
              <View  ref={sendRef} style={{backgroundColor:Color.PRIMARY_BUTTON,padding:12,borderRadius:50,width:50,height:40,display:'flex',justifyContent:'center',alignItems:'center',display:'none'}}>
                  <FontAwesome name='send-o' size={20} color={Color.WHITE}/>
              </View>
              </TouchableOpacity>

            
              <IconsContainer ref={iconsRef}>
                <TouchableOpacity onPress={() => {handlePresentModal(); Keyboard.dismiss();setSelectedMulti([])}}>
                  <Icon name={'image'} size={28} color={Color.TEXT} />
                </TouchableOpacity>
              </IconsContainer>
            </IconsInputMessage>
          </InputContainer>
          </KeyboardAvoidingView>
        </MessageUserContainer>
        <BottomSheetModal
        onDismiss={() => {setPhotos([])}}
                  ref={bottomSheetModelRef}
                  index={0}
                  snapPoints={snapPoints}
                  backgroundStyle={{borderRadius:24,backgroundColor:Color.SECONDARY_BACKGROUND}}
                  handleIndicatorStyle={{color:Color.TEXT}}
                  footerComponent={(props) => (
                    <BottomSheetFooter {...props}>
                      <ScrollView horizontal style={{display:'flex',flexDirection:'row',padding:24,backgroundColor:Color.SECONDARY_BACKGROUND,position:'relative',height:90}}>
                      {selectedMulti.map(photo => <ExpoImage key={photo.name} source={{uri:photo.uri}} style={{height:60,width:40,marginTop:-20,marginLeft:-20,marginRight:25}} />)}
                      </ScrollView>
                      <TouchableOpacity 
                      onPress={() => [
                        selectedMulti.map((data) => {
                          handleSendMessage(true,data.uri)
                        }),
                        handleCloseModal()
                      ]}
                      activeOpacity={.7} style={{height:50,width:50,backgroundColor:Color.PRIMARY_BUTTON,borderRadius:24,position:'absolute',right:10,top:10,display:'flex',justifyContent:'center',alignItems:'center'}}>
                        <Feather name="send" size={27} color={Color.WHITE} />
                      </TouchableOpacity>
                    </BottomSheetFooter>
                   
                  )}
                  keyboardBehavior='extend'
                  keyboardBlurBehavior='restore'
                  
                  >
                  <View>
                    <Text style={{fontWeight:'bold',fontSize:20,color:Color.TEXT,textAlign:'center',marginBottom:10}}>Photos</Text>
                  </View>
                  <View style={[styles.container,{backgroundColor:Color.SECONDARY_BACKGROUND}]}>
                    <BottomSheetFlatList
                          data={photos}
                          renderItem={renderItem}
                          keyExtractor={(item, index) => `${item.id}-${index}`}
                          numColumns={4}
                          columnWrapperStyle={styles.FlatStyle}
                          onEndReached={loadMorePhotos}
                          onEndReachedThreshold={2}
                        />
                    </View>
                
           
                </BottomSheetModal>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photo: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    margin:5,
  },
  FlatStyle: {
    gap: 5,
  },
  videoContainer: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    margin:5
  },
  videoDuration: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
  },
  SelectMultiCircle:{
    position: 'absolute',
    top: 5,
    right: 5,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    borderRadius: 50,
    height: 20, // Adjust size if needed
    width: 20,  // Adjust size if needed
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImageContainer:{

  },
  selectedPhoto:{
    width:'100%',
    height:350,
    resizeMode: 'contain',
  },
  topStyle:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    margin:5,
  },
  shrinkContainer:{
    position:'absolute',
    bottom:5,
    left:10
  },
  shirkCircle:{
    padding:5,
    backgroundColor:Color.GrayBackground,
    borderRadius:50,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  SelectMultiText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 8, // Adjust size if needed
    textAlign:'center'
  },
  pickerInput: {
    fontSize: 16,
    borderRadius: 4,
    color: Color.WHITE,
    paddingRight: 5,
    paddingLeft:10
  },
  pickerIconContainer: {
    display:'flex',
    flexDirection:'row'
  },

});
export default MessageUser;
