import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { SET_CURRENT_LOCATION, SET_CURRENTPLAYERS, SET_PLAYERS_LOCATION, setCurrentUser } from '../../store/user/user.action';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from 'expo-router';
import { selectCurrentWs } from '../../store/webSocket/ws.selector';
import { selectCurrentTheme, selectCurrentUser } from '../../store/user/user.selector';
import { CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import { getTheme } from '../Colors/Color';
export default function ProfileSetting({navigation}) {
    const dispatch = useDispatch()
    const ws = useSelector(selectCurrentWs);
    const user = useSelector(selectCurrentUser)
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
    const handleLogOut = () => {
        ws.currentWs.send(JSON.stringify({ type: 'disconnect', username: `${user.username}` }))
        dispatch(setCurrentUser(null))
        dispatch(SET_CURRENT_LOCATION(null))
        dispatch(SET_CURRENTPLAYERS([]))
        navigation.dispatch(
            CommonActions.reset({
              index: 0, // Index of the active route
              routes: [{ name: 'Login' }], // The route to navigate to
            })
          );
        

      
    }
  return (
    <ScrollView style={{flex:1,backgroundColor:Color.BACKGROUND}}>
        <View style={{display:'flex',justifyContent:'center',alignItems:'center',flex:1,gap:20,marginTop:20}}>
          <TouchableOpacity onPress={() => {navigation.navigate('ChangeColorTheme')}} style={{width:'100%'}}>
                <View style={{backgroundColor:Color.PRIMARY_BUTTON_HOVER,paddingHorizontal:20,marginHorizontal:20,borderRadius:12,height:50,display:'flex',justifyContent:'start',alignItems:'center',flexDirection:'row',gap:20}}>
                    <MaterialCommunityIcons name = {'theme-light-dark'} size = {28} color= {Color.WHITE} />
                    <Text style={{fontSize:20,color:Color.WHITE,fontWeight:'bold'}}>Color theme</Text>
                </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={{width:'100%'}}>
                <View style={{backgroundColor:Color.PRIMARY_BUTTON_HOVER,paddingHorizontal:20,marginHorizontal:20,borderRadius:12,height:50,display:'flex',justifyContent:'start',alignItems:'center',flexDirection:'row',gap:20}}>
                    <MaterialCommunityIcons name = {'block-helper'} size = {28} color= {Color.WHITE} />
                    <Text style={{fontSize:20,color:Color.WHITE,fontWeight:'bold'}}>Blocked</Text>
                </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {handleLogOut()}} style={{width:'100%'}}>
                <View style={{backgroundColor:Color.PRIMARY_BUTTON_HOVER,paddingHorizontal:20,marginHorizontal:20,borderRadius:12,height:50,display:'flex',justifyContent:'start',alignItems:'center',flexDirection:'row',gap:20}}>
                    <MaterialCommunityIcons name = {'exit-to-app'} size = {28} color= {Color.WHITE} />
                    <Text style={{fontSize:22,color:Color.WHITE,fontWeight:'bold'}}>Log out</Text>
                    </View>
          </TouchableOpacity>
           
        </View>
      
    </ScrollView>
  )
}