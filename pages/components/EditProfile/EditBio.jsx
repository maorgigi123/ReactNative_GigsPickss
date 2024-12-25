import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import Color from '../../Colors/Color';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { SET_CURRENT_BIO } from '../../../store/user/user.action';
import { selectCurrentUser } from '../../../store/user/user.selector';

export default function EditBio({ navigation }) {
    const user = useSelector(selectCurrentUser)
    const [bio, setBio] = useState(user.biography);
    const dispatch = useDispatch();

    const handleSave = () => {
        console.log('handle Save ', bio);
        dispatch(SET_CURRENT_BIO(bio));
    };

    useEffect(() => {
        navigation.setParams({ handleSave });
    }, [navigation, bio]);

    const handleChange = (event) => {
        const text = event.nativeEvent.text;
        if (text.length <= 80) {
            setBio(text);
        }

        if (text.length > 80) {
            Toast.show({
                type: 'error',
                text1: 'Bio Limit Reached',
                text2: 'Biography cannot exceed 80 characters',
                position: 'top',
            });
        }
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <TextInput
                style={style.textInput}
                placeholder={user.biography}
                onChange={handleChange}
                value={bio}
                multiline={true}  // Allow multi-line input
                numberOfLines={4} // Set the number of lines displayed
                
            />
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginTop: 10, fontWeight: '400' }}>
                    {bio.length}/
                </Text>
                <Text style={{ marginTop: 10, color: bio.length >= 80 ? 'red' : 'black', fontWeight: '400' }}>
                    80
                </Text>
            </View>
            <Toast ref={(ref) => Toast.setRef(ref)} />
        </View>
    );
}

const style = StyleSheet.create({
    textInput: {
        width: '100%',
        height: 100, // Adjust height for better multi-line experience
        borderBottomWidth: 1,
        borderBottomColor: Color.TEXT,
        paddingVertical: 8, // Add padding for better UX
    },
});
