import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import Style from "./Style";
import MyStyle from "../../styles/MyStyle";
import { useContext, useState } from "react";
import MyContext from '../../configs/MyContext';
import API, { authAPI, endpoints } from '../../configs/API';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({navigation}) => {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false);
    const [user, dispatch] = useContext(MyContext);

    const login = async () => {
        setLoading(true)

        try {
            let res = await API.post(endpoints['login'], {
                'username': username,
                'password': password,
                'client_id': 'uzeYnfJTsi5mVDNzQeTLH53ikp9gNqcGXFzOAOqZ',
                'client_secret': 'pSVc63teoQoe6Dfnes9DksGdEW9pAbI2uUMkCmz1LU5N0rY5PGTf8gZVKPlQ43Ec74211V0DEw7i8FotI1QytI2ngOMQv7qFSvHbZkhqChuEmc4eqiiB7PuTqajdfHKu',
                'grant_type': 'password'
            })

            await AsyncStorage.setItem('access-token', res.data.access_token)
            let user = await authAPI(res.data.access_token).get(endpoints['current-user']);
            dispatch({
                type: 'login',
                payload: user.data
            })
            
            navigation.navigate('Home')
        } catch (ex) {
            Alert.alert(
                'Xác nhận',
                'Không tìm thấy thông tin tài khoản!',
                [
                    {text: 'OK', onPress: () => console.log('OK')}
                ],
                {cancelable: true}
            )
            console.error(ex)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={[MyStyle.container, MyStyle.elevation, Style.bg]}>
            <Text style={[MyStyle.mb_20, MyStyle.f_10, Style.title]}>ĐĂNG NHẬP</Text>
            <TextInput style={[Style.input, MyStyle.mb_20]} value={username} onChangeText={t => setUsername(t)} placeholder="Nhập tên đăng nhập" />
            <TextInput style={[Style.input, MyStyle.mb_20]} value={password} onChangeText={t => setPassword(t)} secureTextEntry={true} placeholder="Nhập mật khẩu" />
            {loading === true ? <ActivityIndicator/> : <>
                <TouchableOpacity style={Style.button} onPress={login}>
                    <Text style={Style.text}>ĐĂNG NHẬP</Text>
                </TouchableOpacity>
            </>}
        </View>
    )
}

export default Login;