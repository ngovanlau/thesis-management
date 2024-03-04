import { useContext } from "react"
import { Button, View } from "react-native"
import MyContext from "../../configs/MyContext"

const Logout = () =>{
    const [, dispatch] = useContext(MyContext)
    const logout = () => {
        dispatch({
            "type": "logout"
        })
    }

    return (
        <View style={{marginEnd: 10}}>
            <Button title="Đăng xuất" onPress={logout}/>
        </View>
    )
}

export default Logout;