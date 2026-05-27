import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

const AssessmentHistory = ({ history }) => {

    return (
        <View style={styles.historyContainer}>
            {
                history?.map((item) => {
                    let date = new Date(item.date_time)
                    let day = date.getDate();
                    let month = date.getMonth() + 1;
                    let year = date.getFullYear();
                    let hour = date.getHours();
                    let minutes = date.getMinutes();
                    date = `${day}-${month}-${year} ${hour}:${minutes}`;
                    return (
                        <View style={styles.itemRowContainer} key={item._id}>
                            <View style={styles.leftRowContainer}>
                                {item.result == 'OK' ? <AntDesign name="check" size={32} color="green" /> : <MaterialCommunityIcons name="cancel" size={32} color="red" />}
                            </View>
                            <View style={styles.rightRowContainer}>
                                <View style={styles.rightRowTitleContainer}>
                                    <View style={styles.rightRowTitleIcon}>
                                        <AntDesign name="calendar" size={30} color="beige" />
                                    </View>
                                    <Text style={styles.rightRowTitleText}>{date}</Text>
                                </View>
                                <Text style={styles.rightRowText}>{item.location}</Text>
                            </View>
                        </View>
                    )
                })
            }
        </View>
    )
}
const styles = StyleSheet.create({
    historyContainer: {
        flex: 1,
        marginBottom: 15
    },
    itemRowContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 2,
        borderColor: 'beige'
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
    },
    rightRowTitleContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    rightRowTitleIcon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rightRowTitleText: {
        fontSize: 26,
        color: 'gray',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 8,
    },
    rightRowText: {
        fontSize: 22,
        color: 'gray',
        padding: 5,
        textAlign: 'center'
    },
})
export default AssessmentHistory