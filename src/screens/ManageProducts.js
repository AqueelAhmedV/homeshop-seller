import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BASE_URL } from '../constants/endpoints';
import { AntDesign } from '@expo/vector-icons'
import { StyleSheet } from 'react-native';
import { theme } from '../core/theme';
import { windowWidth, windowHeight } from '../constants/dimensions'
import { ActivityIndicator } from 'react-native';

const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false)

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: "#fff"
    },
    navbar: {
      position: "sticky",
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      height: windowHeight*0.08, // You can adjust the height as needed
      padding: 0,
      margin: 0,
      width: "100%",
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: windowHeight*0.02
    },
    listContainer: {
      alignItems: "center",
      paddingHorizontal: 30,
      flex: 1,
      marginTop: 15
    },
    loading: {
      marginTop: 70
    }
  })


  const fetchData = () => {
    setLoading(true)
    AsyncStorage.getItem("seller")
    .then(JSON.parse)
    .then((seller) => {
        axios.get(`${BASE_URL}/api/product/list-seller/${seller.SellerId}`)
      .then((response) => {
        console.log(response.data)
        setProducts(response.data);
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        console.log(JSON.stringify(error.response));
      });
    })
  }

  useEffect(() => {
    // Fetch data using Axios
   fetchData()
  }, []);

  const handleProductClick = (product) => {
    console.log(product)
    navigation.navigate("EditProduct", {
      _productName: product.ProductName,
      _description: product.Description,
      _prodUnit: product.ProductionUnit,
      _mrp: product.MRP + "",
      _offerPrice: product.OfferPrice? product.OfferPrice + "": "",
      _imageId: product.ImageId,
      _availability: product.Availability,
      _category: product.Category,
      _productId: product.ProductId,
    })
    // Handle click on a product
    // You can navigate to a product detail screen or show more information here
    console.log(`Clicked on product: ${product.ProductName}`);
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleProductClick(item)}>
      <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.ProductName}</Text>
        <Text>Selling Price: &#8377;{item.OfferPrice ?? item.MRP}</Text>
        <Text>Production Unit: {item.ProductionUnit}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    
    <View style={styles.page}>
      <View style={styles.navbar}>
      <View style={styles.headerContainer}>
           <TouchableOpacity style={{
              borderRadius: 10,
              paddingHorizontal: 5,
              paddingTop: 3,
              marginLeft: 10
            }} onPress={() => navigation.goBack()}>
              <AntDesign name="left" size={25} color="white" />
            </TouchableOpacity>
            <View style={{
                alignItems: "center",
                width: "76%"
            }}>
                <Text style={{
                    fontWeight: "bold",
                    fontSize: 24,
                    color: "#fff",
                    paddingLeft: 10
                }}>{"Manage Products"}</Text>
            </View>
          </View>
      </View>
      <View style={styles.listContainer}>
        {loading && <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>}
      {(!loading && products.length === 0) && (
        <View style={{padding: 40, }}>
        <Text style={{fontWeight: 500}}>No products to show</Text>
        </View>
        )}
    {(!loading && products.length > 0) &&  <FlatList
      style={{
        width: "100%",
        flex: 1
      }}
      data={products}
      renderItem={renderProductItem}
      keyExtractor={(item) => item.ProductId.toString()}
    />}
    </View>
    </View>

  );
};

export default ProductList;