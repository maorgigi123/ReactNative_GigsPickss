import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser } from '../store/user/user.action';
import { getTheme } from './Colors/Color';
import { selectCurrentTheme } from '../store/user/user.selector';
import { EXPO_PUBLIC_API_URL } from '@env';

const RegisterScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const isDarkMode = useSelector(selectCurrentTheme);
    const themeColors = getTheme(isDarkMode);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        day: '',
        month: '',
        year: ''
    });

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        day: '',
        month: '',
        year: '',
        date: ''
    });

    const [daysInMonth, setDaysInMonth] = useState([]);

    useEffect(() => {
        updateDaysInMonth(form.month, form.year);
    }, [form.month, form.year]);

    const updateDaysInMonth = (month, year) => {
        let days = 31;

        if (month) {
            const selectedMonth = parseInt(month);
            const selectedYear = parseInt(year);

            if (selectedMonth === 4 || selectedMonth === 6 || selectedMonth === 9 || selectedMonth === 11) {
                days = 30;
            } else if (selectedMonth === 2) {
                if ((selectedYear % 4 === 0 && selectedYear % 100 !== 0) || (selectedYear % 400 === 0)) {
                    days = 29;
                } else {
                    days = 28;
                }
            }
        }

        setDaysInMonth([...Array(days).keys()].map(i => `${i + 1}`));
    };

    const handleChange = (name, value) => {
        setForm({
            ...form,
            [name]: value,
        });

        if (name === 'month' || name === 'year') {
            updateDaysInMonth(name === 'month' ? value : form.month, name === 'year' ? value : form.year);
        }

        // Remove error when a valid value is entered
        if (value) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    const validateForm = () => {
        const validationErrors = {};

        if (form.firstName.length < 2) {
            validationErrors.firstName = 'First name must be at least 2 characters long.';
        }
        if (form.lastName.length < 2) {
            validationErrors.lastName = 'Last name must be at least 2 characters long.';
        }
        if (!form.email.includes('@')) {
            validationErrors.email = 'Please enter a valid email address.';
        }
        if (form.password.length < 8) {
            validationErrors.password = 'Password must be at least 8 characters long.';
        }
        if (form.password !== form.confirmPassword) {
            validationErrors.confirmPassword = 'Passwords do not match.';
        }
        if (!form.gender) {
            validationErrors.gender = 'Please select a gender.';
        }

        // Date validation
        if (!form.day) {
            validationErrors.day = 'Please select a day.';
        }
        if (!form.month) {
            validationErrors.month = 'Please select a month.';
        }
        if (!form.year) {
            validationErrors.year = 'Please select a year.';
        }
        if (!form.day || !form.month || !form.year) {
            validationErrors.date = 'Please select a valid date of birth.';
        }

        return validationErrors;
    };

    const handleRegister = () => {
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length === 0) {
            // Get the current date
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
            const currentDay = today.getDate();

            // Extract date of birth from form
            const birthYear = parseInt(form.year);
            const birthMonth = parseInt(form.month);
            const birthDay = parseInt(form.day);

            // Calculate the age
            let age = currentYear - birthYear;
            if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
                age--; // Adjust age if birthday hasn't occurred yet this year
            }

            // Format the full date of birth
            const dateOfBirth = `${birthDay.toString().padStart(2, '0')}-${birthMonth.toString().padStart(2, '0')}-${birthYear}`;


            const fullName = form.firstName + form.lastName;
            const gender = form.gender;
            const email = form.email;
            const password = form.password;

            fetch(`${EXPO_PUBLIC_API_URL}/RegisterPlayer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: fullName,
                  fullName,
                  gender,
                  age,
                  dateOfBirth,
                  email,
                  password
                }),
              })
            .then((data) => data.json())
            .then((data) => {
                if(data !== 'error'){
                    dispatch(setCurrentUser(data))
                    navigation.replace('Home');
                }
            })
            .catch(err => {console.log(err)})

        } else {
            setErrors(validationErrors);
        }
    };

    const renderInput = (placeholder, name, secureTextEntry = false, keyboardType = 'default') => (
        <View style={styles.inputContainer}>
            <TextInput
                style={[
                    styles.input,
                    errors[name] && styles.inputError,
                ]}
                placeholder={errors[name] ? `${placeholder} *` : placeholder}
                placeholderTextColor={errors[name] ? themeColors.error : themeColors.placeholder}
                value={form[name]}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                onChangeText={(value) => handleChange(name, value)}
            />
        </View>
    );

    const currentYear = new Date().getFullYear();
    const years = [...Array(currentYear - 1899).keys()].map(i => `${currentYear - i}`);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.innerContainer}>
                <Text style={[styles.title, { color: themeColors.text }]}>Register</Text>

                {renderInput('First Name', 'firstName')}
                {renderInput('Last Name', 'lastName')}
                {renderInput('Email', 'email', false, 'email-address')}
                {renderInput('Password', 'password', true)}
                {renderInput('Confirm Password', 'confirmPassword', true)}

                <View style={styles.inputContainer}>
                    <RNPickerSelect
                        placeholder={{
                            label: 'Select Gender',
                            value: ''
                        }}
                        onValueChange={(value) => handleChange('gender', value)}
                        items={[
                            { label: 'Male', value: 'male' },
                            { label: 'Female', value: 'female' },
                            { label: 'Other', value: 'other' },
                        ]}
                        style={{
                            inputIOS: [
                                styles.input,
                                errors.gender && styles.inputError,
                            ],
                            inputAndroid: [
                                styles.input,
                                errors.gender && styles.inputError,
                            ]
                        }}
                        value={form.gender}
                        onOpen={() => {
                            setErrors({
                                ...errors,
                                gender: '',
                            });
                        }}
                    />
                    {errors.gender && <Text style={styles.errorText}>*</Text>}
                </View>

                <View style={styles.dateContainer}>
                    <View style={styles.pickerWrapper}>
                        <RNPickerSelect
                            placeholder={{ label: 'Day', value: '' }}
                            onValueChange={(value) => handleChange('day', value)}
                            items={daysInMonth.map(day => ({ label: day, value: day }))}
                            style={pickerSelectStyles(errors.day || errors.date, themeColors)}
                            value={form.day}
                        />
                        {errors.day && <Text style={styles.errorText}>*</Text>}
                    </View>
                    <View style={styles.pickerWrapper}>
                        <RNPickerSelect
                            placeholder={{ label: 'Month', value: '' }}
                            onValueChange={(value) => handleChange('month', value)}
                            items={[...Array(12).keys()].map(i => ({ label: `${i + 1}`, value: `${i + 1}` }))}
                            style={pickerSelectStyles(errors.month || errors.date, themeColors)}
                            value={form.month}
                        />
                        {errors.month && <Text style={styles.errorText}>*</Text>}
                    </View>
                    <View style={styles.pickerWrapper}>
                        <RNPickerSelect
                            placeholder={{ label: 'Year', value: '' }}
                            onValueChange={(value) => handleChange('year', value)}
                            items={years.map(year => ({ label: year, value: year }))}
                            style={pickerSelectStyles(errors.year || errors.date, themeColors)}
                            value={form.year}
                        />
                        {errors.year && <Text style={styles.errorText}>*</Text>}
                    </View>
                </View>

                <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.PRIMARY_BUTTON }]} onPress={handleRegister}>
                    <Text style={[styles.buttonText]}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={[styles.loginLink, { color: themeColors.PRIMARY_BUTTON }]}>
                        Already have an account? Login
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        height: 50,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    inputError: {
        borderColor: 'red',
    },
    button: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginVertical: 20,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color:'white'
    },
    loginLink: {
        textAlign: 'center',
        fontSize: 16,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pickerWrapper: {
        flex: 1,
        marginHorizontal: 5,
    },
    errorText: {
        color: 'red',
        position: 'absolute',
        right: 10,
        top: 15,
    },
});

const pickerSelectStyles = (hasError, themeColors) => ({
    inputIOS: {
        height: 50,
        borderColor: hasError ? 'red' : themeColors.inputBorder,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        fontSize: 16,
        color: themeColors.text,
    },
    inputAndroid: {
        height: 50,
        borderColor: hasError ? 'red' : themeColors.inputBorder,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        fontSize: 16,
        color: themeColors.text,
    },
});

export default RegisterScreen;
