import React, { useEffect, useState } from 'react';
import { View, Animated, Image, TouchableOpacity, Text, SafeAreaView, Platform, StyleSheet, StatusBar, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import firestore from '@react-native-firebase/firestore';
import { images, colors, fonts } from '../constants'
import Input from '../components/Input';
import CustomView from "../components/CustomView"
import I18n from '../i18n';
import Button from "../components/Button";
import auth from '@react-native-firebase/auth';
import { TextInput } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from "react-redux";
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { login } from '../redux/actions/loginActions';

export const CELL_SIZE = 50;
export const CELL_BORDER_RADIUS = 8;
export const DEFAULT_CELL_BG_COLOR = '#fff';
export const NOT_EMPTY_CELL_BG_COLOR = '#3557b7';
export const ACTIVE_CELL_BG_COLOR = '#f7fafe';

const { Value, Text: AnimatedText } = Animated;

const CELL_COUNT = 6;
const source = {
    uri: 'https://user-images.githubusercontent.com/4661784/56352614-4631a680-61d8-11e9-880d-86ecb053413d.png',
};

const animationsColor = [...new Array(CELL_COUNT)].map(() => new Value(0));
const animationsScale = [...new Array(CELL_COUNT)].map(() => new Value(1));
const animateCell = ({ hasValue, index, isFocused }) => {
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

export default function SignUp({ navigation }) {
    const [value, setValue] = useState('');
    const[type,setType]=useState("")
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const renderCell = ({ index, symbol, isFocused }) => {
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
            animateCell({ hasValue, index, isFocused });
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

    const dispatch = useDispatch();
    const state = useSelector((state) => state)
    const { isLogin } = state.login

    //başarılı üye olan kullanıcıyı redux tarafında isLogin=true yapıyoruz
    const setUser = (result) => {
        dispatch(login({ isLogin: true, name: name ,  number: number, uid: result.user.uid }))
    }

    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
const [password,setPassword]= useState("");

    const [displayOTPInput, setDisplayOTPInput] = useState(false)
    const [code, setCode] = useState('');
    const [confirm, setConfirm] = useState(null);
    const countryCode = '+90'


    const usernameText = I18n.t("username");
    const signInText = I18n.t("signIn")
    const phoneText = I18n.t("phone")
    const passwordText = I18n.t("password")

    async function signInWithPhoneNumber() {
        console.log("NUMBER",number)
        if (!name) {
            Alert.alert('Lütfen adınızı giriniz')
        } else if (number.length !== 10) {
            Alert.alert('Telefon numarası 10 karakter olması gerekiyor.')
        }
        else {
            const user = (await firestore().collection('users').doc(number).get()).data();
            if (user) {
                Alert.alert('Bu numara zaten kullanılıyor.')
            } else {
                const confirmation = await auth().signInWithPhoneNumber(countryCode + number);
                setConfirm(confirmation);
                setDisplayOTPInput(true)

            }
        }
    }
    async function confirmCode() {
        const result = await confirm.confirm(code);

        if (result) {
            console.log("RESULT", JSON.stringify(result, null, 4))
            // üyelik işlemleri
            // buraya gelmiş ise; şu anda üye değil demektir.
            firestore()
                .collection('users')
                .doc(number)
                .set({
                    name,
                    number,
                   // type:,
                    uid: result.user.uid,
                })
                .then(() => {
                    setUser(result)

                    // eklendi, içeriye al.
                    // redux veya mobx'te user altına;
                    // {name,
                    // number,
                    // uid: result.user.uid}


                })
                .catch((e) => {
                    console.log("ERROR:", e)
                })

        } else {
            Alert.alert('Kod Hatalı')
        }
    }

    return (
        <CustomView style={styles.container}>
            <SafeAreaView style={styles.innerContainer}>
                {displayOTPInput === false ?
                    <>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={styles.container}>

                            <View style={styles.logoContainer} >
                                <Image
                                    style={styles.logo}
                                    resizeMethod="scale"
                                    resizeMode="contain"
                                    source={images.logo} />
                            </View>

                            <View style={{ marginVertical: 15 }} >
                                <Input onChangeText={setName}
                                    placeHolder={usernameText}
                                    value={name}
                                    icon={'mail-outline'}
                                    color={colors.cFFFFFF}

                                    placeHolderTextColor={colors.cFFFFFF}
                                    style={styles.input}
                                    clearButtonMode='while-editing'

                                />
                            </View>

                 
                            <View style={{ marginVertical: 15 }} >
                                <Input
                                    value={number} onChangeText={setNumber}
                                    placeHolder={phoneText}

                                    icon={'phone'}
                                    color={colors.cFFFFFF}
                                    placeHolderTextColor={colors.cFFFFFF}
                                    style={styles.input}
                                    keyboardType="numeric"
                                    maxLength={10}
                                    clearButtonMode='while-editing'
                                />
                            </View>
                            <View style={{ marginVertical: 15 }} >

                                <Button
                                    onPress={() => signInWithPhoneNumber()}
                                    text={signInText}
                                />
                            </View>
                        </KeyboardAvoidingView>

                    </>
                    :
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
                                    text={signInText} />
                            </View>
                        </SafeAreaView>
                    </>
                }
            </SafeAreaView>
        </CustomView>




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
       // tintColor: 'white'
    },
    logoContainer: {
        marginBottom: 25,
        alignItems: "center"
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
        ...Platform.select({ web: { lineHeight: 65 } }),
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
