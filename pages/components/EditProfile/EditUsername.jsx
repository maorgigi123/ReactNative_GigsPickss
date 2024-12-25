import { View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import Color from '../../Colors/Color';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { SET_CURRENT_USERNAME } from '../../../store/user/user.action';
import { selectCurrentUser } from '../../../store/user/user.selector';

export default function EditUsername({ navigation }) {
    const user = useSelector(selectCurrentUser)
    const [username, setUsername] = useState(user.username);
    const dispatch = useDispatch()
    const handleSave = () => {
        console.log('handle Save ',username);
        dispatch(SET_CURRENT_USERNAME(username))
    };

    React.useEffect(() => {
        navigation.setParams({ handleSave });
    }, [navigation,username]);

    const handleChange = (event) => {
        if (event.nativeEvent.text.length <= 30) {
            setUsername(event.nativeEvent.text);
        } 
        
        if(event.nativeEvent.text.length >=30){
            Toast.show({
                type: 'error',
                text1: 'Username Limit Reached',
                text2: 'Username cannot exceed 30 characters',
                position: 'top',
            });
        }
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <TextInput
                style={style.textInput}
                placeholder='Enter your username...'
                onChange={handleChange}
                value={username}
            />
            <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                <Text style={{ marginTop: 10 ,fontWeight:'400'}}>
                    {username.length}/
                </Text>
                <Text style={{ marginTop: 10, color:username.length >= 30 ? 'red' : 'black',fontWeight:'400'}}>
                    30
                </Text>
            </View>
            <Toast ref={(ref) => Toast.setRef(ref)} />

        </View>
    );
}

const style = StyleSheet.create({
    textInput: {
        width: '100%',
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: Color.TEXT,
    },
});
