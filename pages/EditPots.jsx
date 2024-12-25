import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Image, FlatList, Dimensions, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Video } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';
import ExpoImage from 'expo-image/build/ExpoImage';
import { useSelector } from 'react-redux';
import { selectCurrentTheme } from '../store/user/user.selector';
import { getTheme } from './Colors/Color';

const { width } = Dimensions.get('window'); // Get device width for styling

const EditPots = () => {
    const navigate = useNavigation();
    const route = useRoute();
    const videoCover = route.params.videoCover;
    const setVideoCover = route.params.setVideoCover;
    const selectedMulti = route.params.selectedMulti;
    const imageData = route.params.imageData;
    const resizeMode = route.params.resizeMode;
    const videoRefs = useRef([]); // Array to store refs for multiple videos
    const [viewableItems, setViewableItems] = useState([]);
    const isFocused = useIsFocused(); // Hook to detect if screen is focused
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
    useEffect(() => {
        if(selectedMulti.length <= 1){
            return navigate.navigate('EditImage',{image:selectedMulti[0],resizeMode:resizeMode,AllPosts:selectedMulti,videoCover:videoCover,setVideoCover:setVideoCover})
        }

        if (!isFocused) {
            // Stop all videos when screen is not focused
            videoRefs.current.forEach(ref => {
                if (ref) {
                    ref.setStatusAsync({ shouldPlay: false })
                }
            });
        } else {
            // Handle playback based on visible items
            videoRefs.current.forEach((ref, index) => {
                if (viewableItems.includes(index)) {
                    if (ref) {
                        ref.setStatusAsync({ shouldPlay: true })
                    }
                } else {
                    if (ref) {
                        ref.setStatusAsync({ shouldPlay: false })
                    }
                }
            });
        }
    }, [isFocused, viewableItems]);

    const handleViewableItemsChanged = ({ viewableItems }) => {
        setViewableItems(viewableItems.map(item => item.index));
    };

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50 // Play video when 50% of it is visible
    };

    const handlePressDone = () => {
        navigate.navigate('Post',{AllPosts:selectedMulti,resizeMode:resizeMode,videoCover:videoCover,setVideoCover:setVideoCover})
    }
    const renderItem = ({ item, index }) => (
        <TouchableOpacity style={styles.mediaContainer} onPress={() => navigate.navigate('EditImage',{image:item,resizeMode:resizeMode,AllPosts:selectedMulti,index:index,videoCover:videoCover,setVideoCover:setVideoCover}) }>
            {item.mediaType === 'photo' ? (
                <ExpoImage
                    source={{ uri: imageData ? imageData : item.uri }}
                    style={styles.selectedPhoto}
                    resizeMode={resizeMode}
                />
            ) : (
                <Video
                    ref={ref => (videoRefs.current[index] = ref)} // Store ref in array
                    source={{ uri: item.uri }}
                    style={styles.selectedPhoto}
                    isLooping
                    isMuted={false}
                    resizeMode={resizeMode}
                    onPlaybackStatusUpdate={(status) => {
                        // Optional: Handle playback status updates here
                    }}
                />
            )}
        </TouchableOpacity>
    );
    return (
        <View style={{backgroundColor:Color.BACKGROUND,flex:1}}>
           {selectedMulti.length > 1 &&
            <FlatList
            data={selectedMulti}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            snapToInterval={width - (width*.15)} // Width of each item + margin
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            />
           } 
            <View style={{width:'100%',display:'flex',justifyContent:'space-between',flexDirection:'row',paddingHorizontal:10,paddingVertical:10}}>
                <View></View>
                <TouchableOpacity style={{width:70,height:40,backgroundColor:Color.PRIMARY_BUTTON,borderRadius:24,display:'flex',justifyContent:'center',alignItems:'center'}} onPress={() => handlePressDone()}>
                    <Text style={{fontSize:14,color:Color.WHITE,fontWeight:'bold'}}>Done</Text>
                </TouchableOpacity>
            </View>
            
        </View>
       
    );
};

const styles = StyleSheet.create({
    selectedPhoto: {
        width: width * .9, // Adjust width based on screen width
        height: 400,
        borderRadius: 12,
        
    },
    mediaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EditPots;
