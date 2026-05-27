import { View, Text, StyleSheet } from 'react-native'
import { AntDesign } from '@expo/vector-icons';

const CarInfoComponent = ({info}) => {
    
    return (
        <View style={styles.informationContainer}>
            <View style={styles.itemRowContainer}>
                <View style={styles.leftRowContainer}>
                    <AntDesign name="questioncircleo" size={30} color="green" />
                </View>
                <View style={styles.rightRowContainer}>
                    <Text style={styles.rightRowTitle}>Угон</Text>
                    <Text style={styles.rightRowText}>{info.is_stolen ? 'АВТО В УГОНІ!' : 'Не числиться в угоні'}</Text>
                </View>
            </View>
            <View style={styles.itemRowContainer}>
                <View style={styles.leftRowContainer}>
                    <AntDesign name="filetext1" size={30} color="green" />
                </View>
                <View style={styles.rightRowContainer}>
                    <Text style={styles.rightRowTitle}>Реєстрація</Text>
                    <Text style={styles.rightRowText}>{info.operations[0].registered_at} (остання)</Text>
                </View>
            </View>
            <View style={styles.itemRowContainer}>
                <View style={styles.leftRowContainer}>
                    <AntDesign name="car" size={30} color="green" />
                </View>
                <View style={styles.rightRowContainer}>
                    <Text style={styles.rightRowTitle}>Марка, модель, рік</Text>
                    <Text style={styles.rightRowText}>{info.vendor} {info.model}, {info.model_year} року</Text>
                </View>
            </View>
            <View style={styles.itemRowContainer}>
                <View style={styles.leftRowContainer}>
                    <AntDesign name="car" size={30} color="green" />
                </View>
                <View style={styles.rightRowContainer}>
                    <Text style={styles.rightRowTitle}>Зовнішність</Text>
                    <Text style={styles.rightRowText}>{info.operations[0].color.ua}, {info.operations[0].kind.ua}</Text>
                </View>
            </View>
            <View style={styles.itemRowContainer}>
                <View style={styles.leftRowContainer}>
                    <AntDesign name="infocirlceo" size={30} color="green" />
                </View>
                <View style={styles.rightRowContainer}>
                    <Text style={styles.rightRowTitle}>Остання операція</Text>
                    <Text style={styles.rightRowText}>{info.operations[0].operation.ua} ({info.operations[0].department})</Text>
                </View>
            </View>
            <View style={styles.itemRowContainer}>
                <View style={styles.leftRowContainer}>
                    <AntDesign name="enviromento" size={30} color="green" />
                </View>
                <View style={styles.rightRowContainer}>
                    <Text style={styles.rightRowTitle}>Адреса реєстрації</Text>
                    <Text style={styles.rightRowTextBig}>{info.operations[0].address}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    informationContainer: {
        flex: 1,
        // backgroundColor: 'pink',
        padding: 10,
        borderRadius: 5
    },
    itemRowContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 10
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
})

export default CarInfoComponent