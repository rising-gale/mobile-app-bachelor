import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { AntDesign } from '@expo/vector-icons';

const PaginatorComponent = ({ nextPage, prevPage, pageCount, curPage }) => {
    return (
        <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={prevPage}>
                <AntDesign name="verticleright" size={32} color="#9B907B" />
            </TouchableOpacity>
            <Text style={styles.buttonText}>{curPage} / {pageCount}</Text>
            <TouchableOpacity style={styles.button} onPress={nextPage}>
                <AntDesign name="verticleleft" size={32} color="#9B907B" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonsContainer: {
        flexDirection: 'row',
        padding: 5,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 2,
        borderColor: '#9B907B',
        borderRadius: 15
    },
    button: {
        padding: 5,
        marginHorizontal: 10,
        // borderWidth: 2,
        // borderRadius: 15,
    },
    buttonText: {
        fontSize: 28,
        color: '#9B907B'
    }
})

export default PaginatorComponent