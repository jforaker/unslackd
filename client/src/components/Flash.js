import React, {Component} from 'react-native';

const {
    Modal,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    Image
    } = React;

const refresh = require('../../assets/refresh.png');
const logo = require('../../assets/unslack-logo-large.png');
const bg = require('../../assets/bg.png');

export default class Flash extends Component {

    refreshList() {
        this.props.getUnreads(this.props.user.token, true);
    }

    render() {

        return (
            <Modal
                animated={true}
                transparent={false}
                visible={this.props.shouldShow}
                onRequestClose={() => {this._setModalVisible(false)}}>

                <View style={styles.emptyView}>
                    <View style={styles.bg}>
                        <Image source={bg}/>
                    </View>


                    <Text style={styles.emptyText}>
                        Oh no! Could not connect to the server!
                        <Text style={styles.boldText}> Try again.</Text>
                    </Text>

                    <View style={styles.refresh}>
                        <TouchableHighlight
                            underlayColor={'transparent'}
                            onPress={() => this.refreshList()}>
                            <Image source={refresh}/>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        );
    }
}

var styles = StyleSheet.create({
    emptyView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'black',
        paddingTop: 0,
        paddingLeft: 50,
        paddingRight: 50,
    },
    bg: {
        position: 'absolute',
        left: 0,
        top: 150
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