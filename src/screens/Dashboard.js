import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // You may need to install this icon library
import { theme } from '../core/theme';
import { windowHeight, windowWidth } from '../constants/dimensions'
import { SimpleLineIcons } from '@expo/vector-icons'
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SellerDashboard = ({ navigation, route }) => {
  const [sellerName, setSellerName] = useState("")
  const buttonsData = [
    { label: 'See Orders', icon: 'md-cart', to: "SeeOrders" },
    { label: 'Manage Products', icon: 'md-list', to: "ManageProducts" },
    { label: 'Add Product', icon: 'md-add', to: "AddProduct" },
  ];

  useEffect(() => {
    AsyncStorage.getItem('sellerName')
    .then((val) => {
      setSellerName(val)
    }).catch(console.log)
  }, [])

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem('sellerId')
          navigation.reset({
            index: 0,
            routes: [{name: 'StartScreen'}]
          })
        }
      }
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logout}>
            <SimpleLineIcons name="logout" color="#fff" size={25}/>
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.headerText}>{sellerName}</Text>
          </View>
        </View>
      </View>
      <View style={styles.gridContainer}>
        {buttonsData.map((button, index) => (
          <TouchableOpacity key={index} style={styles.button} onPress={() => {navigation.navigate(button.to)}}>
            <Ionicons name={button.icon} size={50} color="white" />
            <Text style={styles.label}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    padding: 0,
    margin: 0,
    width: "100%",
    height: windowHeight*0.13,
    alignItems: "center"
  },
  headerContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: windowHeight*0.05,
    alignItems: "center"
  },
  logout: {
    paddingLeft: 25
  },
  header: {
    flex: 1,
    alignItems: "center",
    paddingRight: 20
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
    paddingRight: 20
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  gridContainer: {
    justifyContent: 'flex-start',
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 20,
    borderTopStartRadius: 40,
    borderTopEndRadius: 40,
    height: "100%",
    elevation: 20
    // paddingHorizontal: 40
  },
  button: {
    width: "80%",
    height: 120,
    margin: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.primary, // You can change the background color
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10
  },
  label: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default SellerDashboard;
