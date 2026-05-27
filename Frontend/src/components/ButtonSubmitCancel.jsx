import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'

const ButtonSubmitCancel = ({submitAction, cancelAction, buttonHidden, buttonSubmitText, buttonCancelText}) => {
    return (
        <View style={styles.itemRowContainer}>
            {
                buttonHidden != 'Submit' ?
                <TouchableOpacity style={styles.buttonContinue} onPress={submitAction}>
                    <Text style={styles.buttonText}>{buttonSubmitText ? buttonSubmitText : 'Продовжити'}</Text>
                </TouchableOpacity>
                : <></>
            }
            {
                buttonHidden != 'Cancel' ? 
                <TouchableOpacity style={styles.buttonCancel} onPress={cancelAction}>
                    <Text style={styles.buttonText}>{buttonCancelText ? buttonCancelText : 'Відмінити'}</Text>
                </TouchableOpacity>
                : <></>
            }

        </View>
    )
}

const styles = StyleSheet.create({
    itemRowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'space-around',
        marginBottom: 10
    },
    buttonContinue: {
        // flex: 1,
        backgroundColor: '#228653',
        padding: 10,
        borderRadius: 5,
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonCancel: {
        // flex: 1,
        backgroundColor: '#980023',
        padding: 10,
        borderRadius: 5,
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
})

export default ButtonSubmitCancel