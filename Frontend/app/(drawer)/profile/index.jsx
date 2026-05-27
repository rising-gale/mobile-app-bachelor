import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, Button } from 'react-native'
import React, { useState } from 'react'
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from "@react-navigation/drawer"
import { useDispatch, useSelector } from 'react-redux'
import { AntDesign, FontAwesome5, MaterialIcons  } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker'
import { update_user } from '../../../src/redux/usersSlice'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router'

const nameRegex = /^[А-ЯЁІЇЄҐа-яёіїєґA-Za-z]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ProfilePage = () => {
    const dispatch = useDispatch();
    const userInfo = useSelector(state => state.user);
    const [isEditing, setEditing] = useState(false);
    const [newUserData, setNewUserData] = useState(userInfo);
    const [err, setErr] = useState({
        errorText: '',
        errField: 0
    });
    const editUserInfo = () => {
        if(isEditing) {
            if(!emailRegex.test(newUserData?.email))
            {
                setErr({
                    errorText: 'Помилки в email (example@mail.xyz)',
                    errField: 1
                })
                return
            }
            if(!nameRegex.test(newUserData?.name) || !nameRegex.test(newUserData?.surname) || !newUserData.name || !newUserData.surname){
                setErr({
                    errorText: 'Помилки в Імені чи Прізвищі (тільки літери, перша велика)',
                    errField: 2
                })
                return
            }
            if(!locationValue)
            {
                setErr({
                    errorText: 'Оберіть місто праці',
                    errField: 3
                })
                return  
            }
            dispatch(update_user({username: newUserData.username, name: newUserData.name, surname: newUserData.surname, email: newUserData.email, workLocation: locationValue}));
            setEditing(false);
        }
        else setEditing(true);
    }
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
    const cancelEdit = () =>{
        setEditing(false);
    }
    return (
        <View style={styles.container}>
            <Drawer.Screen options={{ headerShown: true, title: 'Ваш профіль', headerStyle: { backgroundColor: '#6D7992' }, headerLeft: () => <DrawerToggleButton tintColor='#080D17' /> }} />
            <View style={styles.informationContainer}>
                <View style={styles.itemRowContainer}>
                    <View style={styles.leftRowContainer}>
                        <AntDesign name="user" size={30} color="green" />
                    </View>
                    <View style={styles.rightRowContainer}>
                        <Text style={styles.rightRowTitle}>Ваш username</Text>
                        <Text style={styles.rightRowText}>{userInfo.username}</Text>
                    </View>
                </View>
                <View style={styles.itemRowContainer}>
                    <View style={styles.leftRowContainer}>
                        <MaterialIcons name="email" size={30} color="green" />
                    </View>
                    <View style={styles.rightRowContainer}>
                        <Text style={styles.rightRowTitle}>Ваш e-mail</Text>
                        {
                            isEditing ?                         
                            <TextInput
                                style={err.errField == 1 ? styles.errInput : styles.input}
                                placeholder="Email"
                                placeholderTextColor='#9B907B'
                                onChangeText={(text) => {
                                    setNewUserData(prev => ({
                                        ...prev,
                                        email: text
                                    }));
                                }}
                                value={newUserData.email}
                            />
                            :  <Text style={styles.rightRowText}>{userInfo.email}</Text>
                        }
                    </View>
                </View>
                <View style={styles.itemRowContainer}>
                    <View style={styles.leftRowContainer}>
                        <FontAwesome5 name="user-check" size={26} color="green" />
                    </View>
                    <View style={styles.rightRowContainer}>
                        <Text style={styles.rightRowTitle}>Ім'я та прізвище</Text>
                        {
                            isEditing ?
                                <View style={{ flexDirection: 'row' }}>
                                    <TextInput
                                        style={err.errField == 2 ? styles.errHalfInput : styles.halfInput}
                                        placeholder="Email"
                                        placeholderTextColor='#9B907B'
                                        onChangeText={(text) => {
                                            setNewUserData(prev => ({
                                                ...prev,
                                                name: text
                                            }));
                                        }}
                                        value={newUserData.name}
                                    />
                                    <TextInput
                                        style={err.errField == 2 ? styles.errHalfInput : styles.halfInput}
                                        placeholder="Surname"
                                        placeholderTextColor='#9B907B'
                                        onChangeText={(text) => {
                                            setNewUserData(prev => ({
                                                ...prev,
                                                surname: text
                                            }));
                                        }}
                                        value={newUserData.surname}
                                    />
                                </View>
                                :
                                <Text style={styles.rightRowText}>{userInfo.name} {userInfo.surname}</Text>
                        }
                    </View>
                </View>
                <View style={styles.itemRowContainer}>
                    <View style={styles.leftRowContainer}>
                        <MaterialIcons name="place" size={30} color="green" />
                    </View>
                    <View style={styles.rightRowContainer}>
                        <Text style={styles.rightRowTitle}>Місце праці</Text>
                        {
                            isEditing ?
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
                            style={err.errField == 3 ? {width: '85%', borderColor: 'red'} : {width: '85%'}}
                            dropDownContainerStyle={{width: '85%'}}
                            textStyle={{color: '#9B907B', fontSize: 17}}
                            
                        />
                            :
                            <Text style={styles.rightRowText}>{locationValue ? locationValue : userInfo.workLocation}</Text>  
                        }
                        
                    </View>
                </View>
                <View style={styles.itemRowContainerCenter}>
                    <TouchableOpacity style={isEditing ? styles.buttonSubmit : styles.button} onPress={editUserInfo}>
                        <Text style={styles.buttonText}>{isEditing ? 'Зберегти' : 'Редагувати'}</Text>
                    </TouchableOpacity>
                    {
                        isEditing && 
                        <TouchableOpacity style={styles.buttonCancel} onPress={cancelEdit}>
                            <Text style={styles.buttonText}>Відмінити</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 30, alignItems: 'flex-end'}}>
                <Text style={{fontSize: 29, textDecorationLine: 'underline', color: '#3498db'}} onPress={() => { SecureStore.deleteItemAsync('access_token'); router.replace('/')}}>
                    {'Вийти '}
                </Text>
                <MaterialIcons name="logout" size={29} color='#3498db' />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#181c24',
    },
    informationContainer: {
        width: '100%',
        height: '50%',
        justifyContent: 'center',
        padding: 10,
        flex: 2
    },
    itemRowContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 10
    },

    itemRowContainerCenter:{
        flex: 1,
        padding: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row'
    },

    leftRowContainer: {
        flex: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rightRowContainer: {
        flex: 5,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rightRowTitle: {
        fontSize: 25,
        color: 'gray',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 5,
    },
    rightRowText: {
        fontSize: 20,
        color: 'gray',
        padding: 5,
        textAlign: 'center'
    },
    rightRowTextBig: {
        fontSize: 18,
        color: 'gray',
        padding: 5,
        textAlign: 'justify'
    },

    button: {
        backgroundColor: '#9B907B',
        padding: 10,
        borderRadius: 5,
        width: 160,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },

    buttonCancel: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        width: 160,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },

    buttonSubmit: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        width: 160,
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
})

export default ProfilePage