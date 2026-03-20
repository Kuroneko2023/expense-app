import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { PieChart } from "react-native-chart-kit";
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const screenWidth = Dimensions.get("window").width;

export default function HistoryScreen() {
  const [chartData, setChartData] = useState([]);
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [totalExpense, setTotalExpense] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const fetchHistory = async () => {
    try {
      const response = await axios.get('https://expense-api-1-hw40.onrender.com');
      const data = response.data.data;

      // กรองข้อมูลตามเดือนที่เลือก (ปีปัจจุบัน)
      const currentYear = new Date().getFullYear();
      const filteredData = data.filter(item => {
        const itemDate = new Date(item.transaction_date);
        return itemDate.getMonth() === selectedMonth && itemDate.getFullYear() === currentYear;
      });

      // 1. ทำข้อมูลสำหรับ Pie Chart (เฉพาะรายจ่าย)
      const expenses = filteredData.filter(item => item.type === 'expense');
      const sum = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      setTotalExpense(sum);

      const categoryGroup = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {});

      const colorPalette = ['#FF7675', '#74B9FF', '#55E6C1', '#FDCB6E', '#A29BFE', '#FAB1A0'];
      const formattedChart = Object.keys(categoryGroup).map((key, index) => ({
        name: key,
        population: categoryGroup[key],
        color: colorPalette[index % colorPalette.length],
        legendFontColor: "#495057",
        legendFontSize: 12
      }));
      setChartData(formattedChart);

      // 2. จัดกลุ่มรายการแยกตามวันที่ (Daily Grouping)
      const dailyGroup = filteredData.sort((a, b) => 
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      ).reduce((acc, curr) => {
        const dateStr = new Date(curr.transaction_date).toLocaleDateString('th-TH', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(curr);
        return acc;
      }, {});
      
      setGroupedTransactions(dailyGroup);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, [selectedMonth]));

  return (
    <View style={styles.container}>
      {/* ส่วนเลือกเดือน */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ประวัติการเงิน 📑</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthSelector}>
          {MONTHS.map((m, index) => (
            <TouchableOpacity 
              key={m} 
              onPress={() => setSelectedMonth(index)}
              style={[styles.monthBtn, selectedMonth === index && styles.monthBtnActive]}
            >
              <Text style={[styles.monthText, selectedMonth === index && styles.monthTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchHistory();}} />}
      >
        {/* Pie Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>สรุปรายจ่ายเดือนนี้: ฿{totalExpense.toLocaleString()}</Text>
          {chartData.length > 0 ? (
            <PieChart
              data={chartData}
              width={screenWidth - 60}
              height={200}
              chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
            />
          ) : <Text style={styles.emptyText}>ไม่มีข้อมูลการใช้จ่ายในเดือนนี้</Text>}
        </View>

        {/* รายการแยกตามวัน */}
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          {Object.keys(groupedTransactions).map((date) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {groupedTransactions[date].map((item, idx) => (
                <View key={idx} style={styles.itemCard}>
                  <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Ionicons name={item.type === 'income' ? 'add' : 'remove'} size={20} color={item.type === 'income' ? '#2E7D32' : '#C62828'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemNote}>{item.note || item.category}</Text>
                    <Text style={styles.itemCat}>{item.category}</Text>
                  </View>
                  <Text style={[styles.itemAmount, { color: item.type === 'income' ? '#2E7D32' : '#C62828' }]}>
                    {item.type === 'income' ? '+' : '-'} ฿{item.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { marginTop: 60, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 15 },
  monthSelector: { flexDirection: 'row', marginBottom: 10 },
  monthBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E9ECEF' },
  monthBtnActive: { backgroundColor: '#0984E3', borderColor: '#0984E3' },
  monthText: { color: '#636E72', fontWeight: '600' },
  monthTextActive: { color: '#FFF' },
  chartCard: { margin: 20, backgroundColor: '#FFF', borderRadius: 25, padding: 20, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436', marginBottom: 10 },
  dayGroup: { marginBottom: 20 },
  dateHeader: { fontSize: 14, fontWeight: '700', color: '#ADB5BD', marginBottom: 10, marginLeft: 5 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemNote: { fontSize: 15, fontWeight: '600', color: '#2D3436' },
  itemCat: { fontSize: 12, color: '#ADB5BD' },
  itemAmount: { fontSize: 15, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#ADB5BD', marginVertical: 20 }
});