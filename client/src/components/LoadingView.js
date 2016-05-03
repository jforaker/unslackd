import React, { Component } from 'react-native';

const {
    View,
    StyleSheet,
    ActivityIndicatorIOS,
    Image
    } = React;

const bg = require('../../assets/bg.png');

export const LoadingView = () => (
    <View style={styles.loading}>
        <View style={styles.bg}>
            <Image source={bg}/>
        </View>
        <ActivityIndicatorIOS size='large'/>
    </View>
);

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bg: {
        position: 'absolute',
        left: 0,
        top: 150
    }
});
