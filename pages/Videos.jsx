import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text,SafeAreaView, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/Ionicons'; // Import your preferred icon library
import Feather from 'react-native-vector-icons/Feather';
import { useIsFocused } from '@react-navigation/native'; // Import to detect focus state
import {Image} from 'expo-image'
import { useSelector } from 'react-redux';
import { selectCurrentTheme, selectLoadPost } from '../store/user/user.selector';
import ExpoImage from 'expo-image/build/ExpoImage';
import {getTheme} from '../pages/Colors/Color'
const Videos = ({navigation}) => {
  const [photos, setPhotos] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [resizeMode, setResizeMode] = useState('contain'); // Default to 'contain'
  const [selectedMultiMode, setSelectedMultiMode] = useState(false)
  const [selectedMulti,setSelectedMulti] = useState([])
  const [videoCover,setVideoCover] = useState()
  const videoRefs = useRef(); // Object to store refs for multiple videos
  const isFocused = useIsFocused(); // Hook to detect if screen is focused

  const isDarkMode = useSelector(selectCurrentTheme)
  const Color = getTheme(isDarkMode); // Get the theme based on the mode

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
  useEffect(() => {
    if(!isFocused)
    {
      if (videoRefs.current) {
        videoRefs.current.setStatusAsync({ shouldPlay: false })
      }
    }
    else{
      setSelectedPhoto(photos.length > 0 ? photos[0] : null)
      setResizeMode('contain')
      setSelectedMultiMode(false)
      setSelectedMulti([])
      setVideoCover()
      if (videoRefs.current) {
        videoRefs.current.setStatusAsync({ shouldPlay: true })
      }
    }
     
}, [isFocused]);

  const handleAddMulti = (item) => {
    setSelectedMulti((prev) => {
      const isAlreadySelected = prev.find(selected => selected.uri === item.uri);
      if (isAlreadySelected) {
        if(prev.filter(selected => selected.uri !== item.uri).length <= 0){
          setSelectedMultiMode(false)
        }
        return prev.filter(selected => selected.uri !== item.uri);
      } else {
        const newPosition = prev.length + 1;
        return [...prev, { ...item, position: newPosition }];
      }
    });
  };
  const fetchPhotos = async (pageNumber = 1) => {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: ['photo', 'video'], // Fetch both photos and videos
      sortBy: [[MediaLibrary.SortBy.creationTime,false]],
      first: 52, // Fetch 50 items at a time
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
  
    // Set the first item as the selected item if it's the first fetch
    if (pageNumber === 1 && mediaUris.length > 0) {
      setSelectedPhoto(mediaUris[0]);
    }
  
    setHasNextPage(media.hasNextPage);
  };
  
  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:Color.BACKGROUND}}>
          <Text style={{fontSize:18,fontWeight:'bold',color:Color.TEXT}}>No access to media library</Text>

    </View>
    );
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
                      style={[styles.photo, selectedPhoto === item && { borderColor: Color.TEXT, borderWidth: 2 }]} // Highlight border if selected
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
                       {isSelected && <Text style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',fontSize:8,position:'relative',top:3,fontWeight:'bold'}}>{(selectedMulti.findIndex((video) => video.name === item.name)+1)}</Text>}

              </View>
            )}
          </View>
        ) : (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: item.uri }}
              style={[styles.video, selectedPhoto === item && { borderColor: Color.TEXT, borderWidth: 2 }]} // Highlight border if selected
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
               {isSelected && <Text style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',fontSize:8,position:'relative',top:3,fontWeight:'bold'}}>{(selectedMulti.findIndex((video) => video.name === item.name)+1)}</Text> }
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
  

  const loadMorePhotos = () => {
    if (hasNextPage) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchPhotos(nextPage);
        return nextPage;
      });
    }
  };
  const handleShrink = () => {
    setResizeMode((prevMode) => (prevMode === 'contain' ? 'cover' : 'contain'));
  }
  const handleMultiClick = () => {
    setSelectedMultiMode((prev) => {
      if(prev == true){
        setSelectedMulti([])
      }
      else{
        setResizeMode('cover')
        if (selectedPhoto) {
          // Check if the selected photo/video is already in the selectedMulti array
          const isAlreadySelected = selectedMulti.some(selected => selected.uri === selectedPhoto.uri);
          
          if (!isAlreadySelected) {
            // Add the currently viewed item to the selectedMulti array
            const newPosition = selectedMulti.length + 1;
            setSelectedMulti([...selectedMulti, { ...selectedPhoto, position: newPosition }]);
          }
        }
      }
      return !prev
    })
  }

  return (
    <View  style={{flex:1,backgroundColor:Color.BACKGROUND}}>
        <SafeAreaView style={{flex:1}}>
              <View style={styles.topStyle}>
                {/* <TouchableOpacity>
                  <Text style={{color:Color.WHITE,fontSize:30}}>X</Text>
                </TouchableOpacity> */}
          <View>

          </View>
               
                <Text style={{color:Color.TEXT,fontSize:16,fontWeight:'bold'}}>New post</Text>
                <TouchableOpacity onPress={() =>  navigation.navigate('EditPost',selectedMulti.length <=0 ? {selectedMulti :[selectedPhoto], resizeMode:resizeMode,videoCover:videoCover,setVideoCover:setVideoCover} : {selectedMulti:selectedMulti,resizeMode:resizeMode,videoCover:videoCover,setVideoCover:setVideoCover})}>
                    <Text style={{color:Color.PRIMARY_BUTTON,fontSize:16,fontWeight:'bold'}}>Next</Text>
                </TouchableOpacity>

              </View>
                <View style={styles.selectedImageContainer}>
              {selectedPhoto && selectedPhoto.mediaType === 'photo' ? (
               <ExpoImage
               source={{ uri: selectedPhoto.uri }}
               style={styles.selectedPhoto}
               contentFit={resizeMode} // Move this prop outside of the style array
             />
              ) : selectedPhoto && selectedPhoto.mediaType === 'video' ? (
                <Video
                  ref={videoRefs}
                  source={{ uri: selectedPhoto.uri }}
                    style={styles.selectedPhoto}
                    resizeMode={resizeMode}
                    isLooping
                    shouldPlay
                    isMuted={false} // Ensure audio is not muted
                    
                  />
                ) : null}
                <View style={styles.shrinkContainer}>
                {!selectedMultiMode && 
                 <TouchableOpacity onPress={handleShrink}>
                 <View style={styles.shirkCircle}>
                   
                   <AntDesign name="shrink" size={18} color={Color.WHITE} />
                 </View>
               </TouchableOpacity>
                }
                 
                </View>
              </View>
              <View style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 5, // Adjust this value to your desired spacing
                  marginVertical:5
                }}>
                <TouchableOpacity>
                    <View style={styles.pickerIconContainer}>
                        <Text style={[styles.pickerInput,{color: Color.TEXT}]}>
                          Recents
                        </Text>   
                        <Feather name="chevron-down" size={24} color={Color.TEXT} />
                    </View> 
                </TouchableOpacity>
                 
                    
                <View style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 10,
                  }}>
                    <TouchableOpacity onPress={handleMultiClick}>
                      <Icon name={'layers-outline'} size={28} color={selectedMultiMode ? Color.PRIMARY_BUTTON : Color.TEXT} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {navigation.navigate('Camera')}}>
                      <Feather name={'camera'} size={28} color={Color.TEXT} />
                    </TouchableOpacity>

                  </View>
                
                </View>
              <View style={styles.container}>
                  <FlatList
                    data={photos}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    numColumns={4}
                    columnWrapperStyle={styles.FlatStyle}
                    onEndReached={loadMorePhotos}
                    onEndReachedThreshold={2}
                  />
              </View>
            </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:Color.BACKGROUND
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
    borderWidth: 1,
    borderRadius: 50,
    height: 20, // Adjust size if needed
    width: 20,  // Adjust size if needed
    display:'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImageContainer:{

  },
  selectedPhoto:{
    width:'100%',
    height:350,
  },
  topStyle:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    margin:5,
    marginLeft:30,
    height:40
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
    paddingRight: 5,
    paddingLeft:10
  },
  pickerIconContainer: {
    display:'flex',
    flexDirection:'row'
  },

});

export default Videos;
