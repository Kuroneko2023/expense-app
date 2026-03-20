import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // ใช้ไอคอนมาตรฐานสวยๆ
import { View, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // ปิด Header ด้านบน (เราทำเองในหน้า index สวยกว่า)
        tabBarActiveTintColor: '#0984E3',   // สีไอคอนตอนที่กดเลือก (สีฟ้าโปร)
        tabBarInactiveTintColor: '#ADB5BD', // สีไอคอนตอนไม่ได้เลือก (สีเทา)
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,           // เอาเส้นขีดด้านบนออก
          elevation: 20,               // ใส่เงาให้ดูมีมิติ (Android)
          shadowColor: '#000',         // ใส่เงา (iOS)
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 88 : 65, // ปรับความสูงตามระบบปฏิบัติการ
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 5,
        },
      }}>
      
      {/* หน้าแรก (หน้าบันทึกรายการที่เราทำไว้) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าแรก',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* หน้าประวัติ (ที่เราจะทำกราฟวงกลม) */}
      <Tabs.Screen
        name="history" 
        options={{
          title: 'ประวัติ',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* หน้าตั้งค่า (เผื่อไว้ขยายผล) */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'ตั้งค่า',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}