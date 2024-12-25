import { View, Text, StyleSheet ,TouchableOpacity} from 'react-native';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentTheme } from '../../store/user/user.selector';
import { SetTheme } from '../../store/user/user.action'; // Adjust the path according to your project structure
import { RadioButton } from 'react-native-paper';
import { getTheme } from '../Colors/Color';

export default function ColorTheme() {
    const dispatch = useDispatch();
    const isDarkMode = useSelector(selectCurrentTheme);
    const Color = getTheme(isDarkMode); // Get the theme based on the mode

    // Function to handle theme change
    const handleThemeChange = (value) => {
        dispatch(SetTheme(value));
    };

    return (
        <View style={[styles.container, { backgroundColor: Color.BACKGROUND }]}>
            <Text style={[styles.title, { color: Color.TEXT }]}>Select Theme</Text>
            <View style={[styles.radioContainer, { backgroundColor: Color.BACKGROUND }]}>
                <TouchableOpacity
                    style={[
                        styles.radioWrapper,
                        { borderColor: !isDarkMode ? Color.TEXT : 'transparent' } // Border color only if light theme is selected
                    ]}
                    onPress={() => handleThemeChange('light')}
                >
                    <RadioButton
                        value="light"
                        status={!isDarkMode ? 'checked' : 'unchecked'}
                    />
                    <Text style={[styles.label, { color: Color.TEXT }]}>Light Theme</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.radioWrapper,
                        { borderColor: isDarkMode ? Color.TEXT : 'transparent' } // Border color only if dark theme is selected
                    ]}
                    onPress={() => handleThemeChange('dark')}
                >
                    <RadioButton
                        value="dark"
                        status={isDarkMode ? 'checked' : 'unchecked'}
                    />
                    <Text style={[styles.label, { color: Color.TEXT }]}>Dark Theme</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
    radioContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10, // Optional: Add padding if needed
    },
    radioWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        borderWidth: 1, // Border width
        borderRadius: 50, // Round border corners
        padding: 10, // Add padding around the radio button
    },
    label: {
        fontSize: 16,
        marginLeft: 10, // Space between radio button and label
    },
});
