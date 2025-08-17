import React from 'react';
import { StyleSheet, View } from 'react-native';
import ImageRecognition from '../image-recognition';
export default function BlankTab() {
    return (
        <View style={styles.container}>
            <ImageRecognition></ImageRecognition>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});
