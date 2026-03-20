import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar, Modal } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; // เพิ่มระบบสั่น

export default function HomeScreen() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('expense');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const CATEGORIES = ['อาหาร', 'เดินทาง', 'ช้อปปิ้ง', 'บิล/ค่าไฟ', 'สุขภาพ', 'ให้เงิน', 'อื่นๆ'];

  // 2. ระบบ Quick Notes (เคมีตัวที่ 2)
  const QUICK_NOTES = {
    'อาหาร': ['มื้อเที่ยง', 'กาแฟ', 'เซเว่น', 'อกไก่'],
    'เดินทาง': ['BTS', 'วินมอเตอร์ไซค์', 'น้ำมัน', 'Grab'],
    'ช้อปปิ้ง': ['ของใช้', 'เสื้อผ้า', 'Shopee'],
    'สุขภาพ': ['ค่ายา', 'ฟิตเนส'],
    'อื่นๆ': ['ทำบุญ', 'ของขวัญ']
  };

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

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style);
  };

  const submitTransaction = async () => {
    if (!amount || !category) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
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
      
      // สั่นแจ้งเตือนว่าบันทึกสำเร็จ
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
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
      
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcomeText}>สวัสดีครับ! 👋</Text>
          <Text style={styles.headerTitle}>จัดการเงินวันนี้</Text>
        </View>
        <TouchableOpacity style={styles.profileCircle} onPress={() => triggerHaptic()}>
          <Ionicons name="person" size={20} color="#0984E3" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card (เคมีตัวที่ 3: ปรับสีให้ดูมีมิติ) */}
        <View style={styles.mainCard}>
          <Text style={styles.balanceLabel}>ยอดเงินคงเหลือทั้งสิ้น</Text>
          <Text style={styles.balanceValue}>฿ {balance.toLocaleString()}</Text>
          
          <View style={styles.miniStats}>
            <View style={styles.statItem}>
              <Ionicons name="arrow-up-circle" size={18} color="#55E6C1" />
              <Text style={styles.statText}> ฿{income.toLocaleString()}</Text>
            </View>
            <View style={[styles.statItem, {marginLeft: 20}]}>
              <Ionicons name="arrow-down-circle" size={18} color="#FF7675" />
              <Text style={styles.statText}> ฿{expense.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>บันทึกรายการ</Text>
          
          <View style={styles.inputCard}>
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                onPress={() => { setType('expense'); triggerHaptic(); }}
                style={[styles.typeBtn, type === 'expense' && styles.btnExpense]}>
                <Text style={[styles.btnText, type === 'expense' && styles.textActive]}>รายจ่าย</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => { setType('income'); triggerHaptic(); }}
                style={[styles.typeBtn, type === 'income' && styles.btnIncome]}>
                <Text style={[styles.btnText, type === 'income' && styles.textActive]}>รายรับ</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="cash-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
              <TextInput 
                style={styles.textInput} 
                placeholder="0.00" 
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <TouchableOpacity 
              style={styles.dropdownTrigger} 
              onPress={() => { setIsModalVisible(true); triggerHaptic(); }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="pricetag-outline" size={20} color="#0984E3" style={{ marginRight: 10 }} />
                <Text style={[styles.dropdownText, !category && { color: '#ADB5BD' }]}>
                  {category || 'เลือกหมวดหมู่...'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#ADB5BD" />
            </TouchableOpacity>

            {/* Quick Notes Section (เคมีตัวที่ 2) */}
            {category && QUICK_NOTES[category] && (
              <View style={styles.quickNoteContainer}>
                {QUICK_NOTES[category].map((qNote) => (
                  <TouchableOpacity 
                    key={qNote} 
                    style={styles.quickNoteBtn}
                    onPress={() => { setNote(qNote); triggerHaptic(); }}
                  >
                    <Text style={styles.quickNoteText}>{qNote}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Ionicons name="create-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
              <TextInput 
                style={styles.textInput} 
                placeholder="โน้ตย่อ"
                value={note}
                onChangeText={setNote}
              />
            </View>

            <TouchableOpacity style={styles.mainAddBtn} onPress={submitTransaction}>
              <Text style={styles.mainAddBtnText}>บันทึกรายการลงสมุด</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.recentSection}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 25}}>
            <Text style={styles.sectionTitle}>รายการล่าสุด</Text>
            <TouchableOpacity onPress={() => triggerHaptic()}>
              <Text style={{color: '#0984E3', fontWeight: '600'}}>ดูทั้งหมด</Text>
            </TouchableOpacity>
          </View>

          {transactions.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={[styles.iconCircle, {backgroundColor: item.type === 'income' ? '#E8F5E9' : '#FFEBEE'}]}>
                <Ionicons 
                  name={item.type === 'income' ? 'arrow-up' : 'arrow-down'} 
                  size={20} 
                  color={item.type === 'income' ? '#2E7D32' : '#C62828'} 
                />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNoteText}>{item.note || item.category}</Text>
                <Text style={styles.itemCategoryText}>{item.category}</Text>
              </View>
              <Text style={[styles.itemPrice, {color: item.type === 'income' ? '#2E7D32' : '#C62828'}]}>
                {item.type === 'income' ? '+' : '-'} ฿{item.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={{height: 100}} />
      </ScrollView>

      {/* Modal Dropdown */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
              <Text style={styles.modalTitle}>เลือกหมวดหมู่</Text>
            </View>
            <ScrollView>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(cat);
                    setIsModalVisible(false);
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                >
                  <Text style={[styles.modalItemText, category === cat && styles.modalItemActive]}>
                    {cat}
                  </Text>
                  {category === cat && <Ionicons name="checkmark-circle" size={20} color="#0984E3" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 25 },
  welcomeText: { fontSize: 14, color: '#6C757D', fontWeight: '500' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  profileCircle: { width: 40, height: 40, backgroundColor: '#E1F5FE', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  mainCard: { backgroundColor: '#1e293b', borderRadius: 30, padding: 30, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  balanceLabel: { color: '#B2BEC3', fontSize: 14, fontWeight: '600', marginBottom: 5 },
  balanceValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  miniStats: { flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.2)' },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436' },
  inputCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  typeSelector: { flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 15, padding: 5, marginBottom: 20 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  btnExpense: { backgroundColor: '#FF7675' },
  btnIncome: { backgroundColor: '#55E6C1' },
  btnText: { fontWeight: '600', color: '#6C757D' },
  textActive: { color: '#fff', fontWeight: '700' },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F3F5', marginBottom: 15 },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#2D3436' },
  
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E9ECEF', marginBottom: 15 },
  dropdownText: { fontSize: 16, color: '#2D3436', fontWeight: '500' },

  // Quick Notes Styles
  quickNoteContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  quickNoteBtn: { backgroundColor: '#E1F5FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#B3E5FC' },
  quickNoteText: { color: '#0984E3', fontSize: 12, fontWeight: '600' },

  mainAddBtn: { backgroundColor: '#0984E3', paddingVertical: 16, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  mainAddBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  itemCard: { backgroundColor: '#FFF', flexDirection: 'row', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 2 },
  iconCircle: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemInfo: { flex: 1 },
  itemNoteText: { fontSize: 16, fontWeight: '600', color: '#2D3436' },
  itemCategoryText: { fontSize: 12, color: '#ADB5BD', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingBottom: 40, maxHeight: '50%' },
  modalHeader: { alignItems: 'center', paddingVertical: 15 },
  modalIndicator: { width: 40, height: 5, backgroundColor: '#E9ECEF', borderRadius: 3, marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F8F9FA' },
  modalItemText: { fontSize: 16, color: '#495057' },
  modalItemActive: { color: '#0984E3', fontWeight: '700' },
});