import React, { Component } from 'react-native';

const {
    View,
    Text,
    StyleSheet,
    TouchableHighlight
    } = React;

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
                <Text style={styles.emptyText}>
                    Hey there {user.unreads.user && user.unreads.user.name}, you have no unread messages.
                    <Text style={styles.boldText}> Lucky you.</Text>
                </Text>

                <TouchableHighlight onPress={() => this.refreshList()}>
                    <View>
                        <Text>refresh</Text>
                    </View>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    emptyView: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#A9A9A9',
    },
    boldText: {
        fontWeight: 'bold',
    },
});