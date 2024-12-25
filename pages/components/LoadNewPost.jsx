import { View, Text, Dimensions, StyleSheet } from 'react-native'
import React from 'react'
import Color from '../Colors/Color'
import LottieView from 'lottie-react-native';
import {Image} from 'expo-image'
import ExpoImage from 'expo-image/build/ExpoImage';
export default function LoadNewPost(cover) {
  return (

    <View style={{width:Dimensions.get('window').width,height:80,backgroundColor:Color.PRIMARY_BUTTON,display:'flex',flexDirection:'row',alignItems:'center',gap:5,position:'relative'}}>
        <View style={{...StyleSheet.absoluteFillObject}}>
        <LottieView
                source={require('../../assets/background.json')}
                autoPlay
                loop={true}
                resizeMode='cover'
            />
        </View>
    <ExpoImage source={{uri:cover.cover}} style={{width:80,height:80}} />
    <Text style={{fontSize:12,color:Color.WHITE,fontWeight:'bold'}}>Upload in progress please wait</Text>
    <View style={{height:80,width:100,flex:1}}>
        <LottieView
            source={require('../../assets/loadinFile.json')}
            autoPlay
            loop={true}
            resizeMode='cover'
        />
    </View>
  
    </View>
  )
}