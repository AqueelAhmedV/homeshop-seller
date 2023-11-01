import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, TextInput, LogBox, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BASE_URL } from '../constants/endpoints';
import Btn from '../components/Button';
import { FontAwesome } from '@expo/vector-icons'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import DatePicker from 'react-native-date-picker'
import { Alert, StyleSheet } from 'react-native';
import { theme } from '../core/theme';
import { AntDesign, Ionicons as Icon } from '@expo/vector-icons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { windowWidth, windowHeight } from '../constants/dimensions'

const ProductList = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 3600*24*30*1000))
  const [toDate, setToDate] = useState(new Date())
  const [toOpen, setToOpen] = useState(false)
  const [fromOpen, setFromOpen] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(false)

  const results = useMemo(() => {
    return orders.sort((a, b) => {
      return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }).filter((o) => JSON.stringify(o).toLowerCase().includes(searchText.toLowerCase()))
  }, [orders, searchText])

  const searchRef = useRef(null)

  const fetchData = (currDate) => {
    setLoading(true)
    AsyncStorage.getItem("sellerId")
    .then((sellerId) => {
        console.log(sellerId)
        axios.post(`${BASE_URL}/api/order/list`, {
            from: fromDate,
            to: currDate ?? toDate,
            sellerId,
            pinCodes: ['123456']
        })
      .then((response) => {
        // console.log(response)
        setLoading(false)
        setOrders(response.data);
      })
      .catch((error) => {
        setLoading(false)
        console.log(JSON.stringify(error.response));
      });
    })
  }

  
  useEffect(() => {
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"])
  }, [])

  useEffect(() => {
    // Fetch data using Axios
   fetchData()
  }, [fromDate, toDate]);

  const handleExportPdf = async () => {
    const options = {
      html: `
        <html>
          <body>
            <h1>Order Details</h1>
            <table border="1">
              <tr>
                <th>Sl. No.</th>
                <th>Order Date</th>
                <th>Production Unit</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Buyer Name</th>
                <th>Phone Number</th>
                <th>PIN code</th>
                <th>Address</th>
              </tr>
              ${results.map((order, i) => `
                <tr>
                <td>${i+1}</td>
                <td>${toIndianTime(order.createdAt)}</td>
                <td>${order.Orders[0].ProductionUnit}</td>
                <td>${order.Orders[0].ProductName}</td>
                <td>${order.Quantity}</td>
                <td>${order.BuyerName}</td>
                <td>${order.BuyerMobileNumber}</td>
                <td>${order.BuyerPinCode}</td>
                <td>${order.BuyerAddress}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>`,
      fileName: `Orders_${Date.now()}`,
      directory: '../../../../Documents',
    };
  
    try {
      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF file created:', file.filePath);
      Alert.alert("PDF created", `The PDF is saved at ${file.filePath}`)
    } catch (error) {
      console.error('Error exporting as PDF:', error);
    }
  };
  



  const renderOrderItem = ({ item }) => (
      <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
        <View style={{width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
        <Text style={{flex: 1, fontWeight: "bold", fontSize: 18}}>{item.Orders[0].ProductName}</Text>
        <Text style={{ width: "fit-content", color: "#777" }}>{toIndianTime(item.createdAt)}</Text> 
        </View>
        <Text>Quantity:&nbsp;{item.Quantity}</Text>
        <Text>Production Unit: {item.Orders[0].ProductionUnit}</Text>
        <Text>Address: {item.BuyerName}, {item.BuyerAddress}</Text>
        <Text>Phone: {item.BuyerMobileNumber}</Text>
        <Text>PIN Code: {item.BuyerPinCode}</Text>
      </View>
  );

  const handleSearchBack = () => {
    setSearchText("")
    setSearchVisible(false)
  }

  const handleSearchDone = () => {
    if (searchText === "")
    setSearchVisible(false)
    else searchRef.current?.blur()
  }



  function toIndianTime(date) {
    return `${new Date(date).getDate()}/${new Date(date).getMonth() + 1}/${new Date(date).getFullYear()}`
  }

  

  return (
    
    <View style={styles.container}>
      <View style={styles.navbar}>
          {/* Search Bar */}
          
          <View style={styles.searchBar}>
           <TouchableOpacity style={{
              borderRadius: 10,
              paddingHorizontal: 5,
              paddingTop: 3,
              marginLeft: 10
            }} onPress={searchVisible?handleSearchBack:() => navigation.goBack()}>
              <AntDesign name="left" size={25} color="white" />
            </TouchableOpacity>
            {searchVisible ? (
              <TextInput
              ref={searchRef}
                autoFocus
                style={styles.searchInput}
                placeholder="Search..."
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
              />):(<View style={{
                alignItems: "center",
                width: "76%"
            }}>
                <Text style={{
                    fontWeight: "bold",
                    fontSize: 24,
                    color: "#fff",
                    paddingLeft: 10
                }}>{"Orders"}</Text>
            </View>)
            }
            <TouchableOpacity style={{
              borderRadius: 10,
              paddingHorizontal: 5,
              paddingTop: 3,
              marginLeft: 10
            }} onPress={!searchVisible?() => setSearchVisible(true):handleSearchDone}>
              {searchVisible?<Icon name="checkmark" size={30} color="white" />:<Icon name="search" size={25} color={"white"} />}
            </TouchableOpacity>
          </View>
      </View>
    
      <View style={styles.dateButtonContainer}>
      <Button title={`From: ${toIndianTime(fromDate)}`} style={styles.dateButton} onPress={() => setFromOpen(true)}/>
      <DatePicker
        modal
        mode="date"
        maximumDate={new Date()}
        open={fromOpen}
        date={fromDate}
        onConfirm={(date) => {
          setFromOpen(false)
          setFromDate(date)
        }}
        onCancel={() => {
          setFromOpen(false)
        }}
      />
      <Button title={`To: ${toIndianTime(toDate)}`} style={styles.dateButton} onPress={() => setToOpen(true)} />
      <DatePicker
        modal
        open={toOpen}
        date={toDate}
        maximumDate={new Date()}
        mode="date"
        onConfirm={(date) => {
          setToOpen(false)
          setToDate(date)
        }}
        onCancel={() => {
            setToOpen(false)
        }}
      />
      </View>
      <KeyboardAwareScrollView style={styles.listContainer} refreshControl={
        (!loading && <RefreshControl colors={[theme.colors.primary]} refreshing={loading} onRefresh={() => {
          setToDate(new Date())
          fetchData(new Date())
        }} />)
      }>
        {loading && <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      }
      {!loading && (results.length === 0 ? (
        <View style={{padding: 40, alignItems: "center" }}>
        <Text style={{fontWeight: 500}}>No orders to show</Text>
        </View>
        ):
    <FlatList
      style={{
        width: "100%",
        flex: 1
      }}
      data={results}
      renderItem={renderOrderItem}
      keyExtractor={(item) => item.OrderId.toString()}
    />)}
    </KeyboardAwareScrollView>
    <View style={styles.exportPdf}>
        <Btn onPress={handleExportPdf} mode="contained">
            Export to PDF&nbsp;&nbsp;<FontAwesome name="print" size={20}/>
        </Btn>
    </View>
    
    </View>
  );
};

export default ProductList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        // paddingHorizontal: 16,
      },
      dateButtonContainer: { 
        paddingHorizontal: 20, 
        flexDirection: "row", 
        gap: 20, 
        justifyContent: "center",
        marginTop: 15,
        marginBottom: 10
    },
    dateButton: {
        width: 175, 
        borderRadius: 5, 
        backgroundColor: "#228896",
        height: 50,
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
      searchBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        marginBottom: 10,
        paddingRight: 20,
        paddingLeft:0,
        height: 32
      },
      searchInput: {
        backgroundColor: "#fff",
        flex: 1,
        borderColor: 'gray',
        borderWidth: 0,
        borderRadius: 5,
        fontSize: 20,
        marginRight: 10,
        paddingLeft: 5,
        marginLeft: 33
      },
      listContainer: {
        paddingHorizontal: 20
      },
      exportPdf: {
        paddingHorizontal: 100, 
      },
      loading: {
        marginTop: 70
      }
})