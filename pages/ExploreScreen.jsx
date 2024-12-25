import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Image, StyleSheet, Platform, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentLocation, selectCurrentUser, selectPlayersLocation } from '../store/user/user.selector';
import { selectCurrentWs } from '../store/webSocket/ws.selector';
import { SET_CURRENT_LOCATION } from '../store/user/user.action';
import {Feather} from 'react-native-vector-icons'
import Color from './Colors/Color';
import UserCardInfo from './components/UserCardInfo';
import { useIsFocused } from '@react-navigation/native';
import { EXPO_PUBLIC_API_URL } from '@env';

const UserImage = require('../assets/user.png')
export default function ExploreScreen() {
  const mapRef = useRef();
  const user = useSelector(selectCurrentUser)
  const ws = useSelector(selectCurrentWs);
  const dispatch = useDispatch()
  const current_location = useSelector(selectCurrentLocation)
  const players_location = useSelector(selectPlayersLocation)
  const [load,setLoad] = useState(true)
  const [showCard , setShowCard] = useState(null)
  const isFocused = useIsFocused(); // Hook to detect if screen is focused
  const [Permissions, setPermissions] = useState(false)

useEffect(() => {
  const getPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      setLoad(false)
      setPermissions(false)
       return;
    }
    let currentLocation = (await Location.getCurrentPositionAsync({})).coords;
    console.log(currentLocation)
    if (ws.currentWs && ws.currentWs.readyState === WebSocket.OPEN) 
      ws.currentWs.send(JSON.stringify({type:'UpdateLocation', payload:{location: currentLocation,username:user}}));

    dispatch(SET_CURRENT_LOCATION({location: currentLocation,username:user}))
    setLoad(false)
    setPermissions(true)
    
  };
    getPermission();
  }, []);

  useEffect(() => {
    if(!isFocused) return
    if (ws.currentWs && ws.currentWs.readyState === WebSocket.OPEN) 
      ws.currentWs.send(JSON.stringify({type:'getAllPlayersLocation', payload:{username:user}}));
  }, [(isFocused == true)])
  const handleShowCard = (_user) => {
    if(_user.username !== user.username){
      console.log('click on ',_user.username)
      setShowCard(_user)
    }
    else{
      setShowCard(null)
    }

  }

  
  return (
    <View style={{ flex: 1 }}>
      {!load  && 
      !Permissions ? 
      <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:Color.BLACK_BACKGROUND}}>
          <Text style={{fontSize:20,color:Color.WHITE,textAlign:'center',fontWeight:'bold'}}>You need permission to see the maps!</Text>
      </View> 
      :
      current_location ? [
        <MapView 
          key={'MapView'}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          initialRegion={{
            latitude: current_location.location.latitude,
            longitude: current_location.location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.02,
          }}
          showsUserLocation={false} // Hide default user location icon
          ref={mapRef}
        > 
          <Marker coordinate={{
              latitude:  current_location.location.latitude,
              longitude: current_location.location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.02,
            }} onPress={() => {handleShowCard(user)}}>
                <View style={styles.markerContainer}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: `${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}`}}
                      style={styles.image}
                    />
                  </View>
                </View>
            </Marker>
          
          {players_location.length > 0 && players_location.map((location) => location.username.username && [
            
              user && console.log('for: ',user.username  ,' marker of ' ,location.username.username , ' marker For Now : ',players_location.length),
                  <Marker key={location.username.username} coordinate={{
                    latitude: location.location.latitude,
                    longitude: location.location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.02,
                  }} onPress={() => {handleShowCard(location.username)}}>
                      <View style={styles.markerContainer}>
                        <View style={styles.imageContainer}>
                          <Image
                            source={{ uri: `${EXPO_PUBLIC_API_URL}/uploads/${location.username.profile_img}`}}
                            style={styles.image}
                          />
                        </View>
                      </View>
                  </Marker>
          ])}
         


        </MapView>,
        <View key={'user_info'} style={styles.cardContainer}>
          {showCard && <UserCardInfo user={showCard} setActiveCard={setShowCard}/>}
        </View>
       ,
        <TouchableOpacity key={'location_button'} style={styles.mapViewContainer} onPress={() => {
          mapRef.current.animateToRegion({
            latitude: current_location.location.latitude,
            longitude: current_location.location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.02,
          });
        }}>
            <View style={styles.mapLocation}>
                <Feather name={'map-pin'} size={28} color={Color.WHITE} />
            </View>
        </TouchableOpacity>
      ] :
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={50} color="#0000ff" />

    </View>
    }
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapViewContainer: {
    width:50,
    height:50,
    backgroundColor:'red',
    position:'absolute',
    bottom:0,
    right:0,
    backgroundColor:Color.PRIMARY_BUTTON,
    marginBottom:10,
    marginRight:10,
    borderRadius:50,
  },
  mapLocation:{
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    width:50,
    height:50,
  },
  cardContainer : {
    position:'absolute',
    bottom:0,
    width:'100%'
},
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 70, // Adjust the size as needed
    height: 70,
    borderRadius: 100, // Make it circular
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff', // Optional: add a border around the image
  },
  image: {
    width: '100%',
    height: '100%',
  },
});