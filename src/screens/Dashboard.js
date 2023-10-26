import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // You may need to install this icon library
import { theme } from '../core/theme';


const SellerDashboard = ({ navigation }) => {
  const buttonsData = [
    { label: 'Manage Products', icon: 'md-list', to: "ManageProducts" },
    { label: 'Add Product', icon: 'md-add', to: "AddProduct" },
    { label: 'See Orders', icon: 'md-cart', to: "SeeOrders" },
  ];

  return (
    <View style={styles.container}>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: 150,
    height: 150,
    margin: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.primary, // You can change the background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SellerDashboard;
