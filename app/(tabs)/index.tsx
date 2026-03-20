import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import axios from 'axios';

export default function HomeScreen() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('expense');

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://10.1.200.55:8000/transactions');
      setTransactions(response.data.data); 
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ:", error.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const submitTransaction = async () => {
    if (!amount || !category) {
      alert('กรุณากรอกข้อมูลให้ครบครับ');
      return;
    }
    try {
      const newData = {
        type,
        amount: parseFloat(amount),
        category,
        note,
        transaction_date: new Date().toISOString()
      };
      await axios.post('http://10.1.200.55:8000/transactions', newData);
      setAmount(''); setCategory(''); setNote('');
      fetchTransactions();
    } catch (error) {
      alert('บันทึกไม่สำเร็จ');
    }
  };

  const calculateBalance = () => {
    let income = 0; let expense = 0;
    transactions.forEach(item => {
      if (item.type === 'income') income += item.amount;
      else expense += item.amount;
    });
    return { balance: income - expense, income, expense };
  };

  const { balance, income, expense } = calculateBalance();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</Text>
      </View>

      {/* Dashboard Card */}
      <View style={styles.mainCard}>
        <Text style={styles.balanceLabel}>ยอดเงินคงเหลือทั้งสิ้น</Text>
        <Text style={styles.balanceValue}>฿ {balance.toLocaleString()}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>รายรับ</Text>
            <Text style={styles.statIncome}>+ ฿{income.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>รายจ่าย</Text>
            <Text style={styles.statExpense}>- ฿{expense.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>เพิ่มรายการใหม่</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, type === 'income' && styles.tabIncomeActive]} 
              onPress={() => setType('income')}>
              <Text style={[styles.tabText, type === 'income' && styles.activeTabText]}>รายรับ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, type === 'expense' && styles.tabExpenseActive]} 
              onPress={() => setType('expense')}>
              <Text style={[styles.tabText, type === 'expense' && styles.activeTabText]}>รายจ่าย</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            <TextInput style={styles.input} placeholder="หมวดหมู่ (เช่น อาหาร)" value={category} onChangeText={setCategory} />
            <TextInput style={[styles.input, { borderBottomWidth: 0 }]} placeholder="บันทึกช่วยจำ" value={note} onChangeText={setNote} />
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={submitTransaction}>
            <Text style={styles.addBtnText}>บันทึกรายการ</Text>
          </TouchableOpacity>
        </View>

        {/* List Section */}
        <Text style={styles.sectionTitle}>ประวัติรายการ</Text>
        {transactions.length > 0 ? (
          [...transactions].reverse().map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={[styles.iconCircle, { backgroundColor: item.type === 'income' ? '#E8F5E9' : '#FFEBEE' }]}>
                <Text>{item.type === 'income' ? '💰' : '🛒'}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNoteText}>{item.note || item.category}</Text>
                <Text style={styles.itemCategoryText}>{item.category}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: item.type === 'income' ? '#2E7D32' : '#C62828' }]}>
                {item.type === 'income' ? '+' : '-'} {item.amount.toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>ยังไม่มีรายการของเดือนนี้</Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  topHeader: { marginTop: 60, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  dateText: { fontSize: 16, color: '#6C757D', fontWeight: '500' },
  
  mainCard: { backgroundColor: '#2D3436', borderRadius: 24, padding: 25, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  balanceLabel: { color: '#B2BEC3', fontSize: 14, fontWeight: '600', marginBottom: 5 },
  balanceValue: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#636E72', paddingTop: 15 },
  statBox: { flex: 1 },
  statLabel: { color: '#B2BEC3', fontSize: 12, marginBottom: 4 },
  statIncome: { color: '#55E6C1', fontSize: 16, fontWeight: '700' },
  statExpense: { color: '#FF7675', fontSize: 16, fontWeight: '700' },
  divider: { width: 1, backgroundColor: '#636E72', marginHorizontal: 15 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436', marginTop: 25, marginBottom: 15 },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#EDF2F7' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F3F5', borderRadius: 12, padding: 4, marginBottom: 15 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText: { fontWeight: '600', color: '#6C757D' },
  activeTabText: { color: '#FFFFFF' },
  tabIncomeActive: { backgroundColor: '#2E7D32' },
  tabExpenseActive: { backgroundColor: '#C62828' },
  
  inputGroup: { backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 15 },
  input: { paddingVertical: 12, fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
  addBtn: { backgroundColor: '#0984E3', paddingVertical: 15, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  addBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  itemCard: { backgroundColor: '#FFF', flexDirection: 'row', padding: 15, borderRadius: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemInfo: { flex: 1 },
  itemNoteText: { fontSize: 16, fontWeight: '600', color: '#2D3436' },
  itemCategoryText: { fontSize: 12, color: '#ADB5BD', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#ADB5BD', marginTop: 20 }
});