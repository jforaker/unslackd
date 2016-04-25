import React, { Component } from 'react-native';

const {
    View,
    Text,
    StyleSheet,
    ActivityIndicatorIOS,
    } = React;


export default class LoadingView extends Component {

    render() {
        return (
            <View style={styles.loading}>
                <ActivityIndicatorIOS size='large'/>
                <Text>Loading...</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    loading: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
