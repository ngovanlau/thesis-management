import { StyleSheet } from "react-native";

export default StyleSheet.create({
    subject:{
        fontSize: 20,
        fontWeight: 'bold',
    },
    card: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginTop: 10
    },
    button: {
        backgroundColor: '#2196f3',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center'
    },
    input: {
        width: '90%',
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginBottom: 10,
        borderRadius: 5,
        fontSize: 20,
        backgroundColor: 'white',
        elevation: 5,
        shadowColor: 'black',
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
})