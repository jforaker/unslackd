import React, { Component } from 'react-native';

const {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    Image
    } = React;

const refresh = require('../../assets/refresh.png');
const logo = require('../../assets/unslack-logo-large.png');
const bg = require('../../assets/bg.png');

export default class EmptyView extends Component {

    constructor(props) {
        super(props);
        this.refreshList = this.refreshList.bind(this)
    }

    refreshList() {
        this.props.getUnreads(this.props.user.token, true);
    }

    render() {
        const { user } = this.props;

        return (
            <View style={styles.emptyView}>

                <View style={styles.bg}>
                    <Image source={bg}/>
                </View>

                <View style={styles.logo}>
                    <Image source={logo}/>
                </View>

                <Text style={styles.emptyText}>
                    Hey there {user.unreads.user && user.unreads.user.name}, you have no unread messages.
                    <Text style={styles.boldText}> Lucky you.</Text>
                </Text>

                <View style={styles.refresh}>
                    <TouchableHighlight
                        underlayColor={'transparent'}
                        onPress={() => this.refreshList()}>
                        <Image source={refresh}/>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    emptyView: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingLeft: 50,
        paddingRight: 50,
    },
    bg: {
        position: 'absolute',
        left: 0
    },
    logo: {
        paddingBottom: 30
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#A9A9A9',
        backgroundColor: 'transparent'
    },
    boldText: {
        fontWeight: 'bold',
    },
    refresh: {
        paddingTop: 20
    }
});