import React, { useEffect, useState } from "react";
import { View, Image,Animated, Text, SafeAreaView, Platform, StyleSheet, StatusBar, KeyboardAvoidingView,TouchableWithoutFeedback,Keyboard, Alert } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { images, colors, fonts } from '../constants'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../components/Input';
import { NavigationContainer } from '@react-navigation/native';
import Button from "../components/Button";
import { color } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import I18n from '../i18n';
import auth from '@react-native-firebase/auth';
import SignUpScreen from "./SignUpScreen"
import CustomView from "../components/CustomView";
import firestore from '@react-native-firebase/firestore';
import {login} from "../redux/actions/loginActions";

// Çıkış yap a basıp uygulamayı kapatıp yeniden açtığında
// yeniden giriş yapmış gibi oluyor 

import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
  } from 'react-native-confirmation-code-field';

  export const CELL_SIZE = 50;
  export const CELL_BORDER_RADIUS = 8;
  export const DEFAULT_CELL_BG_COLOR = '#fff';
  export const NOT_EMPTY_CELL_BG_COLOR = '#3557b7';
  export const ACTIVE_CELL_BG_COLOR = '#f7fafe';

  const {Value, Text: AnimatedText} = Animated;

const CELL_COUNT = 6;
const source = {
  uri: 'https://user-images.githubusercontent.com/4661784/56352614-4631a680-61d8-11e9-880d-86ecb053413d.png',
};

const animationsColor = [...new Array(CELL_COUNT)].map(() => new Value(0));
const animationsScale = [...new Array(CELL_COUNT)].map(() => new Value(1));

const animateCell = ({hasValue, index, isFocused}) => {
    Animated.parallel([
      Animated.timing(animationsColor[index], {
        useNativeDriver: false,
        toValue: isFocused ? 1 : 0,
        duration: 250,
      }),
      Animated.spring(animationsScale[index], {
        useNativeDriver: false,
        toValue: hasValue ? 0 : 1,
        duration: hasValue ? 300 : 250,
      }),
    ]).start();
  };
  
//Üye olduktan sonra ilk giriş yaparken;
//doğrulama kodu gönderilecek ve kod doğru ise asyngstorage a kayıt edilecek

export default function LoginScreen({ navigation }) {
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
      value,
      setValue,
    });

  const renderCell = ({index, symbol, isFocused}) => {
    const hasValue = Boolean(symbol);
    const animatedCellStyle = {
      backgroundColor: hasValue
        ? animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [NOT_EMPTY_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          })
        : animationsColor[index].interpolate({
            inputRange: [0, 1],
            outputRange: [DEFAULT_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          }),
      borderRadius: animationsScale[index].interpolate({
        inputRange: [0, 1],
        outputRange: [CELL_SIZE, CELL_BORDER_RADIUS],
      }),
      transform: [
        {
          scale: animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          }),
        },
      ],
    };

    // Run animation on next event loop tik
    // Because we need first return new style prop and then animate this value
    setTimeout(() => {
      animateCell({hasValue, index, isFocused});
    }, 0);

    return (
      <AnimatedText
        key={index}
        style={[styles.cell, animatedCellStyle]}
        onLayout={getCellOnLayoutHandler(index)}>
        {symbol || (isFocused ? <Cursor /> : null)}
      </AnimatedText>
    );
  };
  const [code, setCode] = useState('');
    const [number, onChangeNumber] =useState(null);
    const [confirm, setConfirm] = useState(null);
    const [displayOTPInput, setDisplayOTPInput] = useState(false)
    const countryCode = '+90'
    const usernameText = I18n.t("username");
    const passwordText = I18n.t("password");
    const rememberMeText = I18n.t("rememberMe");
    const loginText = I18n.t("login");
    const signInText = I18n.t("signIn")
    const phoneText = I18n.t("phone")

    const dispatch = useDispatch();

    const state = useSelector((state) =>state)
    const {isLogin,name,password,type} = state.login //buradaki login, store da bizim yazdığımız login, o login in stateinde de isLogin var reducers da
    const typee = useSelector((state) => state.login.type)
    const onLogin = async () => {
      
        const user = (await firestore().collection('users').doc(number).get()).data();
        if(user) {
            const confirmation = await auth().signInWithPhoneNumber(countryCode + number);
            setConfirm(confirmation);
            setDisplayOTPInput(true)
            
            // signIn fonksiyonu eklenecek ve doğrulama yapılacak
           // type: 0 admin
           // type :1 personel
        
        }else{
            console.log("Üye yok")
            Alert.alert('Bu numaraya ait bir üyelik bulunamadı!')
        }
       // dispatch(login(true))
        //telefon numarası girdi
        // girriş yap dedi
        // firestore'da user var mı yok mu baktım. (user)
        // user varsa; kodu gönderdim (üye olmuş demek)
            // kodu doğruladım.
            // user verisini redux'a yazdım
            // yönlendirme işlemi
        // user yoksa; böyle bir üye yok dedim. Önce üye ol dedim
    };
    async function confirmCode() {
        const result = await confirm.confirm(code);

        if (result) {
            await AsyncStorage.setItem('number', number)
            const user = (await firestore().collection('users').doc(number).get()).data();
             dispatch(login({isLogin:true,name:user.name,uid:user.uid,number:user.number}))
            Alert.alert("HOŞGELDİNİZ",user.name)
            navigation.navigate('Piyasa', {screen:"HomeScreen"})
 

        } else {
            Alert.alert('Kod Hatalı')
        }
    }
 return (
     <KeyboardAvoidingView 
     behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      {displayOTPInput === false ?
      //giriş yaparken doğrulama kodu girmeden önceki giriş yapma ekranı
      <> 
      <CustomView style={styles.container}>
            <SafeAreaView style={styles.innerContainer}>
                <View style={styles.logoContainer} >
                    <Image
                        style={styles.logo}
                        resizeMethod="scale"
                        resizeMode="contain"
                        source={images.logo} />
                </View>
                <View style={{ marginVertical: 15 }} >
                <Input onChangeText={onChangeNumber}
                    placeHolder={phoneText}
                    value={number}
                    icon={'phone'}
                    color={colors.cFFFFFF}
                    placeHolderTextColor={colors.cFFFFFF}
                    style={styles.input}
                    keyboardType="numeric"
                />
            </View>
           
                <View style={{ marginVertical: 15 }}>
                    <Button
                        onPress={() => onLogin()}
                        text={loginText}
                       
                    />
                    <TouchableOpacity
                    style={{alignItems:"flex-end",marginEnd:16}}
                    onPress={()=>{
                       navigation.navigate('SignUpScreen')
                    } }
                    >
                        <Text style={{color: 'rgb(255,255,255)' }} >Üye Olmak İster misiniz?</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </CustomView>
      </>
      :
      // giriş yaparken ki doğrulama kodu girme ekranı
      <>
      <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Doğrulama</Text>
      <Image style={styles.icon} source={source} />
      <Text style={styles.subTitle}>
      Lütfen doğrulama kodunu giriniz..
      </Text>

      <CodeField
        ref={ref}
        {...props}
        value={code}
        onChangeText={setCode}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={renderCell}
      />
    <View >

<Button style={styles.nextButtonText}
    onPress={() => confirmCode()}
    text="Giriş Yap" />
</View>
    </SafeAreaView>
      </>

      }

       
        </KeyboardAvoidingView>
    )

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
      
    },
    innerContainer: {
        flex: 1,
        justifyContent: "center"
    },
    logo: {
        width: 250,
        height: 250,
     //  tintColor: 'white'
    },
    logoContainer: {
        marginBottom: 25,
        alignItems: "center",
      
    },
    rememberMeContainer: {
        marginVertical: 15,
        flexDirection: "row",
        alignItems: "center",
        margin: 17
    },
    rememberMeText: {
        fontSize: fonts.f12,
        fontWeight: '500',
        color: colors.cFFFFFF
    },
    versionNumberText: {
        fontSize: fonts.f12,
        color: colors.cFFFFFF,
    },
    versionNumberContainer: {
        width: "100%",
        alignItems: "center",
        paddingBottom: 25,

    },
    input: {
        marginVertical: 5
    },
    codeFieldRoot: {
        height: CELL_SIZE,
        marginTop: 30,
        paddingHorizontal: 20,
        justifyContent: 'center',
      },
      cell: {
        marginHorizontal: 8,
        height: CELL_SIZE,
        width: CELL_SIZE,
        lineHeight: CELL_SIZE - 5,
        ...Platform.select({web: {lineHeight: 65}}),
        fontSize: 30,
        textAlign: 'center',
        borderRadius: CELL_BORDER_RADIUS,
        color: '#3759b8',
        backgroundColor: '#fff',
    
        // IOS
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    
        // Android
        elevation: 3,
      },
    
      // =======================
    
      root: {
        minHeight: 800,
        padding: 20,
      },
      title: {
        paddingTop: 50,
        color: '#000',
        fontSize: 25,
        fontWeight: '700',
        textAlign: 'center',
        paddingBottom: 40,
      },
      icon: {
        width: 217 / 2.4,
        height: 158 / 2.4,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      subTitle: {
        paddingTop: 30,
        color: '#000',
        textAlign: 'center',
      },
      nextButton: {
        marginTop: 30,
        borderRadius: 60,
        height: 60,
        backgroundColor: '#3557b7',
        justifyContent: 'center',
        minWidth: 300,
        marginBottom: 100,
      },
      nextButtonText: {
        textAlign: 'center',
        fontSize: 20,
        color: '#fff',
        fontWeight: '700',
      },
})