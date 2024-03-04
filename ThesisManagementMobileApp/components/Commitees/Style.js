import { StyleSheet } from "react-native";

export default StyleSheet.create({
    text:{
        fontSize: 20,
        fontWeight: 'bold',
    },
    card: {
        marginTop: 10,
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 16
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: "blue",
        marginBottom: 10
    },
    item: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 10
    },
    card: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 16
    },
    button: {
        backgroundColor: '#2196f3',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center'
    },
    picker: {
        zIndex: 999,
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
});