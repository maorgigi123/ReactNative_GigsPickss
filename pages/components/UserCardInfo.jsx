import { View, Text,StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../store/user/user.selector'
import Color from '../Colors/Color'
import { useNavigation } from '@react-navigation/native'
import {MaterialCommunityIcons,AntDesign} from 'react-native-vector-icons'
import { UserContext } from '../../store/userContext'
import {Image} from 'expo-image'
import ExpoImage from 'expo-image/build/ExpoImage'
import { EXPO_PUBLIC_API_URL } from '@env';
const UserCardInfo = ({user,setActiveCard}) => {
    const { setPathUserMessage } = useContext(UserContext);

    const navigation = useNavigation()
    
    const handleSAyHello = () => {
        setPathUserMessage({ username: user.username,profile_img:user.profile_img,_id:user._id, recipient: user });
        navigation.navigate('Messages');
    }
  return (
    <View style={styles.cardContainer}>
        <View style={{display:'flex',flexDirection:'row',height:'100%',width:'100%',backgroundColor:Color.PRIMARY_BUTTON,borderRadius:20}}>
            <ExpoImage source={{uri:`${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}`}} style={{height:'100%',width:100,borderTopLeftRadius:20,borderBottomLeftRadius:20,objectFit:'cover',backgroundColor:'transparent'}}/>
            
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{user.username}</Text>
                    <TouchableOpacity style={styles.cardButtom} onPress={handleSAyHello}>
                        <View style={{display:'flex',flexDirection:'row',gap:10,justifyContent:'center',alignItems:'center'}}>
                            <Text  style={styles.cardButtomText}>say Hello</Text>
                            <MaterialCommunityIcons name={"hand-wave-outline"} size={28} color={Color.WHITE}/>
                        </View>
                    </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setActiveCard(null)} activeOpacity={.6} style={{position:'absolute',top:-10,right:-10,padding:5,backgroundColor:Color.PRIMARY_BUTTON_HOVER,borderRadius:50,opacity:.9}}>
                <AntDesign name={'close'} size={28} color={Color.WHITE} />
            </TouchableOpacity>
        </View>

  </View>
  )
}

export default UserCardInfo

const styles = StyleSheet.create({
    cardContainer : {
        position:'absolute',
        bottom:62,
        padding:10,
        left:10,
        right:10,
        height:150,
    },
    cardInfo:{
        flex:1,
        overflow:'hidden',
        display:'flex',
        flexDirection:'column',
        gap:10,
        fontSize:20,
        paddingHorizontal:10
    },
    cardTitle:{
        fontSize:20,
        fontWeight:'bold',
        color:Color.WHITE,
        textAlign:'center',
    },
    cardButtom : {
        padding:10,
        backgroundColor:Color.PRIMARY_BUTTON_HOVER,
        borderRadius:8,
        paddingVertical: 26,
        marginBottom:10
    },
    cardButtomText: {
        fontSize:24,
        color:Color.WHITE,
        fontWeight:'600'
    }
})