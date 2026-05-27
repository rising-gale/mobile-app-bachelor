import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar, TouchableOpacity } from 'react-native'
import { Drawer } from 'expo-router/drawer'
import { DrawerToggleButton } from "@react-navigation/drawer"
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getAssessmentHistory, getHistoryPageCount } from '../../../src/redux/assessmentsSlice';
import PaginatorComponent from '../../../src/components/PaginatorComponent';


const HistoryPage = () => {
  const history_items = useSelector(state => state.assessment.history);
  const pageCount = useSelector(state => state.assessment.historyPageCount);
  const dispatch = useDispatch();
  let [curPage, setCurPage] = useState(1);

  // console.log(history_items)
  // console.log(pageCount)

  useEffect(() => {
    dispatch(getAssessmentHistory({ pageNumber: curPage }));
    dispatch(getHistoryPageCount());
  }, [curPage]);

  const nextPage = () => {
    if (curPage < pageCount) setCurPage(curPage + 1)
  }
  const prevPage = () => {
    if (curPage > 1) setCurPage(curPage - 1)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Drawer.Screen options={{ headerShown: true, title: 'Ваша історія перевірок', headerStyle: { backgroundColor: '#6D7992' }, headerLeft: () => <DrawerToggleButton tintColor='#080D17' /> }} />
      <ScrollView style={styles.scrollView}>
        {
          history_items && history_items?.map((item) => {
            let date = new Date(item.date_time)
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let hour = date.getHours();
            let minutes = date.getMinutes();
            date = `${day}-${month}-${year} ${hour}:${minutes}`;
            return (
              <TouchableOpacity key={item._id} style={styles.itemContainer} onPress={() => router.push({ pathname: `/(drawer)/history/${item._id}`, params: item })}>
                <Text style={styles.itemText}>{item.digits}</Text>
                <Text style={styles.itemText}>{date}</Text>
              </TouchableOpacity>)
          })
        }
      </ScrollView>
      <PaginatorComponent curPage={curPage} pageCount={pageCount} nextPage={nextPage} prevPage={prevPage} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#181c24'
  },
  scrollView: {
    backgroundColor: '#181c24',
    padding: 10,
  },
  itemContainer: {
    flex: 0.1,
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#ffe',
    margin: 5,
    marginHorizontal: 15,
    padding: 14,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 5
  },


});

export default HistoryPage