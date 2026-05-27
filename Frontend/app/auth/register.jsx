// RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'react-native';
import { useDispatch } from 'react-redux';
import { register } from '../../src/redux/usersSlice';
import DropDownPicker from 'react-native-dropdown-picker';

const defaultVal = {
    errorText: '',
    errField: 0
}

const nameRegex = /^[А-ЯЁІЇЄҐа-яёіїєґA-Za-z]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const RegisterScreen = () => {
    const dispatch = useDispatch();
    const [registerData, setRegData] = useState({})
    const [err, setErr] = useState({
        errorText: '',
        errField: 0
    });

    const [locationResultOpen, setLocationResultOpen] = useState(false);
    const [locationValue, setLocationValue] = useState(null);
    const [locationItems, setLocationItems] = useState([
        { label: 'Київ', value: 'Kyiv' },
        { label: 'Харків', value: 'Kharkiv' },
        { label: 'Одеса', value: 'Odesa' },
        { label: 'Дніпро', value: 'Dnipro' },
        { label: 'Донецьк', value: 'Donetsk' },
        { label: 'Запоріжжя', value: 'Zaporizhzhia' },
        { label: 'Львів', value: 'Lviv' },
        { label: 'Кривий Ріг', value: 'Kryvyi Rih' },
        { label: 'Миколаїв', value: 'Mykolaiv' },
        { label: 'Маріуполь', value: 'Mariupol' },
        { label: 'Вінниця', value: 'Vinnytsia' },
        { label: 'Херсон', value: 'Kherson' },
        { label: 'Полтава', value: 'Poltava' },
        { label: 'Чернігів', value: 'Chernihiv' },
        { label: 'Черкаси', value: 'Cherkasy' },
        { label: 'Житомир', value: 'Zhytomyr' },
        { label: 'Суми', value: 'Sumy' },
        { label: 'Рівне', value: 'Rivne' },
        { label: 'Тернопіль', value: 'Ternopil' },
        { label: 'Луцьк', value: 'Lutsk' }
    ]);

    const handleRegister = () => {
        console.log('registerData:', registerData, locationValue);
        // Тут вы можете добавить ваш код для реальной регистрации
        if(registerData?.username?.length > 25 || registerData?.username?.length < 5 || !registerData.username)
        {
            setErr({
                errorText: 'Юзернейм користувача має бути < 25 символів, але > 5',
                errField: 1
            })
            return
        }
        if(!nameRegex.test(registerData?.name) || !nameRegex.test(registerData?.surname) || !registerData.name || !registerData.surname){
            setErr({
                errorText: 'Помилки в Імені чи Прізвищі (тільки літери, перша велика)',
                errField: 2
            })
            return
        }
        if(!emailRegex.test(registerData?.email))
        {
            setErr({
                errorText: 'Помилки в email (example@mail.xyz)',
                errField: 3
            })
            return
        }
        if(registerData?.password?.length < 1){
            setErr({
                errorText: 'Введіть пароль',
                errField: 4
            })
            return
        }
        if(registerData?.password_repeat?.length < 1){
            setErr({
                errorText: 'Введіть повтор пароля',
                errField: 4
            })
            return
        }
        if(registerData?.password != registerData?.password_repeat){
            setErr({
                errorText: 'Паролі не співпадають',
                errField: 5
            })
            return
        }
        if(!locationValue)
        {
            setErr({
                errorText: 'Оберіть місто праці',
                errField: 6
            })
            return  
        }
        dispatch(register({username: registerData.username, name: registerData.name, surname: registerData.surname, email: registerData.email, password: registerData.password, workLocation: locationValue}));
        router.replace('/auth/status')
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={'light-content'}/>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Створимо аккаунт</Text>
            </View>
            <View style={styles.formContainer}>
                <View style={styles.formRowContainer}>
                    <View style={styles.formRowInputContainer}>
                        <TextInput
                            style={err.errField == 1 ? styles.errInput : styles.input}
                            placeholder="Придумайте собі нікнейм"
                            placeholderTextColor='#9B907B'
                            onChangeText={(text) => {
                                setRegData(prev => ({
                                    ...prev,
                                    username: text
                                }));
                                setErr(defaultVal)
                            }}
                            value={registerData?.username}
                        />
                    </View>
                    <View style={styles.formRowErrorContainer}>
                       {err.errField == 1 && <Text style={styles.errorText}>{err.errorText}</Text>} 
                    </View>
                </View>
                <View style={styles.formRowContainer}>
                    <View style={styles.formRowHalfInputContainer}>
                        <TextInput
                            style={err.errField == 2 ? styles.errHalfInput : styles.halfInput}
                            placeholder="Ваше ім'я"
                            placeholderTextColor='#9B907B'
                            onChangeText={(text) => {
                                setRegData(prev => ({
                                    ...prev,
                                    name: text
                                }));
                                setErr(defaultVal)
                            }}
                            value={registerData?.name}
                        />
                        <TextInput
                            style={err.errField == 2 ? styles.errHalfInput : styles.halfInput}
                            placeholder="Ваше прізвище"
                            placeholderTextColor='#9B907B'
                            onChangeText={(text) => {
                                setRegData(prev => ({
                                    ...prev,
                                    surname: text
                                }));
                                setErr(defaultVal)
                            }}
                            value={registerData?.surname}
                        />
                    </View>
                    <View style={styles.formRowErrorContainer}>
                        {err.errField == 2 && <Text style={styles.errorText}>{err.errorText}</Text>} 
                    </View>
                </View>
                <View style={styles.formRowContainer}>
                    <View style={styles.formRowInputContainer}>
                        <TextInput
                            style={err.errField == 3 ? styles.errInput : styles.input}
                            placeholder="E-mail"
                            placeholderTextColor='#9B907B'
                            onChangeText={(text) => {
                                setRegData(prev => ({
                                    ...prev,
                                    email: text
                                }));
                                setErr(defaultVal)
                            }}
                            value={registerData?.email}
                        />
                    </View>
                    <View style={styles.formRowErrorContainer}>
                        {err.errField == 3 && <Text style={styles.errorText}>{err.errorText}</Text>} 
                    </View>
                </View>
                <View style={styles.formRowContainer}>
                    <View style={styles.formRowInputContainer}>
                        <TextInput
                            style={err.errField == 4 ? styles.errInput : styles.input}
                            placeholder="Пароль"
                            placeholderTextColor='#9B907B'
                            secureTextEntry
                            onChangeText={(text) => {
                                setRegData(prev => ({
                                    ...prev,
                                    password: text
                                }));
                                setErr(defaultVal)
                            }}
                            value={registerData.password}
                        />
                    </View>
                    <View style={styles.formRowErrorContainer}>
                        {err.errField == 4 && <Text style={styles.errorText}>{err.errorText}</Text>} 
                    </View>
                </View>
                <View style={styles.formRowContainer}>
                    <View style={styles.formRowInputContainer}>
                        <TextInput
                            style={err.errField == 5 ? styles.errInput : styles.input}
                            placeholder="Повторіть пароль"
                            placeholderTextColor='#9B907B'
                            secureTextEntry
                            onChangeText={(text) => {
                                setRegData(prev => ({
                                    ...prev,
                                    password_repeat: text
                                }));
                                setErr(defaultVal)
                            }}
                            value={registerData.password_repeat}
                        />
                    </View>
                    <View style={styles.formRowErrorContainer}>
                        {err.errField == 5 && <Text style={styles.errorText}>{err.errorText}</Text>} 
                    </View>
                </View>
                <View style={styles.formRowContainer}>
                    {/* <View style={styles.formRowInputContainer}> */}
                        <DropDownPicker
                            placeholder='Виберіть місто, в якому працюєте'
                            open={locationResultOpen}
                            value={locationValue}
                            items={locationItems}
                            setOpen={setLocationResultOpen}
                            setValue={setLocationValue}
                            setItems={setLocationItems}
                            theme="DARK"
                            dropDownDirection='TOP'
                            style={{width: '85%'}}
                            dropDownContainerStyle={{width: '85%'}}
                            textStyle={{color: '#9B907B', fontSize: 17}}
                            
                        />
                    {/* </View> */}
                    <View style={styles.formRowErrorContainer}>
                        {err.errField == 6 && <Text style={styles.errorText}>{err.errorText}</Text>} 
                    </View>
                </View>
                <View style={styles.formRowContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Зареєструватись!</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                <Text onPress={() => router.back()} style={styles.linkText}>
                    Назад до логіну
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#181c24',
        paddingTop: StatusBar.currentHeight
    },

    titleContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#9B907B',
        marginBottom: 20,
    },

    formContainer: {
        flex: 6,
        justifyContent: 'center',
        alignItems: 'center',
        // borderWidth: 2,
        // borderRadius: 5,
        padding: 10
    },

    formRowContainer: {
        flex: 1
    },
    formRowInputContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    formRowHalfInputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    formRowErrorContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        textAlign: 'justify',
        padding: 5
    },

    bottomContainer: {
        flex: 2,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    input: {
        height: 45,
        borderColor: 'gray',
        borderWidth: 1,
        // marginBottom: 10,
        paddingLeft: 10,
        width: 300,
        borderRadius: 5,
        color: '#9B907B',
        fontSize: 18,
    },
    halfInput: {
        height: 45,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginHorizontal: 5,
        width: '45%',
        color: '#9B907B',
        fontSize: 18,
    },
    errInput: {
        height: 45,
        borderColor: 'red',
        borderWidth: 1,
        // marginBottom: 10,
        paddingLeft: 10,
        width: 300,
        borderRadius: 5,
        color: '#9B907B',
        fontSize: 18,
    },
    errHalfInput: {
        height: 45,
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginHorizontal: 5,
        width: '45%',
        color: '#9B907B',
        fontSize: 18,
    },
    button: {
        backgroundColor: '#27ae60',
        padding: 10,
        borderRadius: 5,
        width: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    linkText: {
        marginTop: 20,
        color: '#27ae60',
        fontSize: 17,
        textDecorationLine: 'underline',
    },

});

export default RegisterScreen;
