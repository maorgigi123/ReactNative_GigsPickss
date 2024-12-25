import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import {Entypo} from 'react-native-vector-icons';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/Ionicons'; // Import your preferred icon library
import { useRoute } from '@react-navigation/native';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { useSelector } from 'react-redux';
import { selectCurrentTheme, selectCurrentUser } from '../../store/user/user.selector';
import { getTheme } from '../Colors/Color';
import { EXPO_PUBLIC_API_URL } from '@env';
export default function PreivewFile() {
const [pause,setPause] = useState(false)
const [mute,setMute] = useState(false)
const route = useRoute();
const { item,username='' } = route.params;
const type = item.type ? item.type : item.typeFile
const data = item.uri ? item.uri : item.data
const isDarkMode = useSelector(selectCurrentTheme)
const Color = getTheme(isDarkMode); // Get the theme based on the mode
  return (
    <View style={{flex:1,backgroundColor:Color.BACKGROUND}}>
         {type==='video' ?

        <View style={styles.iconContainer}>
        {pause && <Icon style={styles.iconPause} name={'play-outline'} size={100} color={'#fff'}/>}

        <TouchableOpacity activeOpacity={1} onPress = {() => {setPause(prev => !prev)}}>
            
        <Video
        shouldPlay={pause} // Should play when not paused
        isLooping
            isMuted={mute}
            resizeMode='contain'
            source={{uri: `${EXPO_PUBLIC_API_URL}/uploads/${item.uri}` }}
            style={styles.image}
            ref={ref => (videoRefs.current[index] = ref)} // Store ref in array
            onPlaybackStatusUpdate={status => {
            if (status.isPlaying) {
                // Ensure other videos are paused
                videoRefs.current.forEach((ref, i) => {
                if (i !== currentIndex) {
                    ref?.pauseAsync();
                }
                });
            }
            }}
            />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {setMute(prev => !prev)}} style={{ marginRight: 15,position:'absolute',right:0,bottom:10, backgroundColor:Color.BLACK_BACKGROUND,width:30,height:30,borderRadius:50,display:'flex',justifyContent:'center',alignItems:'center' }}>
        <Entypo
            name={mute ? 'sound-mute' : 'sound'}
            size={15}
            color={Color.WHITE}
        />
        </TouchableOpacity>
                {/* <Image style={styles.image} source={{ uri: `http://your-server-address/uploads/${item.uri}` }}/>  */}
            
        </View>
        
        :
        <ImageZoom style={styles.image} source={{ uri: data.startsWith('Messages') || data.startsWith('Profiles') || data.startsWith(username)  ?`${EXPO_PUBLIC_API_URL}/uploads/${item.data ? item.data : item.uri}` : item.data ? item.data : item.uri}} />
    }
    </View>
  )
}

const styles = StyleSheet.create({
    image:{
        width:'100%',
        height:'100%',
    }
})