import { StyleSheet } from "react-native";

export default StyleSheet.create({
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 10
    },
    item: {
        fontSize: 24,
        fontWeight: '500',
        marginBottom: 10
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
    card: {
        width: '100%',
        backgroundColor: 'white',
        alignItems: 'center',
        borderRadius: 10
    },
    subject: {
        fontSize: 24,
        fontWeight: '500',
        padding: 10,
        width: '100%'
    },
    input: {
        width: '90%',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 5,
        fontSize: 20,
        backgroundColor: 'white',
        elevation: 5,
        shadowColor: 'black',
        marginBottom: 20
    },
    picker: {
        zIndex: 100
    }
});