import { StyleSheet } from "react-native";

export default StyleSheet.create({
    card: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 16
    },
    title: {
        width: '80%',
        fontSize: 24,
        fontWeight: 'bold'
    },
    score: {
        width: '20%',
        paddingVertical: 10,
        backgroundColor: 'white', 
        borderRadius: 10,
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#2196f3',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center'
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
})