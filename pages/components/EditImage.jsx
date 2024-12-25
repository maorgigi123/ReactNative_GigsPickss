import { View, Text, StyleSheet, Image,TouchableOpacity, Dimensions, ScrollView } from 'react-native'
import React, { useEffect, useRef ,useLayoutEffect, useState} from 'react'
import { useIsFocused, useRoute } from '@react-navigation/native';
import { Video } from 'expo-av';
import {Entypo,AntDesign} from 'react-native-vector-icons';
import FadeFilter from './FadeFilter';
import FadeWarm from './FadeWarm';
import CoolFilter from './CoolFilter';
import { ImageEditor } from "expo-image-editor";
import VideoCoverSelector from './VideoCoverSelector';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { useSelector } from 'react-redux';
import { selectCurrentTheme } from '../../store/user/user.selector';
import { getTheme } from '../Colors/Color';

const EditImage = ({navigation}) => {
    const route = useRoute();
    const image = route.params.image;
    const AllPosts = route.params.AllPosts;
    const resizeMode = route.params.resizeMode;
    const videoCover = route.params.videoCover;
    const setVideoCover = route.params.setVideoCover;
    const isFocused = useIsFocused(); // Hook to detect if screen is focused
    const videoRef = useRef(); // Array to store refs for multiple videos
    const [isMuted, setIsMuted] = useState(false); // State to manage mute status
    const [filter,setFilter] = useState('Normal');
    const [editorVisible, setEditorVisible] = useState(false);
    const [coverEditorVisible,setCoverEditorVisible] = useState(false)
    const [imageData, setImageData] = useState(null);
    const [videoCoverEdit, setVideoCoverEdit] = useState()
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
    const renderFilter = () => {
        switch (filter) {
            case 'Normal':
                return (
                    <Image
                        source={{ uri:  imageData ? imageData : image.uri }}
                        style={styles.Photo}
                        resizeMode={'fill'}
                    />
                );
            case 'Fade':
                return (
                    <FadeFilter
                        uri={imageData ? imageData : image.uri}
                        style={styles.Photo}
                        resizeMode={'fill'}
                    />
                );
            case 'Fade-warm':
                return (
                    <FadeWarm
                        uri={imageData ? imageData : image.uri}
                        style={styles.Photo}
                        resizeMode={'fill'}
                    />
                );
            case 'Cool-filter':
                return (
                    <CoolFilter uri = {imageData ? imageData : image.uri}  style={styles.Photo} resizeMode={'fill'}/>

                );
            default:
                return (
                    <Image
                        source={{ uri: imageData ? imageData : image.uri }}
                        style={styles.Photo}
                        resizeMode={'fill'}
                    />
                );
        }
    };



  const handleCropImage = async (uri) => {
    setEditorVisible(true)
  };
  // Define the function to be called on header right button press
  const handleHeaderRightPress = () => {
    if (videoRef.current) {
        videoRef.current.setStatusAsync({ isMuted: !isMuted });
        setIsMuted(!isMuted);
    }
};

    // Use layout effect to set header options
    useLayoutEffect(() => {
    if (!videoRef.current) return
    navigation.setOptions({
        headerRight: () => (
            <TouchableOpacity onPress={handleHeaderRightPress} style={{ marginRight: 15 }}>
                <Entypo
                    name={isMuted ? 'sound-mute' : 'sound'}
                    size={28}
                    color={Color.TEXT}
                />
            </TouchableOpacity>
        ),
    });
    }, [navigation, isMuted]);

    // Use layout effect to set header options
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    if(AllPosts.length > 1){
                        navigation.goBack()
                    }
                    else{
                        setVideoCover()
                        navigation.popToTop()
                    }
                }} style={{ marginLeft: 15 }}>
                     <AntDesign name={'close'} size={28} color={Color.TEXT} />
                </TouchableOpacity>
      
            ),
        });
        }, [navigation]);

    const handlePressDone = () => {
        const updatedPosts = AllPosts.map(post => {
            if (post.uri === image.uri) {
              // Modify the post as needed
              return {
                ...post,
                uri: imageData ? imageData : post.uri, // Keep the original URI if needed, otherwise ensure imageData has the correct URI
                cover : videoCover ? (videoCoverEdit && videoCoverEdit.length>0) ? videoCoverEdit : videoCover : videoCoverEdit
              };
            }
            return post; // Return the post unmodified if it doesn't belong to the current user
          });

        if(updatedPosts.length <= 1){
            navigation.navigate('Post',{AllPosts:updatedPosts,AllPosts:updatedPosts,videoCover:( videoCover ? (videoCoverEdit && videoCoverEdit.length>0) ? videoCoverEdit : videoCover : videoCoverEdit),setVideoCover:setVideoCover})
        }
        else{
            // Set params on the previous screen
            navigation.navigate('EditPost',{image:updatedPosts[0],resizeMode:resizeMode,selectedMulti:updatedPosts,videoCover: videoCover ? (videoCoverEdit && videoCoverEdit.length>0) ? videoCoverEdit : videoCover : videoCoverEdit,setVideoCover:setVideoCover});
            
        }
    }

    useEffect(() => {
        if(!isFocused)
        {
          if (videoRef.current) {
            videoRef.current.setStatusAsync({ shouldPlay: false })
          }
        }
        else{
          if (videoRef.current) {
            videoRef.current.setStatusAsync({ shouldPlay: true })
          }
        }
         
    }, [isFocused]);

  return (
    <View style={[styles.mediaContainer,{backgroundColor:Color.BACKGROUND}]}>

        {editorVisible &&
        <ImageEditor
                visible={editorVisible}
                onCloseEditor={() => setEditorVisible(false)}
                imageUri={image.uri}
                fixedCropAspectRatio={16 / 9}
                minimumCropDimensions={{
                width: 100,
                height: 100,
                }}
                onEditingComplete={(result) => {
                    setImageData(result.uri);
                }}
                mode="full"
            />
            }
            {image.mediaType === 'photo' ? (
                <View style={styles.selectedPhoto}>
                        {renderFilter()}
                        {/* <View style={{flex:1,width:'100%',height:'100%',position:'absolute',backgroundColor:'red'}}>    

                        </View> */}

                </View>
            ) : (
                <Video
                    ref={videoRef}
                    source={{ uri: image.uri }}
                    style={styles.selectedPhoto}
                    isLooping
                    isMuted={false}
                    resizeMode={resizeMode}
                    onPlaybackStatusUpdate={(status) => {
                        // Optional: Handle playback status updates here
                    }}
                />
            )}
        {image.mediaType === 'photo'  && 
         <ScrollView horizontal style={styles.FiltersContainer} contentContainerStyle ={{gap:10}}>
         <TouchableOpacity style={{display:'flex',alignItems:'center',gap:5,position:'relative'}} onPress={() => setFilter('Normal')}>
             <Text style={{color:Color.TEXT,fontSize:14,fontWeight:'600'}}>Normal</Text>
             <Image
                 source={{ uri: image.uri }}
                 style={{width:100,height:110,objectFit:'fill'}}
                 resizeMode={resizeMode}
             />
         </TouchableOpacity>
        
         <TouchableOpacity style={{display:'flex',alignItems:'center',gap:5}} onPress={() => setFilter('Fade')}>
             <Text style={{color:Color.TEXT,fontSize:14,fontWeight:'600'}}>Fade</Text>
             <FadeFilter uri = {image.uri}  style={{width:100,height:110,objectFit:'fill'}} resizeMode={resizeMode}/>
         </TouchableOpacity>
         <TouchableOpacity style={{display:'flex',alignItems:'center',gap:5}} onPress={() => setFilter('Fade-warm')}>
             <Text style={{color:Color.TEXT,fontSize:14,fontWeight:'600'}}>Fade-warm</Text>
             <FadeWarm uri = {image.uri}  style={{width:100,height:110,objectFit:'fill'}} resizeMode={resizeMode}/>
         </TouchableOpacity>

         <TouchableOpacity style={{display:'flex',alignItems:'center',gap:5}} onPress={() => setFilter('Cool-filter')}>
             <Text style={{color:Color.TEXT,fontSize:14,fontWeight:'600'}}>Cool-filter</Text>
             <CoolFilter uri = {image.uri}  style={{width:100,height:110,objectFit:'fill'}} resizeMode={resizeMode}/>

         </TouchableOpacity>
     </ScrollView>
     }
    {coverEditorVisible && image.mediaType ==='video' &&  <VideoCoverSelector videoUri ={image.uri} videoDuration={image.duration} setVideoCoverEdit={setVideoCoverEdit} setVideoCover={setVideoCover}/>}
       
        {image.mediaType === 'photo' ? 
            <View style={{height:50,width:'100%',display:'flex',flexDirection:'row',justifyContent:'space-between',position:'absolute',bottom:0}}>
            <View style={{display:'flex',flexDirection:'row',gap:10}}>
                <TouchableOpacity style={{width:70,height:40,backgroundColor:Color.GrayBackground,borderRadius:24,display:'flex',justifyContent:'center',alignItems:'center'}} onPress={handleCropImage}>
                    <Text style={{fontSize:14,color:Color.WHITE,fontWeight:'bold'}}>Crop</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={{width:70,height:40,backgroundColor:Color.PRIMARY_BUTTON,borderRadius:24,display:'flex',justifyContent:'center',alignItems:'center'}} onPress={() => handlePressDone()}>
                <Text style={{fontSize:14,color:Color.WHITE,fontWeight:'bold'}}>Done</Text>
            </TouchableOpacity>
            </View>
            :
            <View style={{height:50,width:'100%',display:'flex',flexDirection:'row',justifyContent:'space-between',position:'absolute',bottom:0}}>
            <View style={{display:'flex',flexDirection:'row',gap:10}}>
            <TouchableOpacity style={{width:70,height:40,backgroundColor:Color.GrayBackground,borderRadius:24,display:'flex',justifyContent:'center',alignItems:'center'}}>
                <Text style={{fontSize:14,color:Color.WHITE,fontWeight:'bold'}}>Trim</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setCoverEditorVisible(prev => !prev)}} style={{width:70,height:40,backgroundColor:Color.GrayBackground,borderRadius:24,display:'flex',justifyContent:'center',alignItems:'center'}}>
                <Text style={{fontSize:14,color:Color.WHITE,fontWeight:'bold'}}>Cover</Text>
            </TouchableOpacity>
            </View>

            <TouchableOpacity style={{width:70,height:40,backgroundColor:Color.PRIMARY_BUTTON,borderRadius:24,display:'flex',justifyContent:'center',alignItems:'center'}} onPress={() => handlePressDone()}>
            <Text style={{fontSize:14,color:Color.WHITE,fontWeight:'bold'}}>Done</Text>
            </TouchableOpacity>
            </View>

            }
      
            
    </View>


  )
}
const styles = StyleSheet.create({
    selectedPhoto: {
        width:'80%',
        height: 400,
        borderRadius: 12,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        position:'relative',
    },
    Photo: {
        width:'100%',
        height: '100%',
        borderRadius: 12,
    },
    mediaContainer: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    FiltersContainer: {
        width:'100%',
        height:120,
        display:'flex',
        flexDirection:'row',
        gap:10,
        marginTop:50
    }
});

export default EditImage