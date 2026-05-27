import { View, Text, StyleSheet, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import ButtonSubmitCancel from './ButtonSubmitCancel';
import { useDispatch, useSelector } from 'react-redux';
import { clearLastAssessment, submitAssessment } from '../redux/assessmentsSlice';
import { router } from 'expo-router';

export default function AssessmentSubmitForm() {
    const dispatch = useDispatch();
    const [err, setErr] = useState('')
    const [commentValue, chengeCommentValue] = useState('-');

    const number_info = useSelector(state => state.assessment.last_assessment?.number_info)
    const userWorkLocation = useSelector(state => state.user.workLocation)
    const last_assessment_image = useSelector(state => state.assessment.last_assessment_image)

    const [resultDropOpen, setResultDropOpen] = useState(false);
    const [resultValue, setResultValue] = useState(null);
    const [resultItems, setResultItems] = useState([
        { label: 'Все в порядку', value: 'OK' },
        { label: 'Є проблеми з документами', value: 'HAS_PROBLEMS' },
        { label: 'В проїзді відмовлено', value: 'REJECTED' }
    ]);

    const [directionResultOpen, setDirectionResultOpen] = useState(false);
    const [directionValue, setDirectionValue] = useState(null);
    const [directionItems, setDirectionItems] = useState([
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

    const handlePressOutside = () => {
        Keyboard.dismiss();
    };
    useEffect(() => {
        setErr('');
    }, [commentValue, directionValue, resultValue])
    

    const handleSubmit = () => {
        if(!commentValue){
            setErr(`Поставте '-' в полі Коментаря, якщо не потрібен.`);
            return
        }
        if(!directionValue){
            setErr(`Виберіть напрям руху т\\з, яке перевіряєте.`);
            return
        }
        if(!resultValue){
            setErr(`Виберіть результат перевірки.`);
            return
        }
        if(commentValue && resultValue && directionValue)
        {
            let formdata = new FormData();
            formdata.append('image', last_assessment_image);
            dispatch(submitAssessment({digits: number_info.digits, result: resultValue, comment: commentValue, location: userWorkLocation, direction: directionValue, formdata: formdata}));
            dispatch(clearLastAssessment()); 
            router.replace('/assessment/status')
        }
    }

    return (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
            <View style={styles.formContainer}>
                <View style={styles.itemRowContainer}>
                    <View style={styles.leftRowContainer}>
                        <MaterialCommunityIcons name="comment-alert-outline" size={30} color="yellow" />
                    </View>
                    <View style={styles.rightRowContainer}>
                        <Text style={styles.rightRowTitle}>Коментар:</Text>
                        <TextInput
                            editable
                            multiline
                            numberOfLines={5}
                            maxLength={200}
                            onChangeText={text => chengeCommentValue(text)}
                            defaultValue={commentValue}
                            style={{ padding: 10, backgroundColor: '#9ba1a7', borderRadius: 10, height: '50%' }}
                        />
                    </View>
                </View>
                <View style={styles.itemRowContainer}>
                    <View style={styles.leftRowContainer}>
                        <MaterialCommunityIcons name="location-exit" size={30} color="red" />
                    </View>
                    <View style={styles.rightRowContainer}>
                        <Text style={styles.rightRowTitle}>Локація перевірки:</Text>
                        <Text style={styles.rightRowText}>Київ:</Text>
                        {/* <DropDownPicker
                        open={directionResultOpen}
                        value={directionValue}
                        items={directionItems}
                        setOpen={setDirectionResultOpen}
                        setValue={setDirectionValue}
                        setItems={setDirectionItems}
                        theme="DARK"
                    /> */}
                    </View>
                </View>
                <View style={styles.itemRowContainer}>
                    <View style={styles.leftRowContainer}>
                        <MaterialCommunityIcons name="location-enter" size={30} color="green" />
                    </View>
                    <View style={styles.rightRowContainer}>
                        <Text style={styles.rightRowTitle}>Напрям руху т\з:</Text>
                        <View style={{ zIndex: 2 }}>
                            <DropDownPicker
                                open={directionResultOpen}
                                value={directionValue}
                                items={directionItems}
                                setOpen={setDirectionResultOpen}
                                setValue={setDirectionValue}
                                setItems={setDirectionItems}
                                theme="DARK"
                                dropDownDirection='TOP'
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.itemRowContainer}>
                    <View style={styles.leftRowContainer}>
                        <Ionicons name="checkmark-done-sharp" size={30} color="green" />
                    </View>
                    <View style={styles.rightRowContainer} >
                        <Text style={styles.rightRowTitle}>Результат перевірки:</Text>
                        <DropDownPicker
                            open={resultDropOpen}
                            value={resultValue}
                            items={resultItems}
                            setOpen={setResultDropOpen}
                            setValue={setResultValue}
                            setItems={setResultItems}
                            theme="DARK"
                        />
                    </View>
                </View>
                <View style={styles.errContainer}>
                    <Text style={styles.errText}>{err}</Text>
                </View>
                <ButtonSubmitCancel submitAction={handleSubmit} buttonHidden={'Cancel'} />
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        // backgroundColor: 'pink',
        padding: 10,
        borderRadius: 5,
        marginBottom: 25,
    },
    itemRowContainer: {
        flex: 3,
        flexDirection: 'row',
        padding: 5
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
        justifyContent: 'center',
    },
    rightRowTitle: {
        fontSize: 24,
        color: 'gray',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 5,
        zIndex: 1
    },
    rightRowText: {
        fontSize: 20,
        color: 'gray',
        padding: 5,
        textAlign: 'center'
    },
    errContainer:{
        flex: 2,
        justifyContent: 'center',
        padding: 10,
    },
    errText:{
        fontSize: 22,
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
        
    }
})