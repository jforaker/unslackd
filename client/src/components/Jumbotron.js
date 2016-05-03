import React, { Component } from 'react-native';

const {
    View,
    StyleSheet,
    Text
    } = React;

const bg = require('../../assets/bg.png');

export const Jumbotron = ({user}) => (
    <View style={[styles.top]}>
        <Text style={styles.topText}>
            <Text>Hey {user.unreads.user && user.unreads.user.name},
                <Text style={styles.boldText}> you have {user.unreads.total} unread messages </Text>
                :)
            </Text>
        </Text>
    </View>
);

const styles = StyleSheet.create({
    top: {
        flex: 0.25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    topText: {
        padding: 5,
        fontSize: 14,
        textAlign: 'center',
        color: '#A9A9A9',
    },
    boldText: {
        fontWeight: 'bold',
    },
});
