import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, StyleSheet, TextInput, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { Video } from 'expo-av';
import { Feather } from 'react-native-vector-icons'; // Import your preferred icon library
import * as VideoThumbnails from 'expo-video-thumbnails'
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentTheme, selectCurrentUser, selectLoadPost } from '../store/user/user.selector';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { setLoadPost } from '../store/user/user.action';
import { selectCurrentWs } from '../store/webSocket/ws.selector';
import ExpoImage from 'expo-image/build/ExpoImage';
import { getTheme } from './Colors/Color';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window'); // Get device width for styling

const AddPots = ({navigation}) => {
    const route = useRoute();
    const user = useSelector(selectCurrentUser)
    const selectedMulti = route.params.AllPosts;
    const videoCover = route.params.videoCover;
    const setVideoCover = route.params.setVideoCover;

    const [caption, setCaption] = useState('');
    const [tags, setTags] = useState([]);
    const [tagValue, setTagValue] = useState(''); // State for the TextInput value
    const [thumbnail, setThumbnail] = React.useState([]);
    const dispatch = useDispatch()
    const LoadForPost = useSelector(selectLoadPost)

    const [isLoadPost,setIsLoadPost] = useState(LoadForPost)
    const ws = useSelector(selectCurrentWs);
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
    const [selectedPicks,setSelectedPicks] = useState(true)
    const [allImages, setAllImages] = useState(true)
    useEffect(() => {
        selectedMulti.map(photo => {
            if(photo.mediaType !== 'photo'){
                setAllImages(false)
                setSelectedPicks(false)
            }
        })
        if(selectedMulti.length <= 1 || selectedMulti.length >=7){
            setSelectedPicks(false)
        }
    },[selectedMulti])
    useEffect(() => {
        
      setIsLoadPost(LoadForPost)
    },[LoadForPost])

    const onChangeCaption = (text) => {
        setCaption(text);
    };

    const generateThumbnail = async () => {
        let selectedFiles = []
        try {
            const updatedThumbnails = await Promise.all(selectedMulti.map(async (post,index) => {
                if (post.mediaType === 'video') {
                    try {
                              // Generate thumbnail
                        const { uri } = await VideoThumbnails.getThumbnailAsync(post.uri, { time: 15000 });
                        const base64Video = await FileSystem.readAsStringAsync(post.uri, { encoding: FileSystem.EncodingType.Base64 });
                        
                        // Instead of converting the whole video to base64, consider handling it differently
                        // For example, just process a portion of the video or handle it as a file path
                        const base64Thumbnail =  await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                        // Push only necessary data to selectedFiles
                        selectedFiles.push({ name: post.name, type: post.type, size: 0, data: `data:${post.type};base64,${base64Video}`,thumbnail:`data:image/png;base64,${base64Thumbnail}` });
                        
    
                    } catch (e) {
                        console.error('Error generating video thumbnail:', e);
                        return null;
                    }
                }  else {
                try {
                // Convert image to base64
                const base64Image = await FileSystem.readAsStringAsync(post.uri, { encoding: FileSystem.EncodingType.Base64 });
                selectedFiles.push({ name: post.name, type: post.type, size: 0, data: `data:${post.type};base64,${base64Image}`,thumbnail:`data:image/png;base64,${base64Image}` })
                } catch (e) {
                console.error('Error converting image to base64:', e);
                return null;
                }
            }
            }));

            return selectedFiles; // Filter out null results
        } catch (error) {
            console.error('Error in generateThumbnail:', error);
            throw error;
        }
        };


const fetchData = async () => {
    const selectedFiles = await generateThumbnail();
    dispatch(setLoadPost({ cover: videoCover ? videoCover : selectedFiles[0].thumbnail, status: true }));
    navigation.navigate('FeedMain');
        // Use setTimeout to simulate background task
        try {
            if (ws.currentWs && ws.currentWs.readyState === WebSocket.OPEN) 
                ws.currentWs.send(JSON.stringify({type:'UploadPost', payload:{typePost : selectedPicks ? 'picks' : 'post' , userId:user._id,username: user.username,content: caption,
                    tags: tags,images: selectedFiles,cover: videoCover ? videoCover : selectedFiles[0].thumbnail,folder: user.username,}}));
            // const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/uploadPost`, {
            // userId: user._id,
            // username: user.username,
            // content: caption,
            // tags: tags,
            // images: selectedFiles,
            // cover: videoCover ? videoCover : selectedFiles[0].thumbnail,
            // folder: user.username,
            // });

            setVideoCover(null);
            console.log('File uploaded successfully');
            // dispatch(setLoadPost({ cover: '', status: false }));
            navigation.popToTop();
        } catch (e) {
        console.log(e);
        dispatch(setLoadPost({ cover: '', status: false }));
        Alert.alert('Error While Upload.');
        }
}
    
const OnClickSharePost = () => {
    if (caption.length <= 1) {
      return Alert.alert('Cant upload empty posts');
    }

    if (selectedMulti.length <= 0) return Alert.alert('Cant upload empty posts');

    fetchData()
  };



    const RemoveTag = (index) => {
        const updatedTags = tags.filter((_, i) => i !== index);
        setTags(updatedTags);
    };

    const handleAddTag = () => {
        if (tags.length >= 6) {
            return Alert.alert('No more than 6 tags are allowed');
        }
        if (tagValue.length > 10) {
            return Alert.alert('A tag with more than 10 characters is not allowed');
        }
        if (tagValue.length < 2) {
            return Alert.alert('Tag should be at least 2 characters');
        }
        if (tagValue.trim() !== '') {
            setTags([...tags, tagValue.trim()]);
            setTagValue(''); // Clear the TextInput value
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.mediaContainer} onPress={() => {}}>
            {item.mediaType === 'photo' ? (
                <ExpoImage
                    source={{ uri: item.uri }}
                    style={styles.selectedPhoto}
                    resizeMode={'cover'}
                />
            ) : (
                <Video
                    source={{ uri: item.uri }}
                    style={styles.selectedPhoto}
                    isLooping
                    shouldPlay
                    isMuted={true}
                    resizeMode={'cover'}
                />
            )}
        </TouchableOpacity>
    );

    const renderTag = ({ item, index }) => (
        <View key={index} style={styles.TagContainer}>
            <Text style={styles.Tag}>{item}</Text>
            <TouchableOpacity style={styles.TagClose} onPress={() => RemoveTag(index)} activeOpacity={0.8}>
                <Feather name={'x'} size={14} color={Color.PRIMARY_BUTTON_HOVER} />
            </TouchableOpacity>
        </View>
    );
    if(isLoadPost && isLoadPost.status){
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:Color.BACKGROUND}}>
          <ActivityIndicator size={50} color="#0000ff" />

          <Text style={{color:Color.PRIMARY_BUTTON,fontSize:20}}>Wait For The Post Be Uploaded</Text>
        </View>
      )
    }
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: Color.BACKGROUND }}
            >
                     <View style={{ flex: 1 }}>
                    <View style={styles.list}>
                        <FlatList
                            data={selectedMulti}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal
                            pagingEnabled
                            snapToInterval={width - (width * 0.15)} // Width of each item + margin
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                    <View style={styles.TextInputContainer}>
                        <TextInput
                            placeholder='Write a caption'
                            style={[styles.Textinput,{color:Color.TEXT}]}
                            placeholderTextColor={Color.TEXT}
                            onChangeText={onChangeCaption}
                            multiline
                            keyboardType='twitter'
                            keyboardAppearance='dark'
                        />
                        <Text style={styles.charCount}>
                            {caption.length}/1000
                        </Text>
                    </View>
                    <View style={{width:'100%',display:'flex',flexDirection:'row',padding:12,gap:12}}>
                        <TouchableOpacity style={{flex:1,backgroundColor:selectedPicks ? Color.PRIMARY_BUTTON : Color.GrayBackground ,padding:12}} onPress={() => {
                              if(allImages === false){
                                Toast.show({
                                    type: 'error', // Can be 'success', 'error', 'info'
                                    text1: 'Invalid Selection',
                                    text2: 'You can make a picks post only with images.', // The subtitle or additional message.
                                    visibilityTime:1000,
                                  });
                                  return;
                              }
                              if(selectedMulti.length <= 1 || selectedMulti.length >=7){
                                Toast.show({
                                    type: 'error', // Can be 'success', 'error', 'info'
                                    text1: 'Invalid Selection',
                                    text2: 'You can select between 2 and 6 images only.',
                                    visibilityTime:1000,
                                  });
                                  return;
                            }
                            setSelectedPicks(true)
                            
                        }}>
                        <Text style={{color:Color.WHITE,textAlign:'center'}}>Picks</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flex:1,backgroundColor:selectedPicks ? Color.GrayBackground : Color.PRIMARY_BUTTON ,padding:12}} onPress={() => {setSelectedPicks(false)}}>
                            <Text style={{color:Color.WHITE,textAlign:'center'}}>Post</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tagContainer}>
                        <Text style={{ color: Color.TEXT }}>Tags:</Text>
                        <View style={styles.tagInputContainer}>
                            <TextInput
                                placeholder='example (food,games)'
                                placeholderTextColor={Color.TEXT}
                                style={[styles.tagInput,{color:Color.TEXT}]}
                                maxLength={10}
                                onChangeText={setTagValue}
                                value={tagValue}
                                keyboardAppearance='dark'
                            />
                            <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                                <Feather name={'send'} color={Color.WHITE} size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {videoCover && videoCover.length>0 &&
                        <ExpoImage source={{uri:videoCover}} style={{width:200,height:200}}/>
                    }
                    <FlatList
                        data={tags}
                        renderItem={renderTag}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={styles.tagsList}
                    />
                </View>
                <TouchableOpacity style={{width:'100%',height:70,backgroundColor:Color.PRIMARY_BUTTON,borderTopLeftRadius:15,borderTopRightRadius:15,display:'flex',justifyContent:'center',alignItems:'center'}}
                    onPress={() => {OnClickSharePost()}}
                >
                    <Text style={{color:Color.WHITE,fontWeight:'bold',textAlign:'center',fontSize:18}}>Share</Text>
                </TouchableOpacity>
                <Toast/>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    selectedPhoto: {
        width: width * 0.9, // Adjust width based on screen width
        height: 200,
        borderRadius: 12,
    },
    TextInputContainer: {
        width: '100%',
        position: 'relative',
        borderBottomWidth:1,
        borderColor: Color.BACKGROUND,
        borderBottomColor: Color.GrayBackground,
        
    },
    Textinput: {
        width: '88%',
        backgroundColor: Color.BACKGROUND,
        marginTop: 20,
        padding: 20,
        fontWeight: '500',
        fontSize: 18,
        textAlignVertical: 'top', // Align text to the top
        textAlign: 'left', // Align text to the left
    },
    mediaContainer: {
        flex: 1,
        justifyContent: 'start',
        alignItems: 'center',
        height: 200,
    },
    list: {
        marginTop: 10,
    },
    tagInputContainer: {
        position: 'relative',
        flex: 1,
        borderBottomWidth:1,
        borderColor: Color.BACKGROUND,
        borderBottomColor: Color.GrayBackground,
        padding: 10
    },
    tagInput: {
        width: '88%',
    },
    addTagButton: {
        position: 'absolute',
        right: 0,
        bottom: 5,
        backgroundColor: Color.PRIMARY_BUTTON,
        padding: 5,
        borderRadius: 24,
        width: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    TagContainer: {
        position: 'relative',
        backgroundColor:Color.PRIMARY_BUTTON,
        borderRadius: 4,
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20
    },
    Tag: {
        color: Color.WHITE,
    },
    TagClose: {
        position: 'absolute',
        right: -10,
        top: 0,
        marginTop: -10,
        borderWidth: 1,
        borderColor: Color.PRIMARY_BUTTON_HOVER,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        fontWeight: 'bold'
    },
    charCount: {
        color: Color.TEXT,
        position: 'absolute',
        right: 10,
        bottom: 0,
        fontWeight: 'bold',
    },
    tagsList: {
        width: '100%',
        padding: 12,
        display: 'flex',
        flexDirection: 'row',
        gap: 15,
        flexWrap: 'wrap',
    },
    tagContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 40,
        gap: 10,
        marginHorizontal: 10,
        alignItems: 'center',
        position: 'relative'
    }
});

export default AddPots;
