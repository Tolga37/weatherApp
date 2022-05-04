import { Text, View, StyleSheet, Pressable, Button, SafeAreaView, FlatList, Linking, TextInput } from 'react-native';
import React, { useState, useEffect } from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from "react-redux";


export default function HomeScreen() {
    FontAwesome.loadFont();
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Genel Hava Durumu</Text>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:"#012a4a",
        alignItems:"center",
        justifyContent:"center"
        
    },
    title: {
        fontSize: 25,
        margin: 10,
        fontWeight: 'bold',
        color: 'white'
    }

});