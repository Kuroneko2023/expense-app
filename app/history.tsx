import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { PieChart } from "react-native-chart-kit";
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width;

export default function HistoryScreen() {
  const [chartData, setChartData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      // ดึงข้อมูลจาก API ตัวเดิม
      const response = await axios.get('http://10.1.200.55:8000/transactions');
      const data = response.data.data;
      
      // 1. กรองเฉพาะ "รายจ่าย" (expense)
      const expenses = data.filter(item => item.type === 'expense');
      const sum = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      setTotalExpense(sum);

      // 2. จัดกลุ่มข้อมูลตามหมวดหมู่ (Grouping)
      const grouped = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {});

      // 3. กำหนดสีให้แต่ละหมวดหมู่ (ใช้โทนเดียวกับหน้า Home)
      const colorPalette = ['#FF7675', '#74B9FF', '#55E6C1', '#FDCB6E', '#A29BFE', '#FAB1A0', '#636E72'];
      
      const formattedData = Object.keys(grouped).map((key, index) => ({
        name: key,
        population: grouped[key],
        color: colorPalette[index % colorPalette.length],
        legendFontColor: "#495057",
        legendFontSize: 13
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error("ดึงข้อมูลประวัติไม่สำเร็จ:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>วิเคราะห์รายจ่าย 📊</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Card แสดงยอดรวม */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>รายจ่ายรวมทั้งหมด</Text>
          <Text style={styles.summaryValue}>฿ {totalExpense.toLocaleString()}</Text>
        </View>

        {/* ส่วนของกราฟ Pie Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>สัดส่วนตามหมวดหมู่</Text>
          
          {chartData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <PieChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[10, 0]}
                absolute // แสดงเป็นตัวเลขเงินจริงในกราฟ
              />
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="bar-chart-outline" size={50} color="#DEE2E6" />
              <Text style={styles.emptyText}>ยังไม่มีข้อมูลรายจ่ายให้วิเคราะห์</Text>
            </View>
          )}
        </View>

        {/* คำแนะนำสั้นๆ */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color="#FBC02D" />
          <Text style={styles.tipText}>
            ลองตรวจสอบหมวดหมู่ที่ใช้เงินเยอะที่สุด เพื่อวางแผนประหยัดในเดือนถัดไปนะครับ
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { marginTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1A1A1A' },
  
  summaryCard: { 
    marginHorizontal: 20, 
    backgroundColor: '#FF7675', 
    borderRadius: 25, 
    padding: 25, 
    elevation: 5,
    shadowColor: '#FF7675',
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  summaryValue: { color: '#FFF', fontSize: 32, fontWeight: '800', marginTop: 5 },

  chartSection: { 
    marginTop: 25, 
    marginHorizontal: 20, 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436', marginBottom: 15 },
  chartWrapper: { alignItems: 'center' },
  
  tipCard: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginTop: 20, 
    backgroundColor: '#FFF9C4', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center' 
  },
  tipText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#856404', fontWeight: '500' },
  
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 10, color: '#ADB5BD', fontSize: 14 }
});